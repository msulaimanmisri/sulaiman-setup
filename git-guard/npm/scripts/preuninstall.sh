#!/usr/bin/env bash
set -euo pipefail

SENTINEL_START="# >>> Git-guard by Sulaiman Misri >>>"
SENTINEL_END="# <<< Git-guard <<<"

detect_shell() {
  case "$SHELL" in
    */zsh) echo "zsh" ;;
    */bash) echo "bash" ;;
    *)
      echo "unknown"
      ;;
  esac
}

get_rc_file() {
  case "$1" in
    zsh) echo "$HOME/.zshrc" ;;
    bash) echo "$HOME/.bashrc" ;;
  esac
}

main() {
  local SHELL_TYPE RC_FILE

  SHELL_TYPE=$(detect_shell)

  if [ "$SHELL_TYPE" = "unknown" ]; then
    echo "[git-guard] WARNING: Could not detect your shell. Skipping wrapper removal."
    exit 0
  fi

  RC_FILE=$(get_rc_file "$SHELL_TYPE")

  if [ ! -f "$RC_FILE" ]; then
    exit 0
  fi

  if grep -q "$SENTINEL_START" "$RC_FILE" 2>/dev/null; then
    sed -i.bak "/^$SENTINEL_START/,/^$SENTINEL_END/d" "$RC_FILE"
    rm -f "${RC_FILE}.bak"

    echo ""
    echo "[git-guard] Successfully removed wrapper from $RC_FILE"

    if [ "$SHELL_TYPE" = "zsh" ]; then
      echo "[git-guard] Reload your shell with: exec zsh"
    else
      echo "[git-guard] Reload your shell with: source ~/.bashrc"
    fi
    echo ""
  fi
}

main
