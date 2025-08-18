#!/bin/bash

# Setup script to .customize and setup the project
# Usage: ./setup.sh <new-project-name>

set -e  # Exit on any error

# Check if project name argument is provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide a project name as the first argument"
    echo "Usage: $0 <new-project-name>"
    exit 1
fi

NEW_PROJECT_NAME="$1"

# Validate project name (basic validation for npm package names)
if [[ ! "$NEW_PROJECT_NAME" =~ ^[a-z0-9@._/-]+$ ]]; then
    echo "Warning: Project name '$NEW_PROJECT_NAME' may not be a valid npm package name"
    echo "Consider using lowercase letters, numbers, hyphens, and underscores only"
fi

echo "Setting up project with name: $NEW_PROJECT_NAME"

# Check if required files exist
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    exit 1
fi

if [ ! -f "wrangler.jsonc" ]; then
    echo "Error: wrangler.jsonc not found in current directory"
    exit 1
fi

# Extract current project name from package.json
echo "Reading current project name from package.json..."
CURRENT_PROJECT_NAME=$(grep -o '"name":[[:space:]]*"[^"]*"' package.json | sed 's/"name":[[:space:]]*"\([^"]*\)"/\1/')

if [ -z "$CURRENT_PROJECT_NAME" ]; then
    echo "Error: Could not extract project name from package.json"
    exit 1
fi

echo "Current project name: $CURRENT_PROJECT_NAME"

if [ "$CURRENT_PROJECT_NAME" = "$NEW_PROJECT_NAME" ]; then
    echo "Project name is already set to '$NEW_PROJECT_NAME'. No changes needed."
    exit 0
fi

# Create backup files
echo "Creating backup files..."
cp package.json package.json.backup
cp wrangler.jsonc wrangler.jsonc.backup

# Replace in package.json
echo "Updating package.json..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed syntax
    sed -i '' "s/\"$CURRENT_PROJECT_NAME\"/\"$NEW_PROJECT_NAME\"/g" package.json
else
    # Linux sed syntax
    sed -i "s/\"$CURRENT_PROJECT_NAME\"/\"$NEW_PROJECT_NAME\"/g" package.json
fi

# Replace in wrangler.jsonc
echo "Updating wrangler.jsonc..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed syntax
    sed -i '' "s/\"$CURRENT_PROJECT_NAME\"/\"$NEW_PROJECT_NAME\"/g" wrangler.jsonc
else
    # Linux sed syntax
    sed -i "s/\"$CURRENT_PROJECT_NAME\"/\"$NEW_PROJECT_NAME\"/g" wrangler.jsonc
fi

# Verify the changes
echo "Verifying changes..."
NEW_NAME_IN_PACKAGE=$(grep -o '"name":[[:space:]]*"[^"]*"' package.json | sed 's/"name":[[:space:]]*"\([^"]*\)"/\1/')
if [ "$NEW_NAME_IN_PACKAGE" != "$NEW_PROJECT_NAME" ]; then
    echo "Error: Failed to update package.json correctly"
    echo "Restoring backup files..."
    mv package.json.backup package.json
    mv wrangler.jsonc.backup wrangler.jsonc
    exit 1
fi

# Check if wrangler.jsonc was updated
WRANGLER_NAME_COUNT=$(grep -c "\"$NEW_PROJECT_NAME\"" wrangler.jsonc)
if [ "$WRANGLER_NAME_COUNT" -eq 0 ]; then
    echo "Error: Failed to update wrangler.jsonc correctly"
    echo "Restoring backup files..."
    mv package.json.backup package.json
    mv wrangler.jsonc.backup wrangler.jsonc
    exit 1
fi

# Clean up backup files
rm package.json.backup wrangler.jsonc.backup

# Create KV namespace
wrangler kv namespace create "$NEW_PROJECT_NAME"

echo "✅ Successfully updated project name from '$CURRENT_PROJECT_NAME' to '$NEW_PROJECT_NAME'"