"""
hotkey.py - global key listener that interrupts speech.

While the daemon is speaking, a single Shift press stops playback immediately,
so the user can cut Claude off and start typing without touching the terminal.

macOS gates global key monitoring behind Accessibility permission. The listener
degrades quietly when permission is missing: speech still works, only the hotkey
is inert, and `status()` explains how to grant it.
"""

from __future__ import annotations

import os
import threading
import time
from typing import Callable

# Friendly name -> the pynput key attribute names it covers.
KEY_ALIASES: dict[str, tuple[str, ...]] = {
    "shift": ("shift", "shift_l", "shift_r"),
    "ctrl": ("ctrl", "ctrl_l", "ctrl_r"),
    "alt": ("alt", "alt_l", "alt_r"),
    "cmd": ("cmd", "cmd_l", "cmd_r"),
    "esc": ("esc",),
    "space": ("space",),
    "f8": ("f8",),
}

PERMISSION_HINT = (
    "grant Accessibility permission to your terminal app: "
    "System Settings > Privacy & Security > Accessibility"
)

SETTINGS_URL = (
    "x-apple.systempreferences:com.apple.preference.security"
    "?Privacy_Accessibility"
)


def responsible_app() -> str:
    """Which application macOS will ask the user to authorise.

    Accessibility is granted to the app that owns the process, not to Python.
    Switching from Terminal to iTerm silently loses the permission, so name the
    current one explicitly rather than saying "your terminal".
    """
    bundle = os.environ.get("__CFBundleIdentifier", "")
    term = os.environ.get("TERM_PROGRAM", "")

    known = {
        "com.googlecode.iterm2": "iTerm",
        "com.apple.Terminal": "Terminal",
        "dev.warp.Warp-Stable": "Warp",
        "com.microsoft.VSCode": "Visual Studio Code",
        "com.todesktop.230313mzl4w4u92": "Cursor",
        "co.zeit.hyper": "Hyper",
    }
    if bundle in known:
        return known[bundle]
    if term:
        return term.replace(".app", "").replace("_", " ")
    return "your terminal app"


def request_trust() -> bool:
    """Ask macOS to show the Accessibility permission prompt.

    Returns True if already trusted. The prompt is only shown once per app by
    the system, so also open the settings pane as a fallback.
    """
    try:
        from ApplicationServices import (  # type: ignore
            AXIsProcessTrustedWithOptions,
            kAXTrustedCheckOptionPrompt,
        )

        return bool(AXIsProcessTrustedWithOptions({kAXTrustedCheckOptionPrompt: True}))
    except Exception:
        return bool(is_trusted())


def open_settings() -> None:
    import subprocess

    try:
        subprocess.run(["open", SETTINGS_URL], check=False,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass


def is_trusted() -> bool | None:
    """True/False if macOS accessibility trust can be determined, else None."""
    try:
        from ApplicationServices import AXIsProcessTrusted  # type: ignore

        return bool(AXIsProcessTrusted())
    except Exception:
        try:
            from Quartz import CGPreflightListenEventAccess  # type: ignore

            return bool(CGPreflightListenEventAccess())
        except Exception:
            return None


class HotkeyStopper:
    """Calls `on_stop` whenever the configured key is pressed."""

    def __init__(
        self,
        on_stop: Callable[[], None],
        key: str = "shift",
        debounce: float = 0.4,
    ) -> None:
        self.on_stop = on_stop
        self.key_name = key.lower()
        self.debounce = debounce
        self.active = False
        self.message = "not started"
        self._last = 0.0
        self._listener = None

    def _matches(self, pressed) -> bool:
        from pynput import keyboard

        names = KEY_ALIASES.get(self.key_name)
        if names is None:  # a plain character key, e.g. "q"
            return getattr(pressed, "char", None) == self.key_name

        for name in names:
            candidate = getattr(keyboard.Key, name, None)
            if candidate is not None and pressed == candidate:
                return True
        return False

    def _on_press(self, pressed) -> None:
        if not self._matches(pressed):
            return
        # Holding a key repeats; only the first press in a window counts.
        now = time.monotonic()
        if now - self._last < self.debounce:
            return
        self._last = now
        try:
            self.on_stop()
        except Exception:
            pass

    def start(self) -> bool:
        try:
            from pynput import keyboard
        except ImportError:
            self.message = "pynput not installed; hotkey disabled"
            return False

        trusted = is_trusted()
        if trusted is False:
            self.message = (
                f"no Accessibility permission for {responsible_app()}; "
                f"run: say.py --grant"
            )
            return False

        try:
            self._listener = keyboard.Listener(on_press=self._on_press)
            self._listener.daemon = True
            self._listener.start()
        except Exception as exc:
            self.message = f"listener failed ({exc}); run: say.py --grant"
            return False

        # A listener that lacks permission dies shortly after starting rather
        # than raising, so confirm it is still alive before claiming success.
        time.sleep(0.4)
        if not self._listener.is_alive():
            self.message = (
                f"listener died on start - {responsible_app()} lacks "
                f"Accessibility permission; run: say.py --grant"
            )
            return False

        self.active = True
        self.message = f"{self.key_name} stops playback"
        return True

    def stop(self) -> None:
        if self._listener is not None:
            try:
                self._listener.stop()
            except Exception:
                pass
        self.active = False

    def status(self) -> dict:
        return {"active": self.active, "key": self.key_name, "message": self.message}
