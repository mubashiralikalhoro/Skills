#!/usr/bin/env python
"""
say.py - thin client for the speakd TTS daemon.

Starts the daemon on first use (paying the one-time model load), then every
later call hands text over a unix socket and returns immediately, so speech
plays while the caller carries on.

    say.py "Text to speak."
    say.py --wait "Block until it finishes."
    say.py --stop                 interrupt playback
    say.py --mode on              turn talk mode on for THIS session (persists)
    say.py --mode off             turn it off for this session, stop playback
    say.py --mode off --all       silence every session
    say.py --mode check           print on | off
    say.py --mode list            which sessions have it on
    say.py --if-on "text"         speak only if this session's mode is on
    say.py --status               daemon + mode + hotkey state
    say.py --grant                fix the Shift hotkey permission
    say.py --shutdown             stop the daemon
    echo "piped" | say.py
"""

from __future__ import annotations

import argparse
import json
import os
import re
import socket
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
RUNTIME_DIR = os.path.expanduser("~/.talk-to-me")
SOCKET_PATH = os.path.join(RUNTIME_DIR, "speakd.sock")
LOG_PATH = os.path.join(RUNTIME_DIR, "speakd.log")
MODE_DIR = os.path.join(RUNTIME_DIR, "modes")
LEGACY_MODE_PATH = os.path.join(RUNTIME_DIR, "mode")
MODE_MAX_AGE_DAYS = 30

# The daemon needs the project venv, which has mlx-audio installed.
VENV_PYTHON = os.path.join(HERE, ".venv", "bin", "python")
BOOT_TIMEOUT = 180.0


def session_key(override: str | None = None) -> str:
    """Identify the calling session.

    Talk mode is per session: turning it on in one Claude window must not make
    another window start talking. CLAUDE_CODE_SESSION_ID is a stable UUID for
    the life of a session, which is exactly the scope wanted here.
    """
    if override:
        return re.sub(r"[^A-Za-z0-9_.-]", "_", override)[:120]

    for var in ("CLAUDE_CODE_SESSION_ID", "TERM_SESSION_ID"):
        value = os.environ.get(var)
        if value:
            return re.sub(r"[^A-Za-z0-9_.-]", "_", value)[:120]

    # Last resort: the parent process. Weaker (dies with the shell) but it
    # still keeps unrelated sessions apart.
    return f"ppid-{os.getppid()}"


def mode_path(override: str | None = None) -> str:
    return os.path.join(MODE_DIR, session_key(override))


def mode_is_on(override: str | None = None) -> bool:
    try:
        with open(mode_path(override)) as handle:
            return handle.read().strip() == "on"
    except OSError:
        return False


def _prune_stale_modes() -> None:
    """Sessions are transient; their mode files should not pile up forever."""
    cutoff = time.time() - MODE_MAX_AGE_DAYS * 86400
    try:
        for name in os.listdir(MODE_DIR):
            path = os.path.join(MODE_DIR, name)
            try:
                if os.path.getmtime(path) < cutoff:
                    os.unlink(path)
            except OSError:
                pass
    except OSError:
        pass


def set_mode(on: bool, override: str | None = None) -> None:
    os.makedirs(MODE_DIR, exist_ok=True)
    with open(mode_path(override), "w") as handle:
        handle.write("on" if on else "off")
    # The old single-file location would otherwise shadow nothing but confuse
    # anyone reading the directory.
    if os.path.exists(LEGACY_MODE_PATH):
        try:
            os.unlink(LEGACY_MODE_PATH)
        except OSError:
            pass
    _prune_stale_modes()


def modes_on() -> list[str]:
    """Session keys that currently have talk mode on."""
    result = []
    try:
        for name in sorted(os.listdir(MODE_DIR)):
            try:
                with open(os.path.join(MODE_DIR, name)) as handle:
                    if handle.read().strip() == "on":
                        result.append(name)
            except OSError:
                pass
    except OSError:
        pass
    return result


def set_all_modes_off() -> int:
    count = 0
    try:
        for name in os.listdir(MODE_DIR):
            path = os.path.join(MODE_DIR, name)
            try:
                with open(path) as handle:
                    if handle.read().strip() != "on":
                        continue
                with open(path, "w") as handle:
                    handle.write("off")
                count += 1
            except OSError:
                pass
    except OSError:
        pass
    return count


def _request(payload: dict, timeout: float = 600.0) -> dict | None:
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect(SOCKET_PATH)
    except (FileNotFoundError, ConnectionRefusedError, socket.timeout, OSError):
        return None

    try:
        sock.sendall((json.dumps(payload) + "\n").encode())
        data = b""
        while not data.endswith(b"\n"):
            part = sock.recv(65536)
            if not part:
                break
            data += part
        return json.loads(data.decode()) if data.strip() else {"ok": True}
    except (socket.timeout, OSError, json.JSONDecodeError):
        # Daemon is still booting, or went away mid-request.
        return None
    finally:
        sock.close()


def is_running() -> bool:
    return _request({"cmd": "ping"}, timeout=5.0) is not None


def ensure_daemon(quiet: bool = False) -> bool:
    if is_running():
        return True

    python = VENV_PYTHON if os.path.exists(VENV_PYTHON) else sys.executable
    os.makedirs(RUNTIME_DIR, exist_ok=True)

    if not quiet:
        print("starting TTS daemon (one-time model load)...", file=sys.stderr, flush=True)

    with open(LOG_PATH, "ab") as logfile:
        subprocess.Popen(
            [python, os.path.join(HERE, "speakd.py")],
            stdout=logfile,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            start_new_session=True,  # survives this process exiting
            cwd=HERE,
        )

    deadline = time.time() + BOOT_TIMEOUT
    while time.time() < deadline:
        if is_running():
            if not quiet:
                print("daemon ready", file=sys.stderr, flush=True)
            return True
        time.sleep(0.25)

    print(f"daemon failed to start; see {LOG_PATH}", file=sys.stderr)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Speak text via the speakd daemon.")
    parser.add_argument("text", nargs="*")
    parser.add_argument("-v", "--voice", help="override voice for this line")
    parser.add_argument("-p", "--preset", help="override tone preset")
    parser.add_argument("-s", "--speed", type=float, help="speech rate")
    parser.add_argument("--wait", action="store_true", help="block until spoken")
    parser.add_argument("--stop", action="store_true", help="interrupt playback")
    parser.add_argument("--status", action="store_true", help="report daemon state")
    parser.add_argument("--start", action="store_true", help="preload the daemon")
    parser.add_argument("--shutdown", action="store_true", help="stop the daemon")
    parser.add_argument(
        "--mode",
        choices=["on", "off", "check", "list"],
        help="turn talk mode on/off for THIS session, print its state, or list sessions",
    )
    parser.add_argument(
        "--session",
        help="act on another session's mode instead of this one",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="with --mode off, silence every session",
    )
    parser.add_argument(
        "--if-on",
        action="store_true",
        help="speak only when talk mode is on, otherwise do nothing",
    )
    parser.add_argument(
        "--grant",
        action="store_true",
        help="request Accessibility permission so the Shift hotkey works",
    )
    parser.add_argument("-q", "--quiet", action="store_true")
    args = parser.parse_args()

    if args.grant:
        sys.path.insert(0, HERE)
        import hotkey

        app = hotkey.responsible_app()
        if hotkey.is_trusted():
            print(f"{app} already has Accessibility permission.")
            print("If Shift still does nothing, restart the daemon:")
            print("  say.py --shutdown && say.py --start")
            return 0

        print(f"The Shift hotkey needs Accessibility permission for: {app}")
        print()
        print("A system dialog should appear now. If it does not, or you")
        print("dismissed it, the Settings pane is opening too:")
        print(f"  System Settings > Privacy & Security > Accessibility")
        print(f"  -> enable {app}")
        print()
        hotkey.request_trust()
        hotkey.open_settings()
        print("After enabling it, run:")
        print("  say.py --shutdown && say.py --start")
        return 0

    if args.mode == "check":
        print("on" if mode_is_on(args.session) else "off")
        return 0

    if args.mode == "list":
        on = modes_on()
        mine = session_key(args.session)
        if not on:
            print("no sessions have talk mode on")
        for key in on:
            print(f"{key}{'  <- this session' if key == mine else ''}")
        return 0

    if args.mode == "on":
        set_mode(True, args.session)
        ok = ensure_daemon(args.quiet)
        if not args.quiet:
            print(f"talk mode: on (session {session_key(args.session)[:8]})", file=sys.stderr)
        return 0 if ok else 1

    if args.mode == "off":
        if args.all:
            count = set_all_modes_off()
            _request({"cmd": "stop"}, timeout=5.0)
            if not args.quiet:
                print(f"talk mode: off for {count} session(s)", file=sys.stderr)
            return 0
        set_mode(False, args.session)
        _request({"cmd": "stop"}, timeout=5.0)
        if not args.quiet:
            print(f"talk mode: off (session {session_key(args.session)[:8]})", file=sys.stderr)
        return 0

    if args.status:
        reply = _request({"cmd": "ping"}, timeout=5.0)
        if reply is None:
            print("stopped")
            return 0
        hk = reply.get("hotkey") or {}
        state = "speaking" if reply.get("speaking") else "idle"
        mode = "on" if mode_is_on() else "off"
        device = reply.get("device")
        others = [k for k in modes_on() if k != session_key()]
        if others:
            mode += f" (+{len(others)} other session(s) on)"
        out = f" · out: {device}" if device else ""
        if hk.get("active"):
            print(f"running ({state}) · talk mode: {mode}{out} · hotkey: {hk.get('message')}")
        else:
            print(f"running ({state}) · talk mode: {mode}{out} · hotkey off: {hk.get('message', 'disabled')}")
        return 0

    if args.stop:
        _request({"cmd": "stop"}, timeout=5.0)
        return 0

    if args.shutdown:
        _request({"cmd": "shutdown"}, timeout=5.0)
        return 0

    if args.start and not args.text:
        return 0 if ensure_daemon(args.quiet) else 1

    text = " ".join(args.text).strip()
    if not text and not sys.stdin.isatty():
        text = sys.stdin.read().strip()
    if not text:
        parser.error("no text given")

    # The on-disk mode is the source of truth: a caller that has lost track of
    # the state cannot accidentally speak after the user asked for silence.
    if args.if_on and not mode_is_on(args.session):
        return 0

    if not ensure_daemon(args.quiet):
        return 1

    payload = {"text": text, "wait": bool(args.wait)}
    if args.voice:
        payload["voice"] = args.voice
    if args.preset:
        payload["preset"] = args.preset
    if args.speed:
        payload["speed"] = args.speed

    reply = _request(payload)
    if reply is None:
        print("daemon went away", file=sys.stderr)
        return 1
    if not reply.get("ok"):
        print(f"error: {reply.get('error')}", file=sys.stderr)
        return 1
    if args.wait and not args.quiet:
        print(f"spoke {reply.get('chunks')} chunk(s), first audio {reply.get('latency')}s",
              file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
