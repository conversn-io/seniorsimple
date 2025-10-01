#!/bin/bash

# Deploy Supabase Edge Functions
# This script deploys the OTP functions to the CallReady Quiz Supabase project

echo "🚀 Deploying Supabase Edge Functions..."

# Set the Supabase project URL
SUPABASE_URL="https://jqjftrlnyysqcwbbigpw.supabase.co"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "   supabase login"
    exit 1
fi

echo "📦 Deploying send-otp function..."
supabase functions deploy send-otp --project-ref jqjftrlnyysqcwbbigpw

if [ $? -eq 0 ]; then
    echo "✅ send-otp function deployed successfully"
else
    echo "❌ Failed to deploy send-otp function"
    exit 1
fi

echo "📦 Deploying verify-otp function..."
supabase functions deploy verify-otp --project-ref jqjftrlnyysqcwbbigpw

if [ $? -eq 0 ]; then
    echo "✅ verify-otp function deployed successfully"
else
    echo "❌ Failed to deploy verify-otp function"
    exit 1
fi

echo "🎉 All functions deployed successfully!"
echo ""
echo "📋 Function URLs:"
echo "   Send OTP: ${SUPABASE_URL}/functions/v1/send-otp"
echo "   Verify OTP: ${SUPABASE_URL}/functions/v1/verify-otp"
echo ""
echo "🔧 Environment Variables Required:"
echo "   SUPABASE_URL=${SUPABASE_URL}"
echo "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "✅ Ready for testing!"




