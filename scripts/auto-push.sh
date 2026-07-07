#!/bin/bash
# Daily auto-push for gongshangzheng.github.io
# Commits and pushes any local changes to main branch

REPO_DIR="$HOME/gongshangzheng.github.io"
LOG_FILE="/tmp/gongshangzheng-auto-push.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cd "$REPO_DIR" || {
  echo "$TIMESTAMP ERROR: Cannot cd to $REPO_DIR" >> "$LOG_FILE"
  exit 1
}

# Check if there are uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
  echo "$TIMESTAMP No changes, skip" >> "$LOG_FILE"
  exit 0
fi

# Stage all changes
git add -A

# Commit with date-based message
COMMIT_MSG="auto: daily push $(date '+%Y-%m-%d')"
git commit -m "$COMMIT_MSG" >> "$LOG_FILE" 2>&1

# Push to origin main
if git push origin main >> "$LOG_FILE" 2>&1; then
  echo "$TIMESTAMP OK: $COMMIT_MSG" >> "$LOG_FILE"
else
  echo "$TIMESTAMP ERROR: Push failed (will retry next run)" >> "$LOG_FILE"
fi
