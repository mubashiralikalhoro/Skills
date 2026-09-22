#!/usr/bin/env python
"""
speak.py - instant local text-to-speech on Apple Silicon (Kokoro-82M + MLX).

Splits the text into sentence-sized chunks, generates them in a background
thread and starts playing the first chunk while the rest are still being
synthesised, so playback begins almost immediately.

Usage:
    speak.py "Some text. It can be several sentences."
    speak.py --voice bm_george "Hello there."
    speak.py --save out.wav "Also write the audio to a file."
    speak.py --preset "Turn the clarity chain back on (crisp)."
    echo "piped text" | speak.py

US male voices: am_eric (default), am_adam, am_echo, am_fenrir, am_liam,
                am_michael, am_onyx, am_puck
UK male voices: bm_daniel, bm_fable, bm_george, bm_lewis
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import threading
import queue
import time

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio_fx

MODEL = "mlx-community/Kokoro-82M-bf16"
DEFAULT_VOICE = "am_eric"
LANG_CODE = "a"  # 'a' = American English, 'b' = British English
SAMPLE_RATE = 24_000

# A chunk is closed at a sentence end. If a sentence runs past SOFT_LIMIT
# characters it is split further at a comma/semicolon/colon so playback can
# start sooner. MIN_CHARS keeps tiny fragments ("Yes.") glued to the next
# chunk, which avoids choppy prosody.
SOFT_LIMIT = 180
MIN_CHARS = 25
FIRST_CHUNK_LIMIT = 90  # smaller first chunk => faster time-to-first-audio

_SENTENCE_END = re.compile(r"(?<=[.!?…])[\"')\]]*\s+")
_CLAUSE_END = re.compile(r"(?<=[,;:])\s+")


def _split_on(pattern: re.Pattern, text: str) -> list[str]:
    parts = [p.strip() for p in pattern.split(text)]
    return [p for p in parts if p]


def chunk_text(text: str) -> list[str]:
    """Break text into sentence-sized pieces suitable for streaming playback."""
    text = " ".join(text.split())
    if not text:
        return []

    pieces: list[str] = []
    for sentence in _split_on(_SENTENCE_END, text):
        if len(sentence) <= SOFT_LIMIT:
            pieces.append(sentence)
            continue
        # Sentence too long: fall back to clause boundaries.
        buf = ""
        for clause in _split_on(_CLAUSE_END, sentence):
            candidate = f"{buf} {clause}".strip()
            if buf and len(candidate) > SOFT_LIMIT:
                pieces.append(buf)
                buf = clause
            else:
                buf = candidate
        if buf:
            pieces.append(buf)

    # Merge fragments that are too short to stand on their own.
    merged: list[str] = []
    for piece in pieces:
        if merged and len(merged[-1]) < MIN_CHARS:
            merged[-1] = f"{merged[-1]} {piece}"
        else:
            merged.append(piece)

    # Split the very first chunk aggressively so audio starts sooner.
    if merged and len(merged[0]) > FIRST_CHUNK_LIMIT:
        head = merged[0]
        clauses = _split_on(_CLAUSE_END, head)
        if len(clauses) > 1:
            first = clauses[0]
            rest = " ".join(clauses[1:])
            if len(first) >= MIN_CHARS:
                merged[0] = rest
                merged.insert(0, first)

    return merged


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Instant local TTS (Kokoro-82M on MLX).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("text", nargs="*", help="text to speak (or pipe via stdin)")
    parser.add_argument("-v", "--voice", default=DEFAULT_VOICE, help="voice preset")
    parser.add_argument("-s", "--speed", type=float, default=1.0, help="speech rate")
    parser.add_argument("--save", metavar="FILE", help="also write a .wav file")
    parser.add_argument("--model", default=MODEL, help="MLX model repo")
    parser.add_argument("--lang", default=LANG_CODE, help="'a' US, 'b' UK")
    parser.add_argument(
        "--buffer",
        type=float,
        default=0.3,
        help="seconds of audio to buffer before playback starts",
    )
    parser.add_argument("-q", "--quiet", action="store_true", help="suppress timings")

    fx_group = parser.add_argument_group("clarity processing (off by default)")
    fx_group.add_argument(
        "--preset",
        nargs="?",
        const="crisp",
        default=None,
        choices=sorted(audio_fx.PRESETS),
        help="enable tone processing; bare --preset means 'crisp'",
    )
    fx_group.add_argument(
        "--bass", type=float, metavar="DB",
        help="low-shelf gain in dB, negative cuts boom (preset default)",
    )
    fx_group.add_argument(
        "--presence", type=float, metavar="DB",
        help="2.8 kHz consonant lift in dB (preset default)",
    )
    fx_group.add_argument(
        "--air", type=float, metavar="DB", help="high-shelf gain in dB",
    )
    fx_group.add_argument(
        "--hpf", type=float, metavar="HZ", help="high-pass cutoff, 0 disables",
    )
    args = parser.parse_args()

    text = " ".join(args.text).strip()
    if not text and not sys.stdin.isatty():
        text = sys.stdin.read().strip()
    if not text:
        parser.error("no text given")

    chunks = chunk_text(text)
    if not chunks:
        parser.error("nothing to say")

    def log(msg: str) -> None:
        if not args.quiet:
            print(msg, file=sys.stderr, flush=True)

    t0 = time.perf_counter()

    # Imports are deferred so --help stays instant.
    import numpy as np
    from mlx_audio.tts.audio_player import AudioPlayer
    from mlx_audio.tts.utils import load_model

    model = load_model(model_path=args.model)
    log(f"model ready in {time.perf_counter() - t0:.2f}s · {len(chunks)} chunk(s)")

    tone_overrides = (args.bass, args.presence, args.air, args.hpf)
    preset = args.preset
    if preset is None and any(v is not None for v in tone_overrides):
        preset = "crisp"  # a manual tone tweak implies processing

    if preset is None:
        fx = None
        log("clarity processing: off (raw model output)")
    else:
        fx = audio_fx.build(
            preset,
            sample_rate=SAMPLE_RATE,
            bass_db=args.bass,
            presence_db=args.presence,
            air_db=args.air,
            hpf_hz=args.hpf,
        )
        log(f"clarity processing: {preset}")

    player = AudioPlayer(sample_rate=SAMPLE_RATE)
    player.min_buffer_seconds = args.buffer

    saved: list[np.ndarray] = []
    audio_q: queue.Queue = queue.Queue()
    error: list[BaseException] = []

    def produce() -> None:
        """Synthesise chunks in order and hand them to the player as they land."""
        try:
            for idx, chunk in enumerate(chunks):
                started = time.perf_counter()
                for result in model.generate(
                    text=chunk,
                    voice=args.voice,
                    speed=args.speed,
                    lang_code=args.lang,
                    verbose=False,
                ):
                    samples = np.asarray(result.audio, dtype=np.float32).reshape(-1)
                    if not samples.size:
                        continue
                    if fx is not None:
                        samples = fx(samples)
                    audio_q.put(samples)
                if idx == 0:
                    log(f"first audio after {time.perf_counter() - t0:.2f}s")
                else:
                    log(f"chunk {idx + 1}/{len(chunks)} in {time.perf_counter() - started:.2f}s")
        except BaseException as exc:  # surfaced on the main thread
            error.append(exc)
        finally:
            audio_q.put(None)

    worker = threading.Thread(target=produce, name="tts-producer", daemon=True)
    worker.start()

    try:
        while True:
            samples = audio_q.get()
            if samples is None:
                break
            player.queue_audio(samples)
            if args.save:
                saved.append(samples)
        player.wait_for_drain()
    except KeyboardInterrupt:
        player.flush()
        log("stopped")
        return 130
    finally:
        player.stop()
        worker.join(timeout=1)

    if error:
        print(f"error: {error[0]}", file=sys.stderr)
        return 1

    if args.save and saved:
        import soundfile as sf

        sf.write(args.save, np.concatenate(saved), SAMPLE_RATE)
        log(f"saved {args.save}")

    log(f"done in {time.perf_counter() - t0:.2f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
