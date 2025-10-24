#!/bin/bash

# Better deploy script that commits changes first
set -e  # Exit on error

echo "🚀 Starting deployment..."

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "📝 Found uncommitted changes. Committing them..."
  git add .

  # Ask for commit message or use default
  read -p "Enter commit message (or press Enter for 'Update'): " commit_msg
  commit_msg=${commit_msg:-"Update"}

  git commit -m "$commit_msg"
  echo "✅ Changes committed!"
else
  echo "✅ No uncommitted changes found"
fi

# Push to master
echo "⬆️  Pushing to master..."
git push origin master

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to gh-pages
echo "🚢 Deploying to gh-pages..."
git push origin `git subtree split --prefix dist master`:gh-pages --force

echo "✨ Deployment complete!"
echo "🌐 Your site will be live at https://marimeireles.com in a few minutes"
