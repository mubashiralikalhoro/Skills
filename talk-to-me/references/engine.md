# Engine reference

Architecture, tuning and failure modes for the talk-to-me TTS engine.

## Contents

- [Architecture](#architecture)
- [Why a daemon](#why-a-daemon)
- [Streaming pipeline](#streaming-pipeline)
- [Tone chain](#tone-chain)
- [Output device](#output-device)
- [Per-session mode](#per-session-mode)
- [Shift-to-interrupt](#shift-to-interrupt)
- [Files](#files)
- [Standalone use without the daemon](#standalone-use-without-the-daemon)
- [Tuning](#tuning)
- [Failure modes](#failure-modes)

## Architecture

```
say.py  ──unix socket──>  speakd.py  ──>  Kokoro-82M (MLX)  ──>  audio_fx  ──>  speakers
(thin client)             (resident)      synthesis             tone chain
```

Model: `mlx-community/Kokoro-82M-bf16`, 82M params, Apache-2.0, runs on Apple
Silicon through MLX/Metal. Output is 24 kHz mono. Real-time factor ~0.5, so
synthesis runs roughly twice as fast as playback.

Runtime state lives in `~/.talk-to-me/`:

- `speakd.sock` — the unix socket (mode 0600)
- `speakd.log` — daemon stdout and stderr; read this first when debugging
- `modes/<session-id>` — `on` or `off` per Claude session. Written by
  `say.py --mode`, read by `--if-on`. Deliberately outside the daemon so it
  survives restarts and so a stopped daemon still remembers the user's choice.

## Why a daemon

Loading the model plus the spaCy phonemiser costs about 5 seconds. Paying that per
sentence makes conversation unusable. The daemon pays it once at startup and warms
the pipeline with a throwaway phrase, so the first real request is already fast.

Measured: **~5.1s cold boot, ~0.27s to first audio when warm.**

`say.py` starts the daemon automatically on first use, detached via
`start_new_session=True`, so it outlives the shell that spawned it.

The daemon binds its socket only *after* the model is ready. Binding earlier would
let clients connect to a socket that cannot answer, and their readiness probe would
hang instead of retrying.

## Streaming pipeline

Text is split into sentence-sized chunks, synthesised in a background thread, and
queued to the audio device as each chunk lands. Playback of chunk 1 overlaps
synthesis of chunk 2, so time-to-first-audio does not grow with text length.

Chunking rules (`speak.chunk_text`):

- Break at sentence enders `.!?…`
- A sentence over 180 chars splits further at `,;:`
- Fragments under 25 chars merge into the next chunk (avoids choppy prosody)
- The first chunk is capped at 90 chars, so audio starts sooner

Playback starts once 0.25s of audio is buffered.

## Tone chain

Kokoro's male voices carry heavy low-mid energy: chest boom around 150–250 Hz and
"box" around 400–500 Hz. That masks consonants. Raw `am_eric` measures about
+21 dB bass-to-presence; `crisp` brings it to roughly +9 dB.

The `crisp` preset, in order:

1. High-pass 110 Hz — rumble
2. Low-shelf −7 dB @ 220 Hz — chest boom
3. Bell −4 dB @ 420 Hz — mud/box
4. Bell **+6 dB @ 3.2 kHz** — consonant intelligibility
5. High-shelf +2.5 dB @ 7.5 kHz — air
6. Compressor 3.5:1 @ −22 dB — stops quiet words dropping out
7. Soft limiter → −1.5 dBFS

Filters are IIR biquads (RBJ cookbook) that carry their state between chunks, so a
long text processed chunk-by-chunk sounds identical to processing it in one pass.
Cost is ~66 ms per 5 s of audio — negligible next to synthesis.

Presets: `crisp` (default), `clarity` (gentler), `warm` (keeps low end), `flat`
(level control only, no tonal change), `none` (bypass entirely).

## Output device

PortAudio enumerates devices once when it initialises. The daemon is long lived, so
a headset connected *after* startup was invisible to it and audio kept going to the
boot-time default - usually the laptop speakers.

`audio_out.resolve()` re-initialises PortAudio before every utterance (about 2 ms)
and then follows **whatever macOS currently has as the default output**. macOS
already switches that to headphones when they connect and back when they go, so
this needs no guessing and respects any manual choice in Sound settings.

The only devices skipped are virtual ones - Teams, Zoom, BlackHole, Loopback, OBS -
which accept audio but are not speakers, so speech sent there is lost silently. If
the system default is one of those, the next real device is used instead. Extra
exclusions go in `~/.talk-to-me/blocked_devices`, one name substring per line.

`--device` overrides: `system` (the default), `builtin`, a name substring, or an
index. `--status` reports the device currently in use.

**Mid-sentence device loss** (headphones unplugged while speaking) is caught, the
utterance is dropped, and devices are re-scanned so the next line lands correctly.

## Per-session mode

Talk mode is scoped per Claude session, so turning it on in one window leaves other
windows silent. The session key comes from `CLAUDE_CODE_SESSION_ID`, falling back to
`TERM_SESSION_ID` and then the parent PID. Each key gets a file under
`~/.talk-to-me/modes/`.

What stays global, by design:

- **One daemon, one audio device.** Two sessions never overlap; the daemon
  serialises them through a single worker and a lock. They queue instead.
- **Shift.** One press drains the whole queue and cuts playback for every session.
- **The model.** Loaded once, shared. Only one session pays the cold start.

Files older than 30 days are pruned on write, since session keys are transient.
`--mode list` shows which sessions are currently on; `--mode off --all` silences
every one of them.

Note the consequence of sharing one device: if two sessions both have talk mode on,
their replies interleave in queue order with no spoken marker saying which is which.
Distinguish them with `-v` per session if that becomes confusing.

## Shift-to-interrupt

A global key listener runs inside the daemon (`hotkey.py`, built on pynput). A
single Shift press calls the same interrupt path as the `stop` socket command:
flush the pending queue, flush the audio buffer, drop the stream.

Design points worth knowing:

- **Gated on playback.** The callback returns immediately unless
  `speaker.player is not None`, so Shift while idle costs nothing. This matters
  because Shift is pressed constantly during normal typing.
- **Debounced 0.4s.** Holding the key autorepeats; only the first press counts.
- **Fails soft.** Missing permission or missing pynput disables the hotkey and
  logs why. Speech itself is unaffected.
- **Liveness check.** A listener without permission dies shortly after starting
  rather than raising, so `start()` sleeps 0.4s and verifies `is_alive()` before
  reporting success. Without this the daemon would claim a hotkey it does not have.

macOS grants Accessibility to the **application**, not to the Python binary. The
daemon inherits whichever terminal launched it, so moving from Terminal to iTerm
(or Warp, VS Code, Cursor) silently loses the permission and Shift stops working -
a confusing failure, because nothing errors and speech keeps playing.

`hotkey.responsible_app()` reads `__CFBundleIdentifier` / `TERM_PROGRAM` to name the
app that actually needs authorising. `say.py --grant` prints it, calls
`AXIsProcessTrustedWithOptions` to trigger the system prompt, and opens the Settings
pane. The daemon must be restarted afterwards - permission is checked at listener
start, not per keypress.

`hotkey.is_trusted()` returns `None` when the trust API was unavailable, which is not
the same as permission being missing.

Alternate keys via `--stop-key`: `shift`, `ctrl`, `alt`, `cmd`, `esc`, `space`,
`f8`, or any single character. `--no-hotkey` disables it.

## Files

| File | Role |
|---|---|
| `scripts/say.py` | Client. Starts the daemon on demand, sends one JSON request. |
| `scripts/speakd.py` | Daemon. Owns the model and audio device, serves the socket. |
| `scripts/speak.py` | Standalone CLI + the `chunk_text` splitter the daemon reuses. |
| `scripts/audio_fx.py` | Biquad EQ, compressor, limiter, presets. |
| `scripts/hotkey.py` | Global Shift listener that interrupts playback. |
| `scripts/audio_out.py` | Output device re-scan, ranking and blocklist. |
| `scripts/setup.sh` | One-time venv build. Idempotent. |

`scripts/.venv` may be a symlink to an existing environment. `setup.sh` removes it
if it dangles and builds a fresh venv in its place.

## Standalone use without the daemon

`speak.py` works on its own, paying the full ~5s load each run. Useful for batch
work and for writing files:

```bash
$PY ~/.claude/skills/talk-to-me/scripts/speak.py --preset --save out.wav "text"
$PY ~/.claude/skills/talk-to-me/scripts/speak.py --raw "unprocessed output"
```

Note the inversion: in `speak.py` processing is **opt-in** via `--preset`, while the
daemon applies `crisp` by default.

## Tuning

Per-line overrides, no restart needed:

```bash
$PY $SAY -s 0.9 "text"            # slower — the single biggest clarity win
$PY $SAY -p clarity "text"        # gentler EQ
$PY $SAY -v am_michael "text"     # different voice
```

To change the daemon's defaults, shut it down and restart with flags:

```bash
$PY $SAY --shutdown
$PY ~/.claude/skills/talk-to-me/scripts/speakd.py --voice am_liam --preset clarity
```

To change the EQ curves themselves, edit `PRESETS` in `audio_fx.py`, then restart
the daemon so it picks up the new module.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `--status` says stopped, won't start | venv missing or broken | `bash scripts/setup.sh` |
| `uv not found` | uv not installed | `brew install uv` |
| Daemon starts then dies | read `~/.talk-to-me/speakd.log` | usually a missing dep; rerun setup |
| Audio on the wrong speakers | stale device list, or wrong macOS default | fixed automatically; check `--status` for the device in use |
| Audio cuts off mid-sentence | something called `--stop` | just speak again |
| `--if-on` speaks nothing | this session's mode is off | `--mode on`, or check with `--mode check` |
| Another window started talking | that session has its own mode on | `--mode list`, then `--mode off --all` |
| Speech continues after being told to stop | caller used bare speak, not `--if-on` | always pass `--if-on` |
| Every line takes 5s | daemon not staying up; each call cold-loads | check the log for a crash loop |
| Robotic or clipped consonants | preset pushed too hard | `-p clarity` or `-p none` |
| Stale socket after a crash | leftover `speakd.sock` | `rm ~/.talk-to-me/speakd.sock` |
| Shift does not interrupt | no Accessibility permission | grant it, then `--shutdown` and `--start` |
| Shift interrupts nothing while idle | working as designed | hotkey only acts during playback |
