"""
audio_fx.py - speech clarity chain for the Kokoro output.

Kokoro's male voices carry a lot of low-mid energy: chest boom around
150-250 Hz plus "box" around 400-500 Hz. That masks consonants and makes
words hard to pick out. This module cuts those regions, lifts the 2-4 kHz
presence band where consonant intelligibility lives, then evens the level
out with a gentle compressor and a limiter.

Filters keep their state between calls (`Clarity` is stateful), so a long
text processed chunk-by-chunk sounds identical to processing it in one go.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from scipy.signal import lfilter, lfilter_zi

# ---------------------------------------------------------------------------
# RBJ audio-EQ-cookbook biquads. Each returns (b, a) normalised by a0.
# ---------------------------------------------------------------------------


def _norm(b0, b1, b2, a0, a1, a2):
    return (
        np.array([b0 / a0, b1 / a0, b2 / a0], dtype=np.float64),
        np.array([1.0, a1 / a0, a2 / a0], dtype=np.float64),
    )


def highpass(freq: float, sr: int, q: float = 0.707):
    w0 = 2.0 * np.pi * freq / sr
    cos_w0, alpha = np.cos(w0), np.sin(w0) / (2.0 * q)
    return _norm(
        (1 + cos_w0) / 2, -(1 + cos_w0), (1 + cos_w0) / 2,
        1 + alpha, -2 * cos_w0, 1 - alpha,
    )


def low_shelf(freq: float, gain_db: float, sr: int, slope: float = 0.9):
    a = 10 ** (gain_db / 40.0)
    w0 = 2.0 * np.pi * freq / sr
    cos_w0, sin_w0 = np.cos(w0), np.sin(w0)
    alpha = sin_w0 / 2.0 * np.sqrt((a + 1 / a) * (1 / slope - 1) + 2)
    two_sqrt_a_alpha = 2 * np.sqrt(a) * alpha
    return _norm(
        a * ((a + 1) - (a - 1) * cos_w0 + two_sqrt_a_alpha),
        2 * a * ((a - 1) - (a + 1) * cos_w0),
        a * ((a + 1) - (a - 1) * cos_w0 - two_sqrt_a_alpha),
        (a + 1) + (a - 1) * cos_w0 + two_sqrt_a_alpha,
        -2 * ((a - 1) + (a + 1) * cos_w0),
        (a + 1) + (a - 1) * cos_w0 - two_sqrt_a_alpha,
    )


def high_shelf(freq: float, gain_db: float, sr: int, slope: float = 0.9):
    a = 10 ** (gain_db / 40.0)
    w0 = 2.0 * np.pi * freq / sr
    cos_w0, sin_w0 = np.cos(w0), np.sin(w0)
    alpha = sin_w0 / 2.0 * np.sqrt((a + 1 / a) * (1 / slope - 1) + 2)
    two_sqrt_a_alpha = 2 * np.sqrt(a) * alpha
    return _norm(
        a * ((a + 1) + (a - 1) * cos_w0 + two_sqrt_a_alpha),
        -2 * a * ((a - 1) + (a + 1) * cos_w0),
        a * ((a + 1) + (a - 1) * cos_w0 - two_sqrt_a_alpha),
        (a + 1) - (a - 1) * cos_w0 + two_sqrt_a_alpha,
        2 * ((a - 1) - (a + 1) * cos_w0),
        (a + 1) - (a - 1) * cos_w0 - two_sqrt_a_alpha,
    )


def peaking(freq: float, gain_db: float, sr: int, q: float = 1.0):
    a = 10 ** (gain_db / 40.0)
    w0 = 2.0 * np.pi * freq / sr
    cos_w0, alpha = np.cos(w0), np.sin(w0) / (2.0 * q)
    return _norm(
        1 + alpha * a, -2 * cos_w0, 1 - alpha * a,
        1 + alpha / a, -2 * cos_w0, 1 - alpha / a,
    )


class _Biquad:
    """A single IIR section that remembers its state across chunks."""

    def __init__(self, b, a):
        self.b, self.a = b, a
        self.zi = lfilter_zi(b, a) * 0.0

    def __call__(self, x: np.ndarray) -> np.ndarray:
        y, self.zi = lfilter(self.b, self.a, x, zi=self.zi)
        return y


# ---------------------------------------------------------------------------
# Presets
# ---------------------------------------------------------------------------


@dataclass
class Preset:
    hpf_hz: float = 90.0          # rumble cut
    bass_db: float = -5.0         # low-shelf, tames chest boom
    bass_hz: float = 220.0
    mud_db: float = -3.0          # "box" / mud notch
    mud_hz: float = 420.0
    presence_db: float = 4.0      # consonant intelligibility
    presence_hz: float = 2800.0
    presence_q: float = 0.9
    air_db: float = 1.5           # high shelf, a touch of openness
    air_hz: float = 7500.0
    comp_threshold_db: float = -20.0
    comp_ratio: float = 3.0
    comp_attack_ms: float = 8.0
    comp_release_ms: float = 140.0
    makeup_db: float = 0.0        # 0 = auto from threshold/ratio
    target_peak_db: float = -1.5


PRESETS: dict[str, Preset] = {
    # Default: maximum word-by-word intelligibility.
    "clarity": Preset(),
    # Same idea, pushed harder. For noisy rooms or laptop speakers.
    "crisp": Preset(
        hpf_hz=110.0, bass_db=-7.0, mud_db=-4.0,
        presence_db=6.0, presence_hz=3200.0, air_db=2.5,
        comp_threshold_db=-22.0, comp_ratio=3.5,
    ),
    # Keeps more low end, only fixes the worst of the mud.
    "warm": Preset(
        hpf_hz=75.0, bass_db=-2.0, mud_db=-1.5,
        presence_db=2.5, air_db=1.0, comp_ratio=2.0,
    ),
    # Level control only, no tonal change.
    "flat": Preset(
        hpf_hz=0.0, bass_db=0.0, mud_db=0.0, presence_db=0.0, air_db=0.0,
    ),
}


# ---------------------------------------------------------------------------
# The chain
# ---------------------------------------------------------------------------


@dataclass
class Clarity:
    """Stateful speech-clarity processor. Call it once per audio chunk."""

    sample_rate: int = 24_000
    preset: Preset = field(default_factory=Preset)

    def __post_init__(self) -> None:
        sr, p = self.sample_rate, self.preset
        self._stages: list[_Biquad] = []

        if p.hpf_hz > 0:
            self._stages.append(_Biquad(*highpass(p.hpf_hz, sr)))
        if p.bass_db:
            self._stages.append(_Biquad(*low_shelf(p.bass_hz, p.bass_db, sr)))
        if p.mud_db:
            self._stages.append(_Biquad(*peaking(p.mud_hz, p.mud_db, sr, q=1.1)))
        if p.presence_db:
            self._stages.append(
                _Biquad(*peaking(p.presence_hz, p.presence_db, sr, q=p.presence_q))
            )
        if p.air_db:
            self._stages.append(_Biquad(*high_shelf(p.air_hz, p.air_db, sr)))

        # Compressor state, carried across chunks.
        self._env = 0.0
        self._attack = np.exp(-1.0 / (sr * p.comp_attack_ms / 1000.0))
        self._release = np.exp(-1.0 / (sr * p.comp_release_ms / 1000.0))

        if p.makeup_db:
            self._makeup = 10 ** (p.makeup_db / 20.0)
        else:
            # Auto makeup: restore roughly what the ratio took off the peaks.
            reduction = abs(p.comp_threshold_db) * (1 - 1 / max(p.comp_ratio, 1.0))
            self._makeup = 10 ** (min(reduction * 0.6, 9.0) / 20.0)

        self._ceiling = 10 ** (p.target_peak_db / 20.0)

    # -- compressor ---------------------------------------------------------

    def _compress(self, x: np.ndarray) -> np.ndarray:
        p = self.preset
        if p.comp_ratio <= 1.0:
            return x

        threshold = 10 ** (p.comp_threshold_db / 20.0)
        env = self._env
        atk, rel = self._attack, self._release
        gain = np.empty_like(x)

        # Sample-accurate envelope follower. Chunks are a few seconds at
        # 24 kHz, so the Python loop stays cheap relative to synthesis.
        abs_x = np.abs(x)
        for i in range(x.size):
            level = abs_x[i]
            coeff = atk if level > env else rel
            env = coeff * env + (1.0 - coeff) * level
            if env > threshold:
                over_db = 20.0 * np.log10(max(env, 1e-9) / threshold)
                cut_db = over_db * (1.0 - 1.0 / p.comp_ratio)
                gain[i] = 10 ** (-cut_db / 20.0)
            else:
                gain[i] = 1.0

        self._env = env
        return x * gain

    # -- public -------------------------------------------------------------

    def __call__(self, samples: np.ndarray) -> np.ndarray:
        x = np.asarray(samples, dtype=np.float64).reshape(-1)
        if not x.size:
            return np.zeros(0, dtype=np.float32)

        for stage in self._stages:
            x = stage(x)

        x = self._compress(x) * self._makeup

        # Soft-knee limiter, then a hard clamp as a safety net.
        knee = self._ceiling * 0.85
        over = np.abs(x) > knee
        if np.any(over):
            excess = (np.abs(x[over]) - knee) / max(self._ceiling - knee, 1e-9)
            x[over] = np.sign(x[over]) * (knee + (self._ceiling - knee) * np.tanh(excess))
        np.clip(x, -self._ceiling, self._ceiling, out=x)

        return x.astype(np.float32)


def build(preset: str = "clarity", sample_rate: int = 24_000, **overrides) -> Clarity:
    """Build a processor from a preset name plus optional field overrides."""
    if preset not in PRESETS:
        raise ValueError(f"unknown preset {preset!r}; choose from {sorted(PRESETS)}")
    base = PRESETS[preset]
    params = {**base.__dict__, **{k: v for k, v in overrides.items() if v is not None}}
    return Clarity(sample_rate=sample_rate, preset=Preset(**params))
