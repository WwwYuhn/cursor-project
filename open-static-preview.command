#!/bin/zsh

cd "/Users/yuhan/Desktop/cursor-project" || exit 1

echo "Exporting static site..."
npm run export:static || exit 1

echo "Starting local static server (free port on 127.0.0.1)..."
exec node scripts/static-serve.mjs --open
