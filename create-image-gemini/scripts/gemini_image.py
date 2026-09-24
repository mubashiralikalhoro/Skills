#!/usr/bin/env python3
"""Gemini / Nano Banana image generation. Standard library only.

Commands:
  key status              -> "set (source, masked)" | "missing"
  key set [--stdin]       -> save API key (hidden prompt, or read from stdin)
  key clear               -> delete saved key
  models                  -> live list of image-capable models as JSON (newest first)
  generate --model M --prompt P [--image REF ...] [--aspect 16:9] [--size 2K]
           [--count N] [--out-dir DIR] [--name SLUG]
                          -> JSON {"model", "files": [...], "text": "..."}

Key lookup order: $GEMINI_API_KEY, $GOOGLE_API_KEY, saved config file.
"""
import argparse
import base64
import getpass
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_BASE = os.environ.get("GEMINI_API_BASE", "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
CONFIG_DIR = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "create-image-gemini"
CONFIG_FILE = CONFIG_DIR / "config.json"
EXT_BY_MIME = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif"}


def die(msg, code=1):
    print(json.dumps({"error": msg}), file=sys.stderr)
    sys.exit(code)


# ---------- key ----------

def load_key():
    for var in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        if os.environ.get(var):
            return os.environ[var].strip(), f"env:{var}"
    if CONFIG_FILE.exists():
        try:
            key = json.loads(CONFIG_FILE.read_text()).get("api_key", "").strip()
            if key:
                return key, f"file:{CONFIG_FILE}"
        except (OSError, json.JSONDecodeError):
            pass
    return None, None


def mask(key):
    return key[:4] + "…" + key[-4:] if len(key) > 10 else "****"


def cmd_key(args):
    if args.action == "status":
        key, src = load_key()
        print(f"set ({src}, {mask(key)})" if key else "missing")
    elif args.action == "clear":
        CONFIG_FILE.unlink(missing_ok=True)
        print("cleared")
    elif args.action == "set":
        key = sys.stdin.read().strip() if args.stdin else getpass.getpass("Gemini API key (hidden): ").strip()
        if not key:
            die("empty key")
        try:
            list_models(key)  # validate before saving
        except RuntimeError as e:
            die(f"key rejected by Gemini API: {e}")
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        os.chmod(CONFIG_DIR, 0o700)
        fd = os.open(CONFIG_FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w") as f:
            json.dump({"api_key": key}, f)
        print(f"saved ({mask(key)}) -> {CONFIG_FILE}")


def require_key():
    key, _ = load_key()
    if not key:
        die("NO_KEY: no Gemini API key saved. Ask the user for one, then run `key set --stdin`.", 2)
    return key


# ---------- http ----------

def request(method, path, key, body=None, timeout=300):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{API_BASE}/{path}", data=data, method=method)
    req.add_header("x-goog-api-key", key)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raw = e.read().decode(errors="replace")
        try:
            msg = json.loads(raw)["error"]["message"]
        except (ValueError, KeyError, TypeError):
            msg = raw[:500]
        raise RuntimeError(f"HTTP {e.code}: {msg}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"network error: {e.reason}") from None


# ---------- models ----------

def list_models(key):
    models, token = [], None
    while True:
        path = "models?pageSize=1000" + (f"&pageToken={token}" if token else "")
        page = request("GET", path, key, timeout=60)
        models += page.get("models", [])
        token = page.get("nextPageToken")
        if not token:
            return models


def describe(m):
    """Classify a raw model entry. Returns None if it cannot make images."""
    mid = m["name"].split("/", 1)[-1]
    methods = m.get("supportedGenerationMethods", [])
    low = mid.lower()
    if low.startswith("imagen") and "predict" in methods:
        family = "imagen"
    elif low.startswith("gemini") and "image" in low and "generateContent" in methods:
        family = "gemini-image"  # "Nano Banana" family
    else:
        return None
    ver = re.search(r"-(\d+(?:\.\d+)?)", low)
    tier = "pro" if "pro" in low else "ultra" if "ultra" in low else "lite" if "lite" in low else "fast" if "fast" in low else "flash" if "flash" in low else "standard"
    return {
        "id": mid,
        "family": family,
        "tier": tier,
        "version": float(ver.group(1)) if ver else 0.0,
        "preview": any(t in low for t in ("preview", "exp")),
        "display_name": m.get("displayName", ""),
        "description": (m.get("description") or "")[:300],
        "input_token_limit": m.get("inputTokenLimit"),
        "method": "predict" if family == "imagen" else "generateContent",
    }


def cmd_models(args):
    key = require_key()
    try:
        raw = list_models(key)
    except RuntimeError as e:
        die(str(e))
    out = [d for d in map(describe, raw) if d]
    out.sort(key=lambda d: (d["family"] != "gemini-image", -d["version"], d["preview"], d["id"]))
    print(json.dumps({"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "count": len(out), "models": out}, indent=2))


# ---------- generate ----------

def slugify(text, n=40):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:n].rstrip("-") or "image"


def inline_image(path):
    p = Path(path).expanduser()
    if not p.is_file():
        die(f"reference image not found: {p}")
    mime = mimetypes.guess_type(p.name)[0] or "image/png"
    return {"inline_data": {"mime_type": mime, "data": base64.b64encode(p.read_bytes()).decode()}}


def gen_gemini(key, a):
    parts = [inline_image(i) for i in a.image] + [{"text": a.prompt}]
    cfg = {"responseModalities": ["TEXT", "IMAGE"]}
    img_cfg = {}
    if a.aspect:
        img_cfg["aspectRatio"] = a.aspect
    if a.size:
        img_cfg["imageSize"] = a.size
    if img_cfg:
        cfg["imageConfig"] = img_cfg
    body = {"contents": [{"role": "user", "parts": parts}], "generationConfig": cfg}
    images, texts = [], []
    for _ in range(a.count):
        resp = request("POST", f"models/{a.model}:generateContent", key, body)
        cands = resp.get("candidates") or []
        if not cands:
            fb = resp.get("promptFeedback", {})
            raise RuntimeError(f"no candidates (blocked? {fb.get('blockReason', 'unknown')})")
        for part in (cands[0].get("content") or {}).get("parts", []):
            if part.get("thought"):
                continue  # interim "thinking" images
            blob = part.get("inlineData") or part.get("inline_data")
            if blob:
                images.append((blob.get("mimeType") or blob.get("mime_type") or "image/png", blob["data"]))
            elif part.get("text"):
                texts.append(part["text"])
        if not images and cands[0].get("finishReason") not in (None, "STOP"):
            raise RuntimeError(f"generation stopped: {cands[0].get('finishReason')}")
    return images, "\n".join(texts)


def gen_imagen(key, a):
    if a.image:
        die("Imagen models here take text only; use a gemini-image model for reference images/edits.")
    params = {"sampleCount": a.count}
    if a.aspect:
        params["aspectRatio"] = a.aspect
    if a.size:
        params["sampleImageSize"] = a.size
    resp = request("POST", f"models/{a.model}:predict", key, {"instances": [{"prompt": a.prompt}], "parameters": params})
    images = [(p.get("mimeType", "image/png"), p["bytesBase64Encoded"]) for p in resp.get("predictions", []) if p.get("bytesBase64Encoded")]
    return images, ""


def cmd_generate(a):
    key = require_key()
    a.model = a.model.removeprefix("models/")
    fn = gen_imagen if a.model.lower().startswith("imagen") else gen_gemini
    try:
        images, text = fn(key, a)
    except RuntimeError as e:
        die(str(e))
    if not images:
        die(f"model returned no image. Model text: {text[:500]!r}")
    out_dir = Path(a.out_dir).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{time.strftime('%Y%m%d-%H%M%S')}-{a.name or slugify(a.prompt)}"
    files = []
    for i, (mime, data) in enumerate(images, 1):
        path = out_dir / f"{stem}{'' if len(images) == 1 else f'-{i}'}{EXT_BY_MIME.get(mime, '.png')}"
        path.write_bytes(base64.b64decode(data))
        files.append(str(path.resolve()))
    print(json.dumps({"model": a.model, "files": files, "text": text}, indent=2))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    k = sub.add_parser("key")
    k.add_argument("action", choices=["status", "set", "clear"])
    k.add_argument("--stdin", action="store_true", help="read key from stdin instead of a hidden prompt")
    k.set_defaults(fn=cmd_key)

    m = sub.add_parser("models")
    m.set_defaults(fn=cmd_models)

    g = sub.add_parser("generate")
    g.add_argument("--model", required=True)
    g.add_argument("--prompt", required=True)
    g.add_argument("--image", action="append", default=[], help="reference/input image (repeatable)")
    g.add_argument("--aspect", help="e.g. 1:1, 16:9, 9:16, 4:3, 3:4, 21:9")
    g.add_argument("--size", help="e.g. 1K, 2K, 4K (only models that support it)")
    g.add_argument("--count", type=int, default=1, help="number of images (gemini: one request each)")
    g.add_argument("--out-dir", default="generated-images")
    g.add_argument("--name", help="filename slug (default: from prompt)")
    g.set_defaults(fn=cmd_generate)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
