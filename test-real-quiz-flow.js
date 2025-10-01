// Debug script to test the actual quiz submission flow
console.log('🔍 Testing Real Quiz Submission Flow...');

// Monitor all DataLayer pushes
const originalPush = window.dataLayer.push;
window.dataLayer.push = function(...args) {
  console.log('📊 DataLayer Push Detected:', args);
  return originalPush.apply(this, args);
};

// Monitor console errors
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 Console Error Detected:', args);
  return originalError.apply(this, args);
};

// Monitor network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Network Request:', args[0]);
  return originalFetch.apply(this, args);
};

// Check if tracking functions are available
console.log('🔍 Checking Tracking Functions...');
if (typeof window !== 'undefined') {
  // Check if the tracking functions are loaded
  console.log('📊 Window object keys containing "track":', 
    Object.keys(window).filter(key => key.toLowerCase().includes('track')));
  
  // Check if there are any global tracking functions
  console.log('📊 Available functions:', Object.keys(window).filter(key => 
    typeof window[key] === 'function' && key.includes('track')));
}

// Monitor for any JavaScript errors that might prevent tracking
window.addEventListener('error', function(e) {
  console.log('🚨 JavaScript Error:', e.error, e.message, e.filename, e.lineno);
});

// Monitor for unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
  console.log('🚨 Unhandled Promise Rejection:', e.reason);
});

console.log('✅ Debug monitoring active!');
console.log('🎯 Now complete the quiz normally and watch for:');
console.log('   1. DataLayer pushes');
console.log('   2. Console errors');
console.log('   3. Network requests');
console.log('   4. Any JavaScript errors that might prevent tracking');

// Test the exact same data structure that the quiz would use
console.log('🧪 Testing with quiz-like data structure...');
if (typeof window !== 'undefined' && window.dataLayer) {
  const quizLikeData = {
    event: 'lead_form_submit',
    lead_data: {
      firstName: 'Quiz',
      lastName: 'Test',
      email: 'quiz@test.com',
      phoneNumber: '555-QUIZ',
      zipCode: '12345',
      state: 'CA',
      sessionId: 'quiz_test_' + Date.now(),
      funnelType: 'annuity',
      leadScore: 75
    },
    lead_source: 'seniorsimple_platform',
    funnel_type: 'annuity',
    session_id: 'quiz_test_' + Date.now(),
    lead_score: 75
  };
  
  window.dataLayer.push(quizLikeData);
  console.log('✅ Quiz-like data pushed to DataLayer');
}
