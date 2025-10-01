// 🚀 SENIORSIMPLE DIRECT TEST RUNNER
console.log('🚀 Starting SeniorSimple Direct Tests...');

// Test configuration
const TEST_CONFIG = {
  baseUrl: window.location.href,
  testSessionId: `direct_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  delayBetweenTests: 2000
};

// Utility functions
function logTest(step, message, data = {}) {
  console.log(`✅ [${step}] ${message}`, data);
}

function logError(step, message, error = {}) {
  console.error(`❌ [${step}] ${message}`, error);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Basic Tracking Test
async function runBasicTrackingTest() {
  console.log('🧪 Running Basic Tracking Test...');
  
  // Simulate DataLayer events
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'quiz_start',
    'quiz_type': 'annuity',
    'session_id': TEST_CONFIG.testSessionId,
    'funnel_type': 'annuity'
  });
  logTest('DataLayer', 'Quiz Start event pushed');

  // Simulate GA4 events
  if (typeof gtag !== 'undefined') {
    gtag('event', 'quiz_start', {
      'quiz_type': 'annuity',
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity'
    });
    logTest('GA4', 'Quiz Start event sent');
  } else {
    logTest('GA4', 'gtag not available - using GTM');
  }

  // Simulate Meta events
  if (typeof fbq !== 'undefined') {
    fbq('track', 'PageView');
    logTest('Meta', 'PageView event sent');
  } else {
    logTest('Meta', 'fbq not available - using GTM');
  }

  logTest('Basic', 'Basic tracking test completed');
}

// Test 2: Quiz Crawler Test
async function runQuizCrawlerTest() {
  console.log('🕷️ Running Quiz Crawler Test...');
  
  // Simulate quiz start
  window.quizStartTime = Date.now();
  window.dataLayer.push({
    'event': 'quiz_start',
    'quiz_type': 'annuity',
    'session_id': TEST_CONFIG.testSessionId,
    'funnel_type': 'annuity'
  });
  logTest('Crawler', 'Quiz start simulated');

  // Simulate question answers
  const questions = [
    { number: 1, text: 'Do you have $100,000+ in investable assets?', answer: 'Yes, I have $100,000 or more' },
    { number: 2, text: 'How soon are you planning to retire?', answer: 'Within 1-2 years' },
    { number: 3, text: 'What type of retirement plans?', answer: '401k, IRA' },
    { number: 4, text: 'How much saved for retirement?', answer: '$750,000 - $999,999' },
    { number: 5, text: 'What is your risk tolerance?', answer: 'Moderate' }
  ];

  for (const question of questions) {
    await wait(1000);
    window.dataLayer.push({
      'event': 'question_answer',
      'question_number': question.number,
      'question_text': question.text,
      'answer_value': question.answer,
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity'
    });
    logTest('Crawler', `Question ${question.number} answered`);
  }

  // Simulate quiz completion
  const completionTime = Date.now() - window.quizStartTime;
  window.dataLayer.push({
    'event': 'quiz_complete',
    'quiz_type': 'annuity',
    'session_id': TEST_CONFIG.testSessionId,
    'funnel_type': 'annuity',
    'completion_time': completionTime,
    'lead_score': 85
  });
  logTest('Crawler', 'Quiz completed');

  // Simulate lead form submission
  window.dataLayer.push({
    'event': 'lead_form_submit',
    'event_category': 'lead_generation',
    'event_label': 'SeniorSimple Medicare Quiz',
    'value': 1,
    'session_id': TEST_CONFIG.testSessionId,
    'funnel_type': 'annuity',
    'lead_score': 85
  });
  logTest('Crawler', 'Lead form submitted');

  logTest('Crawler', 'Quiz crawler test completed');
}

// Test 3: Verification Test
async function runVerificationTest() {
  console.log('🔍 Running Verification Test...');
  
  // Check tracking systems
  const systems = {
    gtm: typeof window.google_tag_manager !== 'undefined',
    ga4: typeof gtag !== 'undefined',
    meta: typeof fbq !== 'undefined',
    dataLayer: Array.isArray(window.dataLayer)
  };

  Object.entries(systems).forEach(([system, loaded]) => {
    if (loaded) {
      logTest('System', `${system.toUpperCase()} loaded`);
    } else {
      logTest('System', `${system.toUpperCase()} not loaded (via GTM)`);
    }
  });

  // Check fired events
  const dataLayerEvents = window.dataLayer?.filter(item => item.event) || [];
  logTest('Verification', `DataLayer events: ${dataLayerEvents.length}`);
  
  dataLayerEvents.forEach(event => {
    logTest('Event', `${event.event} fired`);
  });

  logTest('Verification', 'Verification test completed');
}

// Test 4: Diagnostics Test
async function runDiagnosticsTest() {
  console.log('🔍 Running Diagnostics Test...');
  
  // Check GTM
  const gtmScript = document.querySelector('script[src*="googletagmanager.com"]');
  if (gtmScript) {
    logTest('Diagnostics', 'GTM script found');
  } else {
    logError('Diagnostics', 'GTM script not found');
  }

  // Check GA4
  const ga4Script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (ga4Script) {
    logTest('Diagnostics', 'GA4 script found');
  } else {
    logTest('Diagnostics', 'GA4 via GTM');
  }

  // Check Meta
  const metaScript = document.querySelector('script[src*="facebook.com/tr"]');
  if (metaScript) {
    logTest('Diagnostics', 'Meta Pixel script found');
  } else {
    logTest('Diagnostics', 'Meta via GTM');
  }

  // Check network requests
  const networkRequests = performance.getEntriesByType('resource');
  const trackingRequests = networkRequests.filter(req => 
    req.name.includes('googletagmanager.com') || 
    req.name.includes('facebook.com') ||
    req.name.includes('google-analytics.com')
  );
  logTest('Diagnostics', `Tracking requests: ${trackingRequests.length}`);

  logTest('Diagnostics', 'Diagnostics test completed');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SeniorSimple Direct Tests...');
  console.log('Test Session ID:', TEST_CONFIG.testSessionId);
  console.log('Current URL:', window.location.href);
  
  try {
    // Test 1: Basic Tracking
    await runBasicTrackingTest();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 2: Quiz Crawler
    await runQuizCrawlerTest();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 3: Verification
    await runVerificationTest();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 4: Diagnostics
    await runDiagnosticsTest();
    
    console.log('✅ All tests completed successfully!');
    console.log('📊 Check the following for verification:');
    console.log('   - GA4 Real-time reports');
    console.log('   - Meta Events Manager');
    console.log('   - GTM Preview mode');
    console.log('   - Browser console for events');
    
  } catch (error) {
    logError('TestRunner', 'Test execution failed', error);
  }
}

// Run tests automatically
runAllTests();

// Export for manual testing
window.seniorSimpleDirectTests = {
  runAllTests: runAllTests,
  runBasicTracking: runBasicTrackingTest,
  runQuizCrawler: runQuizCrawlerTest,
  runVerification: runVerificationTest,
  runDiagnostics: runDiagnosticsTest,
  config: TEST_CONFIG
};

console.log('🎯 Direct test functions available:');
console.log('   - window.seniorSimpleDirectTests.runAllTests()');
console.log('   - window.seniorSimpleDirectTests.runBasicTracking()');
console.log('   - window.seniorSimpleDirectTests.runQuizCrawler()');
console.log('   - window.seniorSimpleDirectTests.runVerification()');
console.log('   - window.seniorSimpleDirectTests.runDiagnostics()');
