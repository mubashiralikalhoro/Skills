#!/usr/bin/env bash
# One-time environment build for the talk-to-me TTS engine.
# Idempotent: re-running it is cheap and safe.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$HERE/.venv"

if [ -x "$VENV/bin/python" ] && "$VENV/bin/python" -c "import mlx_audio" 2>/dev/null; then
  echo "environment ready"
  exit 0
fi

# A dangling symlink (e.g. the original project folder was moved) would
# otherwise block venv creation at that path.
if [ -L "$VENV" ] && [ ! -e "$VENV" ]; then
  rm -f "$VENV"
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "error: uv not found. Install with: brew install uv" >&2
  exit 1
fi

echo "building TTS environment (a few minutes, one time only)..."
uv venv --python 3.12 "$VENV"
uv pip install --python "$VENV/bin/python" mlx-audio "misaki[en]" soundfile scipy sounddevice pynput
echo "environment ready"
