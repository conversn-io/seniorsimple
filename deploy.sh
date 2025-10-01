#!/bin/bash

# Git-based deployment script for SeniorSimple
echo "🚀 Starting git-based deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project root directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "📦 Adding all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Deploy navigation fixes and improvements to production"
fi

# Push to GitHub (this will trigger Vercel deployment)
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated! Vercel will automatically deploy the changes."
echo "🔗 Check deployment status at: https://vercel.com/dashboard"
echo "🌍 Production URL: https://seniorsimple.vercel.app"
