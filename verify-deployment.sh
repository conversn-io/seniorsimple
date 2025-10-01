#!/bin/bash

# Verification script for deployment
echo "🔍 Verifying deployment status..."

# Test production URLs
echo "🌐 Testing production URLs..."

# Test main navigation links
echo "Testing main category pages..."
curl -s -o /dev/null -w "Homepage: %{http_code}\n" https://seniorsimple.vercel.app/
curl -s -o /dev/null -w "Retirement: %{http_code}\n" https://seniorsimple.vercel.app/retirement
curl -s -o /dev/null -w "Housing: %{http_code}\n" https://seniorsimple.vercel.app/housing
curl -s -o /dev/null -w "Health: %{http_code}\n" https://seniorsimple.vercel.app/health

echo ""
echo "Testing fixed calculator links..."
curl -s -o /dev/null -w "Social Security Calculator: %{http_code}\n" https://seniorsimple.vercel.app/content/social-security-optimization-calculator
curl -s -o /dev/null -w "Roth Conversion Guide: %{http_code}\n" https://seniorsimple.vercel.app/content/roth-conversion-strategy-guide
curl -s -o /dev/null -w "Tax Impact Calculator: %{http_code}\n" https://seniorsimple.vercel.app/content/tax-impact-strategy-guide
curl -s -o /dev/null -w "Medicare Cost Calculator: %{http_code}\n" https://seniorsimple.vercel.app/content/medicare-cost-strategy-guide

echo ""
echo "Testing resource links..."
curl -s -o /dev/null -w "Medicare Planning Guide: %{http_code}\n" https://seniorsimple.vercel.app/content/medicare-planning-guide
curl -s -o /dev/null -w "Life Insurance Guide: %{http_code}\n" https://seniorsimple.vercel.app/content/life-insurance-strategy-guide

echo ""
echo "✅ Verification complete!"
echo "🔗 Production URL: https://seniorsimple.vercel.app"
echo "📊 Vercel Dashboard: https://vercel.com/dashboard"
