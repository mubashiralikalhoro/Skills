---
name: create-image-gemini
description: Generate or edit images with Google Gemini's image models ("Nano Banana", Nano Banana Pro / 2, and Imagen) through the Gemini API. Asks for the user's Gemini API key the first time and saves it locally. Every run fetches the live list of image models from the API; uses the model the user names, otherwise Claude picks one from that live list based on how complex the image is (or asks the user when they want to choose). Use when the user asks to create, generate, make, draw, render or edit an image, picture, illustration, logo, icon, poster, banner, thumbnail, mockup or photo with Gemini, Nano Banana, Imagen or Google AI, or says "create-image-gemini". Also when they ask which Gemini image models are available.
---

# Create Image (Gemini / Nano Banana)

One script does everything. Standard library only, no install needed.

```bash
G="python3 ~/.claude/skills/create-image-gemini/scripts/gemini_image.py"
```

## Rules

1. **Never print the API key.** Don't `cat` the config file or echo the key. Use `$G key status`, which masks it.
   **Never write it into a project or git repo** (no `.env`, no code, no commit). It lives only in `~/.config/create-image-gemini/`.
2. **Never hardcode a model id.** Model names change often. Run `$G models` at the start of **every** request and choose only from what it returns in that run.
3. The user's explicit model choice always wins. Claude only decides when the user didn't name a model.
4. Look at every image you generate (Read the file) before you reply.

## 1. Key (first run only)

```bash
$G key status        # "set (source, masked)" or "missing"
```

If it says `missing`:

- Ask the user for their Gemini API key. They can get one free at https://aistudio.google.com/apikey.
- Tell them they have two ways to give it:
  - **Paste it in chat.** Then save it by piping it through stdin (don't pass it as an argument):
    `printf '%s' 'THE_KEY' | $G key set --stdin`
  - **Keep it out of the transcript.** They run this in their own terminal (hidden prompt):
    `python3 ~/.claude/skills/create-image-gemini/scripts/gemini_image.py key set`
- `key set` checks the key against the API before saving. It saves to `~/.config/create-image-gemini/config.json` with mode 600. If `$GEMINI_API_KEY` or `$GOOGLE_API_KEY` is set, that takes precedence over the file.
- If the key is rejected, show the error and ask for a new key. The user can remove a saved key with "forget my gemini key" (`$G key clear`).

If any command exits with code 2 (`NO_KEY`), go back to this step.

## 2. Get the live model list (every run)

```bash
$G models
```

This returns JSON with the image models available to this key, newest first: first the `gemini-image` family (Nano Banana, via generateContent), then `imagen` (via predict). Each entry has `id`, `tier` (`pro` / `flash` / `lite` / `ultra` / `fast` / `standard`), `version`, `preview`, `display_name` and `description`.

The names people use map to that list like this:
- "Nano Banana" means the `gemini-image` family in general.
- "Nano Banana Pro" means the newest `pro` tier.
- "Nano Banana 2" or "the latest Nano Banana" means the newest flash `gemini-image`.

Check `display_name` and `description`, since they often include the nickname.

## 3. Choose the model

**If the user named a model** (id, nickname, or "pro" / "flash" / "imagen"), match it to the list and use it. If nothing matches, show them the list and ask.

**If the user said "let me choose" or "which models are there?"**, use AskUserQuestion with the top 4 from the live list. Put your pick first, labeled "(Recommended)", and give a one-line reason for each.

**Otherwise, Claude decides based on how complex the image is:**

| Complexity | Signals | Pick |
|---|---|---|
| **Simple** | One subject, icon or sticker, simple scene, quick draft, style variation, basic edit ("remove the background", "make it blue"), several quick options | Newest `flash`-tier `gemini-image` |
| **Complex** | Text that must be readable (posters, infographics, menus, UI mockups, diagrams), many subjects or precise layout, a character or brand kept consistent across several reference images, a product or photoreal hero shot, 2K/4K output, multi-step reasoning ("chart of X", "map of Y") | Newest `pro`-tier `gemini-image` |
| **Pure photoreal, text-only prompt, no editing** | Only when the user asks for Imagen, or for photorealism with no references | Newest `imagen` (`ultra` for the highest quality) |

When two versions tie, prefer the newest `version`. Prefer non-preview only when the preview is the same generation and tier. If your first choice fails (404, quota, or not supported), fall back to the next one on the list and tell the user.

In one line, state the model you chose and why, e.g. `Using gemini-3-pro-image-preview: poster needs legible text.`

## 4. Generate

```bash
$G generate --model <id> --prompt "<prompt>" \
  [--image ref1.png --image ref2.jpg] [--aspect 16:9] [--size 2K] \
  [--count N] [--out-dir generated-images] [--name short-slug]
```

- **Prompt:** turn the request into a vivid descriptive paragraph covering subject, setting, composition, lighting, style, mood and camera/lens where it matters. Put any text that must appear in the image in quotes. Keep every detail the user specified. Don't invent brand names or logos they didn't ask for.
- **Editing and reference images:** pass them with `--image` (`gemini-image` only). Say plainly what should change and what must stay the same.
- **`--aspect`:** 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9. Infer from use (story or phone wallpaper 9:16, banner or thumbnail 16:9, post 1:1 or 4:5).
- **`--size`:** 1K, 2K or 4K. Only pass it when the user wants high resolution or the model is `pro` tier. If the API rejects it, retry without it.
- **Output:** default is `./generated-images/` in the current directory. Use the user's path if they give one.
- The script prints `{"model", "files", "text"}`. On an error it prints `{"error"}` to stderr. If a request was blocked for safety, tell the user and suggest a rephrase. Never try to work around the filter.

## 5. Deliver

Read each image file to check it against the request, looking at text spelling, subject, composition and obvious artifacts. If it clearly misses (misspelled text, wrong subject), regenerate once with a sharper prompt, or with the `pro` tier if flash was used. Then reply with:

- the saved path(s)
- the model used
- a one-line description of what you see
- an offer to iterate (edits run through the same script with the file as `--image`)
