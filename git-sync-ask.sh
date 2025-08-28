#!/usr/bin/env bash
set -euo pipefail

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
BRANCH="${1:-$CURRENT_BRANCH}"

# Ensure we are inside a git repository
git rev-parse --is-inside-work-tree >/dev/null

# Ensure upstream is set
if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  git branch --set-upstream-to="origin/$BRANCH" "$BRANCH" || true
fi

# Fetch latest changes
git fetch origin "$BRANCH" >/dev/null 2>&1 || true
echo "=== Preflight ==="
echo "Branch: $BRANCH"
git status --short
echo
echo "Diff vs origin/$BRANCH (summary):"
git --no-pager diff --stat "origin/$BRANCH"...HEAD || true
echo "================="
echo

# Ask for permission
read -r -p "Sync with GitHub now? (y/N) " answer
case "$answer" in
  [yY][eE][sS]|[yY]) ;;
  *) echo "Sync skipped."; exit 0 ;;
esac

# Ask for commit message
DEFAULT_MSG="Quick sync"
MSG="${2:-}"
if [ -z "$MSG" ]; then
  read -r -p "Commit message [$DEFAULT_MSG]: " MSG
  MSG="${MSG:-$DEFAULT_MSG}"
fi

# Stash uncommitted changes and pull latest
git stash -q --include-untracked || true
git pull --rebase origin "$BRANCH" || { echo "Pull/rebase failed. Resolve conflicts and re-run."; exit 1; }
git stash pop -q || true

# Stage and commit changes if any
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "$MSG" || true
  else
    echo "Nothing staged to commit."
  fi
else
  echo "No local changes to commit."
fi

# Push changes
git push origin "$BRANCH"
echo "Sync complete."
