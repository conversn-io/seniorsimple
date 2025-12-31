#!/bin/bash

# Monitor script for booking confirmation webhook
# Watches for incoming GHL webhook POSTs
# Usage: ./monitor-webhook.sh [preview-url] [email-to-watch]

PREVIEW_URL="${1:-https://seniorsimple-q9gwjnre7-conversns-projects.vercel.app}"
WATCH_EMAIL="${2:-}"

ENDPOINT="${PREVIEW_URL}/api/booking/confirm"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👀 Monitoring Booking Confirmation Webhook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: ${ENDPOINT}"
if [ -n "$WATCH_EMAIL" ]; then
  echo "Watching for email: ${WATCH_EMAIL}"
else
  echo "⚠️  No email specified - will check all recent activity"
  echo "   Usage: ./monitor-webhook.sh [url] [email@example.com]"
fi
echo ""
echo "Waiting for GHL webhook POST..."
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$WATCH_EMAIL" ]; then
  echo "❌ Please provide an email to monitor:"
  echo "   ./monitor-webhook.sh ${PREVIEW_URL} your-email@example.com"
  exit 1
fi

LAST_CHECKED=$(date +%s)
POLL_INTERVAL=3  # Check every 3 seconds

while true; do
  # Poll the GET endpoint
  RESPONSE=$(curl -s "${ENDPOINT}?email=${WATCH_EMAIL}")
  
  if echo "$RESPONSE" | grep -q '"confirmed":true'; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ WEBHOOK RECEIVED!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    
    # Extract and display key info
    NAME=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    PHONE=$(echo "$RESPONSE" | grep -o '"phone":"[^"]*"' | cut -d'"' -f4)
    SOURCE=$(echo "$RESPONSE" | grep -o '"source":"[^"]*"' | cut -d'"' -f4)
    
    echo "📋 Details:"
    echo "   Name: ${NAME:-N/A}"
    echo "   Email: ${WATCH_EMAIL}"
    echo "   Phone: ${PHONE:-N/A}"
    echo "   Source: ${SOURCE:-N/A}"
    echo ""
    
    # Check for bookingTimes in payload
    if echo "$RESPONSE" | grep -q "bookingTimes"; then
      BOOKING_TIME=$(echo "$RESPONSE" | grep -o '"bookingTimes":"[^"]*"' | cut -d'"' -f4)
      echo "   📅 Booking Time: ${BOOKING_TIME:-N/A}"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Confirmation detected! Webhook is working."
    echo "   You can now test the booking flow."
    break
  else
    # Show a dot to indicate we're still waiting
    echo -n "."
    sleep $POLL_INTERVAL
  fi
done




