#!/usr/bin/env python
"""
speakd.py - resident TTS daemon.

Loading Kokoro plus the spaCy phonemiser costs ~5 seconds. Paying that once
per spoken sentence makes conversation unusable, so this daemon pays it once
at startup, warms the pipeline, and then serves synthesis requests over a unix
socket with sub-second latency.

Protocol: one JSON object per connection, newline terminated.

    -> {"text": "hello", "voice": "am_eric", "preset": "crisp", "wait": false}
    <- {"ok": true, "chunks": 2, "latency": 0.31}

    -> {"cmd": "stop"}     interrupt whatever is playing
    -> {"cmd": "ping"}     readiness probe
    -> {"cmd": "shutdown"} exit

Run directly to start in the foreground; `say.py` starts it on demand.
"""

from __future__ import annotations

import json
import os
import queue
import socket
import sys
import threading
import time

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import audio_fx
import audio_out
import hotkey as hotkey_mod
import speak as speak_mod

RUNTIME_DIR = os.path.expanduser("~/.talk-to-me")
SOCKET_PATH = os.path.join(RUNTIME_DIR, "speakd.sock")
LOG_PATH = os.path.join(RUNTIME_DIR, "speakd.log")

MODEL = "mlx-community/Kokoro-82M-bf16"
SAMPLE_RATE = 24_000
DEFAULT_VOICE = "am_eric"
DEFAULT_PRESET = "crisp"
DEFAULT_STOP_KEY = "shift"
DEFAULT_DEVICE = "system"


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


class Speaker:
    """Owns the model and the audio device. One synthesis job at a time."""

    def __init__(self, voice: str, preset: str, device: str = DEFAULT_DEVICE) -> None:
        import numpy as np
        from mlx_audio.tts.audio_player import AudioPlayer
        from mlx_audio.tts.utils import load_model

        self._np = np
        self._AudioPlayer = AudioPlayer

        t0 = time.perf_counter()
        self.model = load_model(model_path=MODEL)
        log(f"model loaded in {time.perf_counter() - t0:.2f}s")

        self.voice = voice
        self.preset = preset
        self.device_pref = device
        self._last_device = None
        self.lock = threading.Lock()
        self.player: AudioPlayer | None = None
        self._cancel = threading.Event()

        self._warm()

    def _warm(self) -> None:
        """Force pipeline construction so the first real request is fast."""
        log(f"audio out: {self._select_device()}")
        t0 = time.perf_counter()
        for _ in self.model.generate(
            text="Ready.", voice=self.voice, speed=1.0, lang_code="a", verbose=False
        ):
            pass
        log(f"pipeline warm in {time.perf_counter() - t0:.2f}s")

    def stop(self) -> None:
        self._cancel.set()
        player = self.player
        if player is not None:
            try:
                player.flush()
            except Exception:
                pass

    def _select_device(self) -> str:
        """Re-scan outputs so a headset plugged in after boot is actually used."""
        index, name = audio_out.resolve(self.device_pref)
        if name != self._last_device:
            log(f"audio out: {name}")
            self._last_device = name
        return name

    def speak(self, text: str, voice: str, preset: str, speed: float) -> dict:
        np = self._np
        with self.lock:
            self._cancel.clear()
            self._select_device()
            chunks = speak_mod.chunk_text(text)
            if not chunks:
                return {"ok": True, "chunks": 0, "latency": 0.0}

            fx = None if preset in (None, "none", "raw") else audio_fx.build(
                preset, sample_rate=SAMPLE_RATE
            )

            player = self._AudioPlayer(sample_rate=SAMPLE_RATE)
            player.min_buffer_seconds = 0.25
            self.player = player

            audio_q: queue.Queue = queue.Queue()
            err: list[BaseException] = []
            t0 = time.perf_counter()
            first: list[float] = []

            def produce() -> None:
                try:
                    for chunk in chunks:
                        if self._cancel.is_set():
                            break
                        for result in self.model.generate(
                            text=chunk, voice=voice, speed=speed,
                            lang_code="a", verbose=False,
                        ):
                            samples = np.asarray(
                                result.audio, dtype=np.float32
                            ).reshape(-1)
                            if not samples.size:
                                continue
                            if fx is not None:
                                samples = fx(samples)
                            if not first:
                                first.append(time.perf_counter() - t0)
                            audio_q.put(samples)
                except BaseException as exc:
                    err.append(exc)
                finally:
                    audio_q.put(None)

            worker = threading.Thread(target=produce, daemon=True)
            worker.start()

            device_error: list[str] = []
            try:
                while True:
                    samples = audio_q.get()
                    if samples is None:
                        break
                    if self._cancel.is_set():
                        continue
                    try:
                        player.queue_audio(samples)
                    except Exception as exc:
                        # Device vanished mid-sentence (headphones unplugged).
                        # Drop this utterance; the next one re-resolves.
                        if not device_error:
                            device_error.append(str(exc))
                            log(f"audio device failed: {exc}")
                        self._cancel.set()
                if not self._cancel.is_set():
                    player.wait_for_drain()
            finally:
                try:
                    player.stop()
                except Exception:
                    pass
                self.player = None
                worker.join(timeout=1)

            if device_error:
                audio_out.refresh()
                self._last_device = None
                return {"ok": False, "error": f"audio device failed: {device_error[0]}"}
            if err:
                return {"ok": False, "error": str(err[0])}
            return {
                "ok": True,
                "chunks": len(chunks),
                "latency": round(first[0] if first else 0.0, 3),
                "cancelled": self._cancel.is_set(),
            }


def serve(speaker: Speaker, sock: socket.socket, stop_key: str | None = None) -> None:
    work: queue.Queue = queue.Queue()

    def interrupt() -> None:
        """Drop queued lines and cut off whatever is playing."""
        speaker.stop()
        while not work.empty():
            try:
                work.get_nowait()
            except queue.Empty:
                break

    stopper = None
    if stop_key:
        def on_hotkey() -> None:
            # Ignore the key unless audio is actually playing, so normal
            # typing outside a spoken reply costs nothing.
            if speaker.player is not None:
                log(f"{stop_key} pressed - interrupting")
                interrupt()

        stopper = hotkey_mod.HotkeyStopper(on_hotkey, key=stop_key)
        if stopper.start():
            log(f"hotkey active: {stopper.message}")
        else:
            log(f"hotkey unavailable: {stopper.message}")

    def worker() -> None:
        while True:
            job = work.get()
            if job is None:
                return
            text, voice, preset, speed = job
            try:
                speaker.speak(text, voice, preset, speed)
            except Exception as exc:
                log(f"speak failed: {exc}")

    threading.Thread(target=worker, daemon=True).start()

    while True:
        conn, _ = sock.accept()
        try:
            conn.settimeout(10)
            data = b""
            while not data.endswith(b"\n"):
                part = conn.recv(65536)
                if not part:
                    break
                data += part
            if not data.strip():
                continue

            req = json.loads(data.decode("utf-8"))
            cmd = req.get("cmd")

            if cmd == "ping":
                state = {"ok": True, "ready": True, "speaking": speaker.player is not None}
                state["device"] = speaker._last_device or audio_out.current_output()[1]
                state["hotkey"] = stopper.status() if stopper else {"active": False}
                conn.sendall((json.dumps(state) + "\n").encode())
                continue
            if cmd == "stop":
                interrupt()
                conn.sendall(b'{"ok": true, "stopped": true}\n')
                continue
            if cmd == "shutdown":
                conn.sendall(b'{"ok": true, "bye": true}\n')
                conn.close()
                return

            text = (req.get("text") or "").strip()
            voice = req.get("voice") or speaker.voice
            preset = req.get("preset", speaker.preset)
            speed = float(req.get("speed") or 1.0)

            if not text:
                conn.sendall(b'{"ok": false, "error": "empty text"}\n')
                continue

            if req.get("wait"):
                result = speaker.speak(text, voice, preset, speed)
                conn.sendall((json.dumps(result) + "\n").encode())
            else:
                work.put((text, voice, preset, speed))
                conn.sendall(b'{"ok": true, "queued": true}\n')
        except Exception as exc:
            log(f"request error: {exc}")
            try:
                conn.sendall((json.dumps({"ok": False, "error": str(exc)}) + "\n").encode())
            except Exception:
                pass
        finally:
            try:
                conn.close()
            except Exception:
                pass


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Resident Kokoro TTS daemon.")
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--preset", default=DEFAULT_PRESET)
    parser.add_argument("--socket", default=SOCKET_PATH)
    parser.add_argument(
        "--stop-key",
        default=DEFAULT_STOP_KEY,
        help="global key that interrupts playback (shift, esc, f8, ...)",
    )
    parser.add_argument(
        "--no-hotkey", action="store_true", help="disable the global stop key",
    )
    parser.add_argument(
        "--device",
        default=DEFAULT_DEVICE,
        help="output device: 'system' (follow the macOS default, the default), "
             "'builtin', a name substring, or an index",
    )
    args = parser.parse_args()

    os.makedirs(RUNTIME_DIR, exist_ok=True)
    if os.path.exists(args.socket):
        os.unlink(args.socket)

    # Build the speaker BEFORE binding: a bound socket that cannot answer
    # makes clients hang on their readiness probe instead of retrying.
    speaker = Speaker(args.voice, args.preset, args.device)

    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.bind(args.socket)
    os.chmod(args.socket, 0o600)
    sock.listen(8)
    log(f"listening on {args.socket} · voice={args.voice} preset={args.preset}")

    try:
        serve(speaker, sock, None if args.no_hotkey else args.stop_key)
    except KeyboardInterrupt:
        pass
    finally:
        sock.close()
        if os.path.exists(args.socket):
            os.unlink(args.socket)
        log("stopped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
