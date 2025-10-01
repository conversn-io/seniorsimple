# 🚀 Git-Based Deployment Guide

## Overview
This project uses **Vercel** for hosting with **GitHub** integration for automatic deployments.

## Current Setup
- **Platform**: Vercel
- **Production URL**: https://seniorsimple.vercel.app
- **GitHub Repository**: https://github.com/conversn-io/seniorsimple
- **Branch**: main

## Deployment Process

### Automatic Deployment (Recommended)
1. **Make changes** to your code
2. **Commit changes** locally:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to GitHub**:
   ```bash
   git push origin main
   ```
4. **Vercel automatically deploys** the changes to production

### Manual Deployment Script
Use the provided deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Recent Changes Deployed
- ✅ Fixed all broken calculator links in mega menu
- ✅ Updated resource links to point to existing content
- ✅ Added intelligent related content suggestions
- ✅ Eliminated 404 errors in navigation

## Verification Steps
After deployment, verify the fixes by testing these previously broken links:
- `/content/social-security-optimization-calculator`
- `/content/roth-conversion-strategy-guide`
- `/content/tax-impact-strategy-guide`
- `/content/medicare-cost-strategy-guide`
- `/content/reverse-mortgage-strategy-guide`

## Troubleshooting
- **Deployment not triggered**: Check Vercel dashboard for build status
- **404s still present**: Clear browser cache and check deployment logs
- **Git issues**: Ensure you have proper GitHub access and repository permissions

## Environment Variables
Make sure these are configured in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Support
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repository: https://github.com/conversn-io/seniorsimple
- Production Site: https://seniorsimple.vercel.app
