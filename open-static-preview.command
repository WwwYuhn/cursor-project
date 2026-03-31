#!/bin/zsh

cd "/Users/yuhan/Desktop/cursor-project" || exit 1

echo "Exporting static site..."
npm run export:static || exit 1

echo "Starting local static server at http://127.0.0.1:4173"
echo "Press Control+C to stop the server."

open "http://127.0.0.1:4173"
python3 -m http.server 4173 -d out
