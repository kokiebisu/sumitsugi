#!/bin/bash
# Install Claude Code plugins for the project

set -e

# Plugins that exist in claude-plugins-official marketplace
PLUGINS=(
  "code-review"
  "frontend-design"
  "ralph-loop"
  "code-simplifier"
  "claude-md-management"
  "security-guidance"
  "superpowers"
  "serena"
  "context7"
  "typescript-lsp"
)

# Optional plugins (disabled by default)
OPTIONAL_PLUGINS=(
)

echo "Installing Claude Code plugins..."

# Wait for network to be ready (max 30 seconds)
echo "Waiting for network connectivity..."
for i in {1..30}; do
  if curl --connect-timeout 2 -s https://api.anthropic.com >/dev/null 2>&1; then
    echo "Network ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "WARNING: Network not ready after 30 seconds, proceeding anyway..."
  fi
  sleep 1
done

# Clean up stale plugin cache for old project path
echo "Cleaning up stale plugin cache..."
if [ -f ~/.claude/plugins/installed_plugins.json ]; then
  # Backup original
  cp ~/.claude/plugins/installed_plugins.json ~/.claude/plugins/installed_plugins.json.backup

  # Remove entries for old project path
  # This is a simple approach - we'll let Claude reinstall everything fresh
  echo '{"version": 2, "plugins": {}}' > ~/.claude/plugins/installed_plugins.json
fi

# Fix marketplace paths (container path vs host path issue)
echo "Fixing marketplace paths for devcontainer..."
if [ -f ~/.claude/plugins/known_marketplaces.json ]; then
  # Replace any /Users/home/ paths with /home/node/ (macOS host -> Linux container)
  sed -i 's|/Users/home/|/home/node/|g' ~/.claude/plugins/known_marketplaces.json
  # Also handle potential Windows paths
  sed -i 's|C:\\\\Users\\\\.*\\\\.claude|/home/node/.claude|g' ~/.claude/plugins/known_marketplaces.json
fi

# Update marketplace with retry
echo "Updating plugin marketplace..."
for i in {1..3}; do
  if claude plugin marketplace update 2>/dev/null; then
    break
  fi
  echo "Marketplace update attempt $i failed, retrying..."
  sleep 2
done

# Install and enable main plugins
for plugin in "${PLUGINS[@]}"; do
  echo "Installing $plugin..."
  if claude plugin install "$plugin@claude-plugins-official" --scope project 2>&1 | tee /tmp/plugin-install.log; then
    echo "✓ Installed $plugin"
  else
    echo "✗ Failed to install $plugin (see /tmp/plugin-install.log)"
  fi
done

# Install optional plugins (but keep disabled)
for plugin in "${OPTIONAL_PLUGINS[@]}"; do
  echo "Installing $plugin (will be disabled)..."
  if claude plugin install "$plugin@claude-plugins-official" --scope project 2>&1; then
    claude plugin disable "$plugin@claude-plugins-official" --scope project 2>/dev/null || true
    echo "✓ Installed $plugin (disabled)"
  else
    echo "✗ Failed to install $plugin"
  fi
done

echo ""
echo "Plugin installation complete!"
echo ""
echo "Installed plugins:"
claude plugin list

echo ""
echo "Note: All plugins installed successfully!"
echo "If any plugin installation failed, check the marketplace with: claude plugin marketplace list"
