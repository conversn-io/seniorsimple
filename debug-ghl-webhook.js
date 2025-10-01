// Debug script to test GHL webhook issue
const testPayload = {
  phoneNumber: "+18587524266",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  quizAnswers: { test: "data" },
  sessionId: "test_session_123",
  funnelType: "annuity",
  zipCode: "12345",
  state: "CA",
  stateName: "California",
  licensingInfo: { state: "CA" },
  calculatedResults: { score: 75 }
};

console.log('🔍 GHL Webhook Debug Test');
console.log('📤 Test Payload:', JSON.stringify(testPayload, null, 2));

// Test the API endpoint
fetch('https://www.seniorsimple.org/api/leads/verify-otp-and-send-to-ghl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('📊 Response Status:', response.status);
  console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log('📊 Response Body:', data);
})
.catch(error => {
  console.error('❌ Request Failed:', error);
});



