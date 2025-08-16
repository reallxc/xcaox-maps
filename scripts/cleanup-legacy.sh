#!/bin/bash

# Script to clean up legacy JavaScript files after TypeScript migration
# Run this after verifying the TypeScript version works correctly

echo "🧹 Cleaning up legacy JavaScript files..."

# Remove the legacy JS files
if [ -d "src/js" ]; then
    echo "Removing src/js/ directory..."
    rm -rf src/js/
    echo "✅ Removed src/js/"
else
    echo "ℹ️ src/js/ directory not found"
fi

# Remove the original server.js if it exists
if [ -f "server.js" ]; then
    echo "Removing legacy server.js..."
    rm server.js
    echo "✅ Removed server.js"
else
    echo "ℹ️ Legacy server.js not found"
fi

echo "🎉 Cleanup complete! Your project is now fully TypeScript."
echo "📝 Make sure to commit these changes to version control."
