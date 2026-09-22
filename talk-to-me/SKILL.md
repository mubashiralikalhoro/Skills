---
name: talk-to-me
description: Speak replies aloud through a local offline TTS engine (Kokoro-82M on Apple Silicon) instead of only printing them. Activate when the user says "talk to me", "speak to me", "talk mode", "say it out loud", "read that aloud", "voice on", or otherwise asks to hear answers rather than read them. Latches ON - once activated, EVERY following reply is spoken, across turns and across sessions, until the user says "stop speaking to me", "stop talking", "voice off", "quiet", or similar. State persists on disk, so check it with the mode check command when unsure. While active, speak the substance of every reply in natural spoken prose - the answer and the reasoning, leaving out tables, code, paths and other things that do not work as audio. Spoken lines use a warm, casual, friend-to-friend tone with contractions, never a status-report or chirpy-assistant register. Never speak unless the user has activated it.
---

# Talk To Me

Speak answers aloud using a resident local TTS daemon. Fully offline, no API keys.

## Activation state

This skill is a **latching mode**, not a one-shot action. Turning it on once makes
**every following reply spoken**, until the user explicitly turns it off.

**Talk mode is per session.** Turning it on here does not make another Claude
window start talking. The state is keyed by `CLAUDE_CODE_SESSION_ID` and stored
under `~/.talk-to-me/modes/`, so it survives context loss and daemon restarts
within this session. **That file is the source of truth, not memory.**

The Shift key is the deliberate exception: it is global and kills all audio from
every session at once (see [Shift to interrupt](#shift-to-interrupt)).

| User says | Do |
|---|---|
| "talk to me", "speak to me", "voice on", "talk mode" | `$PY $SAY --mode on`, then confirm aloud. Speak every reply from now on. |
| "stop speaking to me", "stop talking", "voice off", "quiet", "shut up" | `$PY $SAY --mode off`. It also cuts off any playback. Speak nothing after this. |
| "stop talking everywhere", "silence all sessions" | `$PY $SAY --mode off --all`. |
| "say that again", "repeat that" | Re-speak the last spoken line. Mode unchanged. |
| Anything else while mode is ON | Answer normally in text **and** speak the speakable substance of it. |

### The rule

While the mode is on, speak **every** reply — not just the interesting ones, not
just the first one. The user turned it on so they can stop watching the screen; a
silent reply reads as a hang.

While the mode is off, speak **nothing**, ever. Unrequested audio is disruptive.

### Never guess the state

Always send spoken lines with `--if-on`:

```bash
$PY $SAY --if-on "The spoken version of the reply."
```

With `--if-on`, the command checks the mode file and does nothing when the mode is
off. So a stale belief about the state cannot produce audio the user did not ask
for, and cannot swallow audio they did.

At the start of a conversation, or any time the state is unclear, read it:

```bash
$PY $SAY --mode check      # prints: on | off
```

If it prints `on`, the user turned talk mode on earlier in **this** session and it
is still on — keep speaking replies without being asked again.

`$PY $SAY --mode list` shows which sessions currently have it on, and marks the
current one. Useful when the user asks why another window is or is not talking.

## Paths

Every command below uses these two paths. `$PY` is the bundled environment; the
system `python3` will not work because the TTS libraries live in the venv.

```bash
PY=~/.claude/skills/talk-to-me/scripts/.venv/bin/python
SAY=~/.claude/skills/talk-to-me/scripts/say.py
```

## Turning the mode on

One command latches the mode on and preloads the model. It costs ~5s once per
session; every later line starts in ~0.3s:

```bash
bash ~/.claude/skills/talk-to-me/scripts/setup.sh   # only if never run before
$PY $SAY --mode on
```

Then confirm through the voice itself, so the user immediately hears that it works:

```bash
$PY $SAY --if-on "Alright, I'm talking now. I'll say everything out loud from here. Just hit shift whenever you want to cut me off, or tell me to stop speaking and I'll shut up."
```

Check `$PY $SAY --status`. If it reports `hotkey off`, tell the user in the text
reply — they need to grant Accessibility permission (see below) for Shift to work.

## Turning the mode off

```bash
$PY $SAY --mode off
```

This latches the mode off and cuts any playback in the same call. Confirm in text
only — do not speak a goodbye.

## Speaking a reply

After writing the text reply, speak its substance — see
[What to speak](#what-to-speak) for what to include and drop, and
[Tone](#tone-talk-like-a-friend) for how it should sound:

```bash
$PY $SAY --if-on "Got it fixed. The expiry check was off by a second, so perfectly good tokens were getting bounced. Tests are green now."
```

The call returns immediately and audio plays in the background, so continue working
while it speaks. Add `--wait` only when the next step must not overlap the audio.

## What to speak

**Speak the substance. Skip what cannot be spoken.**

The test is not length — it is whether a piece of the reply works as audio. Explain
the actual answer, the reasoning, the finding, the trade-off. Leave out the parts
that only make sense on screen.

Do not compress the reply into a headline. If the answer has three real points,
speak all three. Length follows the content: usually a few sentences, sometimes a
short paragraph, sometimes one line.

### Speak this

- The **answer** and **why** — the explanation, the cause, the reasoning.
- What was **found, changed, or decided**, in plain words.
- **Trade-offs and recommendations** — this is what the user wants to hear about.
- **Questions** back to the user, and **blockers**, with enough context to act.
- Key numbers, spoken naturally: "about a third of a second", not "0.27s".

### Leave out

- Code blocks, file paths, URLs, command flags, exact identifiers.
- Tables — say what the table shows instead of reading cells.
  "Crisp cut the bass by about twelve decibels" beats reading rows.
- Long bullet lists — turn them into flowing sentences, or speak the ones that
  matter and say the rest is on screen.
- Markdown syntax, emoji, version numbers, line numbers.

### Say it like a person talking

Write it the way it would be said out loud, not the way it is written. Full
sentences, natural connectives, no bullet phrasing. Refer to things by name rather
than path: "the daemon script", not a directory path.

## Tone: talk like a friend

**This is a conversation between friends, not a status report.** The user wants
working with Claude to feel like a knowledgeable friend talking them through
something, not a tool announcing results.

This governs the **spoken line only**. The written reply keeps its normal register.

### Sound like this

- **Contractions, always.** "I've got it working", "that didn't help", "here's
  what happened". Never "I have", "did not", "here is".
- **Talk to them, not about the work.** "So I tried the other voice and it's
  clearer" beats "The alternative voice was evaluated and found clearer".
- **Start naturally.** "So", "Okay so", "Right", "Turns out", "Good news",
  "Yeah so" — the way a person actually opens a sentence.
- **React honestly when something is genuinely interesting.** "That one was weird,
  actually", "Honestly, that surprised me". Only when true.
- **Think out loud.** "I wasn't sure at first, but", "my guess is", "I'd go with".
- **Admit things plainly.** "Yeah, I got that wrong", "I'm not sure yet", "that was
  my mistake". No stiff apologies.
- **Be direct the way a friend is direct.** "I wouldn't bother with that one" is
  friendlier than hedging politely around it.

### Do not

- **Do not be a chirpy assistant.** No "Great question!", "Absolutely!", "I'd be
  happy to", "Hope this helps!", "Let me know if you need anything else!" Friends
  do not talk like a support desk.
- **Do not flatter.** No "great idea", "good catch", "smart approach". Warmth comes
  from how it is said, not from compliments.
- **Do not fake feelings.** No "I'm so excited", "I love this". Understated is
  warmer than performed.
- **Do not get chatty for its own sake.** Friendly still means getting to the point.
  Warmth is the delivery, not extra words.
- **Do not soften real problems.** A friend tells you the thing is broken. Say it
  plainly, then say what to do about it.
- **Do not narrate the obvious.** "Let me go ahead and check that for you" - just
  say what was found.

### Tone examples

Friendly, still substantive:

> "So the bass was the problem. That voice had way more low end than consonant
> energy, which is exactly why words were mushing together for you. I cut it and
> lifted the consonant band, and it's a lot clearer now. Have a listen."

> "Yeah, that one's on me. I capped the spoken lines way too short and it ended up
> saying nothing useful. Fixed it, it'll actually explain things now."

> "Turns out it was already broken before your change, which is good news in a way.
> The test was passing for the wrong reason."

Too stiff, reads as a report:

> "The tone processing has been applied. The bass-to-presence ratio was reduced by
> twelve decibels. Please review the output."

Too chirpy, sounds like a support bot:

> "Great question! I'd be absolutely happy to help you with that! I've gone ahead and
> fixed it for you. Hope this helps, and let me know if you need anything else!"

### Examples

Good — speaks the real content, drops the unspeakable parts:

> "Fixed it. The auth middleware was checking token expiry with a less-than instead
> of less-than-or-equal, so tokens were rejected one second early. Tests pass now.
> The diff is on screen."

> "The crisp preset cuts the boom by about twelve decibels and lifts the consonant
> band, which is why words are easier to catch. Clarity is the gentler version if
> crisp sounds harsh to you. I put the numbers in a table on screen."

Bad — too compressed, the user learns nothing:

> "Fixed. Details on screen."

Bad — reading the written reply aloud, structure and all:

> "Fixed. Edited slash Users slash mubashirali slash speaker slash auth dot py line
> forty two. Bullet one, changed the operator. Bullet two, added a test. See the
> table below for the benchmark columns."

## Controls

```bash
$PY $SAY --mode on              # latch on for THIS session (persists)
$PY $SAY --mode off             # latch off for this session + stop playback
$PY $SAY --mode off --all       # silence every session
$PY $SAY --mode check           # print on | off
$PY $SAY --mode list            # which sessions have it on
$PY $SAY --if-on "text"         # speak only if the mode is on  <- use this one
$PY $SAY "text"                 # speak unconditionally, return immediately
$PY $SAY --wait "text"          # block until finished
$PY $SAY --stop                 # interrupt playback now
$PY $SAY --status               # daemon + mode + device + hotkey state
$PY $SAY --grant                # fix the Shift hotkey permission
$PY $SAY --start                # preload without speaking
$PY $SAY --shutdown             # stop the daemon, free the model
$PY $SAY -v am_michael "text"   # different voice for one line
$PY $SAY -p warm "text"         # different tone for one line
$PY $SAY -s 0.9 "text"          # slower
```

Interrupt immediately with `--stop` if the user says "stop", "wait", or "shut up"
mid-playback. Do not wait for the current line to finish.

## Shift to interrupt

While the daemon is speaking, **pressing Shift anywhere stops playback instantly** —
no need to switch to the terminal. This is how the user cuts a long answer short to
start typing. The key is ignored while nothing is playing, so normal typing is
unaffected.

**Shift is global and total.** One daemon serves every session, so a single press
kills the line currently playing *and* drops everything queued behind it, from all
sessions. It does not change any session's talk mode: replies after the interruption
are still spoken. To stop future speech as well, use `--mode off`.

The daemon owns this listener; nothing extra needs starting. Confirm with
`$PY $SAY --status`, which reports `hotkey: shift stops playback` when live.

Requires macOS Accessibility permission. **The permission belongs to the terminal
app, not to Python**, so switching from Terminal to iTerm (or to Warp, VS Code,
Cursor...) silently loses it and Shift stops working.

If `--status` shows `hotkey off`, run:

```bash
$PY $SAY --grant
```

That names the exact app needing permission, triggers the macOS prompt, and opens
the Settings pane. After the user enables it, restart the daemon:

```bash
$PY $SAY --shutdown && $PY $SAY --start
```

Speech works regardless; only the hotkey is inert.

Change or disable the key by restarting the daemon:

```bash
$PY ~/.claude/skills/talk-to-me/scripts/speakd.py --stop-key esc
$PY ~/.claude/skills/talk-to-me/scripts/speakd.py --no-hotkey
```

Keys: `shift` (default), `ctrl`, `alt`, `cmd`, `esc`, `space`, `f8`, or a single
character.

## Never the monitor speakers

**This user's display, the Samsung LS27A600U, must never be used as the output
device.** It accepts audio over DisplayPort and plays none of it, so a spoken reply
sent there is lost in silence and reads as the skill being broken. macOS hands it
the default output on its own whenever the Bluetooth headphones disconnect, which is
how it happens — not by anyone choosing it.

This is enforced, not just written down. `LS27` is listed in
`~/.talk-to-me/blocked_devices`, so `audio_out.resolve()` skips the monitor and falls
through to the next real speaker (the MacBook's own, or the headphones when they are
back). Nothing needs doing per session.

If that file is ever lost, put it back:

```bash
printf 'LS27\n' >> ~/.talk-to-me/blocked_devices
```

One name substring per line, matched case-insensitively. Add any other display or
dummy sink the same way. The change takes effect on the next spoken line — the
blocklist is read fresh each time, so the daemon does not need restarting.

**Check the device whenever the user says they cannot hear anything.** `--status`
reports the output in use. If it names a monitor, the blocklist is the fix; do not
tell the user to go change it in Sound settings, and never leave speech playing into
a device that cannot sound it.

## Defaults

Voice `am_eric` (US male), tone preset `crisp`, speed 1.0 — chosen by this user for
intelligibility. Do not change them without being asked. Output device: anything
except the monitor, per the section above.

Other voices: `am_adam`, `am_echo`, `am_fenrir`, `am_liam`, `am_michael`, `am_onyx`,
`am_puck` (US male); `bm_daniel`, `bm_fable`, `bm_george`, `bm_lewis` (UK male);
`af_heart`, `af_bella`, `af_nicole`, `af_sarah` (US female).

Tone presets: `crisp` (default, maximum clarity), `clarity` (gentler), `warm`
(keeps low end), `flat` (level only), `none` (unprocessed model output).

## Troubleshooting

Read [references/engine.md](references/engine.md) for the architecture, the tone
chain, tuning knobs, and fixes when something misbehaves. Common cases:

- **No sound**: check `--status`. If stopped, run `--start` and read
  `~/.talk-to-me/speakd.log`.
- **Playing on the wrong speakers**: `--status` shows the output device. The daemon
  re-scans before every line and follows the macOS default output, so headphones
  connected at any time are picked up automatically. If it names the monitor, see
  [Never the monitor speakers](#never-the-monitor-speakers) — the blocklist is the
  fix. If it is still wrong otherwise, change the default in Sound settings.
- **Spoke, but the user heard nothing**: the daemon reporting `spoke 1 chunk(s)` only
  means it played the audio somewhere. Check `--status` for the device before
  suspecting the model, the socket or the volume.
- **First line slow**: expected on the very first call of a session (model load).
  Every later line is ~0.3s.
- **Words hard to make out**: try `-s 0.9`, or a different voice.
- **`uv not found`**: `brew install uv`, then rerun `setup.sh`.
