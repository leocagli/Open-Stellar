#!/bin/bash
# Setup script to add Open-Stellar as a remote repository
# This script adds the stellar remote and configures it for pushing

set -e

echo "Setting up Open-Stellar remote repository..."

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "Error: Not in a git repository. Please run this from your repository root."
    exit 1
fi

# Add the stellar remote
REMOTE_URL="https://github.com/leocagli/Open-Stellar.git"
REMOTE_NAME="stellar"

# Check if remote already exists
if git remote | grep -q "^${REMOTE_NAME}$"; then
    echo "Remote '${REMOTE_NAME}' already exists. Updating URL..."
    git remote set-url "${REMOTE_NAME}" "${REMOTE_URL}"
else
    echo "Adding remote '${REMOTE_NAME}'..."
    git remote add "${REMOTE_NAME}" "${REMOTE_URL}"
fi

echo "Remote configuration:"
git remote -v | grep "${REMOTE_NAME}"

echo ""
echo "✓ Setup complete!"
echo ""
echo "To push your main branch to the stellar remote, run:"
echo "  git push -u ${REMOTE_NAME} main"
