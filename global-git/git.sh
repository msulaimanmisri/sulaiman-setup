#!/bin/bash

echo ""
read -p "Commit message: " msg

if [ -z "$msg" ]; then
    echo "Commit message tak boleh kosong!"
    exit 1
fi

git add . && git commit -m "$msg"

echo ""
read -p "Are you confirm to push to remote? (Y/n): " confirm

if [ "$confirm" = "Y" ] || [ "$confirm" = "y" ] || [ "$confirm" = "Yes" ] || [ "$confirm" = "yes" ] || [ "$confirm" = "YES" ]; then
    git push
    echo "✅ Done!"
else
    echo "Push skipped."
fi