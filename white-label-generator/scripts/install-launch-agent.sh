#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLIST_TEMPLATE="$PROJECT_ROOT/deploy/com.longpai.white-label-generator.plist"
TARGET_DIR="$HOME/Library/LaunchAgents"
TARGET_PLIST="$TARGET_DIR/com.longpai.white-label-generator.plist"
PREFERRED_NODE="$HOME/.local/node-v22.22.3/bin/node"

if [[ -x "$PREFERRED_NODE" ]]; then
  NODE_PATH="$PREFERRED_NODE"
else
  NODE_PATH="$(command -v node)"
fi

mkdir -p "$TARGET_DIR"
cp "$PLIST_TEMPLATE" "$TARGET_PLIST"

sed -i '' "s#__PROJECT_ROOT__#$PROJECT_ROOT#g" "$TARGET_PLIST"
sed -i '' "s#__NODE_PATH__#$NODE_PATH#g" "$TARGET_PLIST"

launchctl unload "$TARGET_PLIST" >/dev/null 2>&1 || true
launchctl load "$TARGET_PLIST"

echo "LaunchAgent installed at $TARGET_PLIST"
echo "Use 'launchctl kickstart -k gui/$(id -u)/com.longpai.white-label-generator' to restart."
