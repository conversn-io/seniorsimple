#!/bin/bash

# Deploy UTM Tracking Edge Function to Supabase
echo "🚀 Deploying UTM Tracking Edge Function to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy the track-utm function
echo "📤 Deploying track-utm function..."
cd ../seniorsimple-supabase-functions
supabase functions deploy track-utm --project-ref jqjftrlnyysqcwbbigpw

if [ $? -eq 0 ]; then
    echo "✅ UTM Tracking Edge Function deployed successfully!"
    echo "🔗 Function URL: https://jqjftrlnyysqcwbbigpw.supabase.co/functions/v1/track-utm"
else
    echo "❌ Failed to deploy UTM Tracking Edge Function"
    exit 1
fi

echo "🎉 UTM Tracking implementation complete!"
echo ""
echo "📋 What was implemented:"
echo "  ✅ UTM parameter extraction utilities"
echo "  ✅ UTM tracking integration in AnnuityQuiz component"
echo "  ✅ UTM parameters included in API routes"
echo "  ✅ Supabase Edge Function for UTM tracking"
echo "  ✅ Session-based tracking to prevent duplicates"
echo ""
echo "🧪 To test:"
echo "  1. Visit quiz with UTM parameters: /quiz?utm_source=google&utm_medium=cpc&utm_campaign=test"
echo "  2. Check browser console for UTM tracking logs"
echo "  3. Check Supabase analytics_events table for utm_tracked events"
