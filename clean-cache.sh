#!/bin/bash
echo "Stopping any running Node processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "Removing corrupted cache directories..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

echo "Cache cleaned successfully!"
echo "Now run: npm run dev"
