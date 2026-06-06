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

get_wrapper_template() {
  case "$1" in
    zsh) echo "zsh.env" ;;
    bash) echo "bash.env" ;;
  esac
}

main() {
  local SHELL_TYPE RC_FILE WRAPPER_TEMPLATE

  SHELL_TYPE=$(detect_shell)

  if [ "$SHELL_TYPE" = "unknown" ]; then
    echo "[git-guard] WARNING: Could not detect your shell (zsh or bash)."
    echo "[git-guard] Wrapper was not injected. Please add the wrapper manually:"
    echo "[git-guard]   zsh users: copy npm/wrappers/zsh.env into ~/.zshrc"
    echo "[git-guard]   bash users: copy npm/wrappers/bash.env into ~/.bashrc"
    exit 0
  fi

  RC_FILE=$(get_rc_file "$SHELL_TYPE")
  WRAPPER_TEMPLATE=$(get_wrapper_template "$SHELL_TYPE")

  if [ ! -f "$RC_FILE" ]; then
    touch "$RC_FILE"
  fi

  # Check if user has a custom GIT_GUARD_ALLOWED_BRANCH set outside the block
  local CUSTOM_BRANCH
  CUSTOM_BRANCH=$(grep -v "$SENTINEL_START" "$RC_FILE" 2>/dev/null | grep "export GIT_GUARD_ALLOWED_BRANCH=" | tail -1 | sed 's/.*export GIT_GUARD_ALLOWED_BRANCH=//' | sed 's/[[:space:]]*#.*//' | tr -d '[:space:]' || true)

  # Determine template path relative to package
  local TEMPLATE_PATH
  TEMPLATE_PATH="$(dirname "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")/wrappers/$WRAPPER_TEMPLATE"

  # Remove existing block if present (handles upgrades)
  if grep -q "$SENTINEL_START" "$RC_FILE" 2>/dev/null; then
    sed -i.bak "/^$SENTINEL_START/,/^$SENTINEL_END/d" "$RC_FILE"
    rm -f "${RC_FILE}.bak"
  fi

  # Append the wrapper template
  echo "" >> "$RC_FILE"
  cat "$TEMPLATE_PATH" >> "$RC_FILE"

  # If user had a custom branch set outside the block, replace the default in the block
  if [ -n "$CUSTOM_BRANCH" ] && [ "$CUSTOM_BRANCH" != "staging" ]; then
    sed -i.bak "s/^export GIT_GUARD_ALLOWED_BRANCH=staging/export GIT_GUARD_ALLOWED_BRANCH=$CUSTOM_BRANCH/" "$RC_FILE"
    rm -f "${RC_FILE}.bak"
  fi

  echo ""
  echo "[git-guard] Successfully injected wrapper into $RC_FILE"

  if [ "$SHELL_TYPE" = "zsh" ]; then
    echo "[git-guard] Reload your shell with: exec zsh"
  else
    echo "[git-guard] Reload your shell with: source ~/.bashrc"
  fi
  echo ""
}

main
