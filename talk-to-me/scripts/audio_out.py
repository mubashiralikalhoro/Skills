"""
audio_out.py - output device selection for the TTS daemon.

PortAudio enumerates devices once when it initialises. The daemon is long
lived, so a headset connected after startup is invisible to it and audio keeps
going to whatever was default at boot - usually the laptop speakers.

The fix is simply to re-initialise before every utterance (about two
milliseconds) and follow whatever macOS currently has set as the default
output. macOS already switches that to headphones when they connect and back
to the speakers when they go, so following it needs no guessing and respects
any choice made in Sound settings.

The only devices skipped are virtual ones - Teams, Zoom, BlackHole, Loopback
and friends accept audio but are not speakers, so speech sent there is lost
silently. Extra exclusions can be listed in ~/.talk-to-me/blocked_devices.
"""

from __future__ import annotations

import os
import re

RUNTIME_DIR = os.path.expanduser("~/.talk-to-me")
BLOCKLIST_PATH = os.path.join(RUNTIME_DIR, "blocked_devices")

_BUILTIN = re.compile(r"macbook|built-?in|internal", re.I)

# Accepts audio but is not a speaker. Never auto-pick one of these.
_VIRTUAL = re.compile(
    r"teams|zoom|discord|blackhole|soundflower|loopback|aggregate|multi-output|"
    r"virtual|ndi|obs|krisp|voicemeeter|sound\s*siphon",
    re.I,
)


def _user_blocklist() -> list[str]:
    """Device names to never use, one substring per line."""
    try:
        with open(BLOCKLIST_PATH) as handle:
            return [
                line.strip().lower()
                for line in handle
                if line.strip() and not line.startswith("#")
            ]
    except OSError:
        return []


def refresh() -> None:
    """Re-scan the audio devices, picking up anything plugged in since boot."""
    import sounddevice as sd

    try:
        sd._terminate()
        sd._initialize()
    except Exception:
        pass


def outputs() -> list[tuple[int, str]]:
    import sounddevice as sd

    result = []
    try:
        for index, dev in enumerate(sd.query_devices()):
            if dev.get("max_output_channels", 0) > 0:
                result.append((index, dev["name"]))
    except Exception:
        pass
    return result


def is_builtin(name: str) -> bool:
    return bool(_BUILTIN.search(name))


def is_virtual(name: str) -> bool:
    return bool(_VIRTUAL.search(name))


def is_blocked(name: str) -> bool:
    if is_virtual(name):
        return True
    lowered = name.lower()
    return any(entry in lowered for entry in _user_blocklist())


def current_output() -> tuple[int | None, str]:
    """The device macOS currently has set as default output."""
    import sounddevice as sd

    try:
        index = sd.default.device[1]
        if index is None or index < 0:
            return None, "none"
        return index, sd.query_devices(index)["name"]
    except Exception:
        return None, "unknown"


def resolve(prefer: str = "system") -> tuple[int | None, str]:
    """Refresh devices, then follow the macOS default output.

    prefer:
      "system"   use the current macOS default output (default behaviour)
      "builtin"  force the laptop speakers
      <text>     match a device by name substring or index
    """
    import sounddevice as sd

    refresh()
    devices = outputs()
    if not devices:
        return None, "none"

    chosen: int | None = None

    if prefer and prefer not in ("system", "auto"):
        if prefer == "builtin":
            for index, name in devices:
                if is_builtin(name):
                    chosen = index
                    break
        elif prefer.isdigit() and any(i == int(prefer) for i, _ in devices):
            chosen = int(prefer)
        else:
            for index, name in devices:
                if prefer.lower() in name.lower():
                    chosen = index
                    break

    if chosen is None:
        index, name = current_output()
        if index is not None and not is_blocked(name):
            chosen = index
        else:
            # System default is a virtual/blocked device; fall back to a real
            # one rather than speaking into a void.
            for candidate, candidate_name in devices:
                if not is_blocked(candidate_name):
                    chosen = candidate
                    break

    if chosen is None:
        return None, "none"

    try:
        current_in = sd.default.device[0]
        sd.default.device = (current_in, chosen)
        return chosen, sd.query_devices(chosen)["name"]
    except Exception:
        return chosen, "unknown"
