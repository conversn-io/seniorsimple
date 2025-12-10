#!/bin/bash

# Test script for booking confirmation webhook
# Usage: ./test-webhook.sh [preview-url] [email] [secret]

PREVIEW_URL="${1:-https://seniorsimple-q9gwjnre7-conversns-projects.vercel.app}"
TEST_EMAIL="${2:-test@example.com}"
SECRET="${3:-6af17ffe-d4fe-4b53-aa81-8f11e311aba4}"

ENDPOINT="${PREVIEW_URL}/api/booking/confirm"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Booking Confirmation Webhook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: ${ENDPOINT}"
echo "Email: ${TEST_EMAIL}"
echo "Secret: ${SECRET}"
echo ""

# Test POST (simulate GHL webhook)
echo "📤 Sending POST request (simulating GHL webhook)..."
POST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "x-booking-secret: ${SECRET}" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"phone\": \"+18585046544\",
    \"name\": \"Test User\",
    \"appointmentId\": \"test-appt-123\",
    \"event\": \"appointment.created\",
    \"bookingTimes\": \"2025-12-15T14:00:00Z\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

HTTP_STATUS=$(echo "$POST_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$POST_RESPONSE" | sed '/HTTP_STATUS/d')

echo "Response Status: ${HTTP_STATUS}"
echo "Response Body: ${BODY}"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ POST successful!"
  echo ""
  
  # Wait a moment for processing
  echo "⏳ Waiting 2 seconds..."
  sleep 2
  
  # Test GET (polling)
  echo "📥 Polling GET endpoint..."
  GET_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${ENDPOINT}?email=${TEST_EMAIL}")
  
  GET_HTTP_STATUS=$(echo "$GET_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
  GET_BODY=$(echo "$GET_RESPONSE" | sed '/HTTP_STATUS/d')
  
  echo "Response Status: ${GET_HTTP_STATUS}"
  echo "Response Body: ${GET_BODY}"
  echo ""
  
  if echo "$GET_BODY" | grep -q '"confirmed":true'; then
    echo "✅✅ Confirmation found! Webhook is working correctly."
  else
    echo "⚠️ Confirmation not found. Check if webhook was processed."
  fi
else
  echo "❌ POST failed. Check endpoint URL and secret."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

