#!/bin/bash

# Setup Claude Code plugins
# This script installs all required Claude Code plugins for the project

set -e

echo "Setting up Claude Code plugins..."

# Check if claude command is available
if ! command -v claude &> /dev/null; then
    echo "Error: Claude Code CLI is not installed or not in PATH"
    echo "Please install Claude Code first: curl -fsSL https://claude.ai/install.sh | bash"
    exit 1
fi

# Add Superpowers marketplace
echo "Adding Superpowers marketplace..."
claude /plugin marketplace add obra/superpowers-marketplace || true

# Install Superpowers plugin
echo "Installing Superpowers plugin..."
claude /plugin install superpowers@superpowers-marketplace || true

# Install Ralph Loop plugin
echo "Installing Ralph Loop plugin..."
claude /plugin install ralph-loop@claude-plugins-official || true

echo ""
echo "Plugin setup complete!"
echo ""
echo "Installed plugins:"
echo "  - Superpowers (TDD, planning, and review workflows)"
echo "  - Ralph Loop (Interactive development loop)"
echo ""
