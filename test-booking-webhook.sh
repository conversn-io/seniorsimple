#!/bin/bash

# Test script for booking confirmation webhook
# Tests both POST (webhook) and GET (polling) endpoints

# Configuration
BASE_URL="${1:-https://seniorsimple-g0dhu13ta-conversns-projects.vercel.app}"
TEST_EMAIL="${2:-test@example.com}"
TEST_PHONE="${3:-+18585046544}"
WEBHOOK_SECRET="${4:-6af17ffe-d4fe-4b53-aa81-8f11e311aba4}" # Default from previous conversation

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Booking Confirmation Webhook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Base URL: $BASE_URL"
echo "📧 Test Email: $TEST_EMAIL"
echo "📱 Test Phone: $TEST_PHONE"
echo "🔐 Webhook Secret: ${WEBHOOK_SECRET:0:20}..."
echo ""

# Test 1: POST webhook (simulate GHL webhook)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 TEST 1: POST Webhook (Simulate GHL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

POST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/booking/confirm" \
  -H "Content-Type: application/json" \
  -H "x-booking-secret: $WEBHOOK_SECRET" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"phone\": \"$TEST_PHONE\",
    \"name\": \"Test User\",
    \"appointmentId\": \"test-appt-$(date +%s)\",
    \"event\": \"appointment.created\",
    \"customData\": {
      \"bookingTimes\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
      \"appointmentId\": \"test-appt-$(date +%s)\"
    },
    \"appointment\": {
      \"id\": \"test-appt-$(date +%s)\",
      \"start_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }
  }")

HTTP_CODE=$(echo "$POST_RESPONSE" | tail -n1)
BODY=$(echo "$POST_RESPONSE" | sed '$d')

echo "📥 Response Status: $HTTP_CODE"
echo "📋 Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ POST test failed with status $HTTP_CODE"
  exit 1
fi

echo "✅ POST webhook test passed!"
echo ""

# Wait a moment for data to be stored
echo "⏳ Waiting 2 seconds for data to be stored..."
sleep 2

# Test 2: GET polling endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 TEST 2: GET Polling Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

GET_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/booking/confirm?email=$(echo $TEST_EMAIL | jq -sRr @uri)")

HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
BODY=$(echo "$GET_RESPONSE" | sed '$d')

echo "📥 Response Status: $HTTP_CODE"
echo "📋 Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

CONFIRMED=$(echo "$BODY" | jq -r '.confirmed' 2>/dev/null)

if [ "$CONFIRMED" = "true" ]; then
  echo "✅ GET polling test passed! Booking confirmed."
  echo ""
  echo "📊 Booking Details:"
  echo "$BODY" | jq '{name, email, phone, source, payload}' 2>/dev/null || echo "$BODY"
else
  echo "❌ GET polling test failed - booking not confirmed"
  echo "   This could mean:"
  echo "   - Data wasn't stored correctly"
  echo "   - Different serverless instance handled GET request"
  echo "   - Data expired (shouldn't happen in 2 seconds)"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

