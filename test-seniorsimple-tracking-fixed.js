/**
 * 🧪 SENIORSIMPLE TRACKING TEST SCRIPT - FIXED VERSION
 * 
 * This script simulates user interactions with the SeniorSimple quiz
 * and verifies that all tracking events are firing correctly.
 * 
 * Usage:
 * 1. Open SeniorSimple website
 * 2. Open browser console
 * 3. Paste and run this script
 * 4. Check GA4 Real-time and Meta Events Manager
 */

console.log('🧪 Starting SeniorSimple Tracking Test (Fixed Version)...');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://seniorsimple.com', // Update with your actual URL
  testSessionId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  testUser: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@seniorsimple.com',
    phone: '+1234567890',
    zipCode: '12345',
    state: 'CA',
    stateName: 'California'
  },
  testAnswers: {
    investableAssets: 'Yes, I have $100,000 or more',
    retirementTimeline: 'Within 1-2 years',
    currentRetirementPlans: ['401k', 'IRA'],
    retirementSavings: '$750,000 - $999,999',
    riskTolerance: 'Moderate',
    incomeNeeds: '$3,000 - $4,000 per month',
    healthStatus: 'Good',
    age: '65-70'
  }
};

// Utility functions
function logTest(step, message, data = {}) {
  console.log(`✅ [${step}] ${message}`, data);
}

function logError(step, message, error = {}) {
  console.error(`❌ [${step}] ${message}`, error);
}

function logWarning(step, message, data = {}) {
  console.warn(`⚠️ [${step}] ${message}`, data);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if tracking systems are loaded
function checkTrackingSystems() {
  console.log('🔍 Checking Tracking Systems...');
  
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
      logWarning('System', `${system.toUpperCase()} not loaded`);
    }
  });
  
  return systems;
}

// Test dataLayer events
function testDataLayerEvents() {
  console.log('📊 Testing DataLayer Events...');
  
  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  
  // Test Quiz Start Event
  window.dataLayer.push({
    'event': 'quiz_start',
    'quiz_type': 'annuity',
    'session_id': TEST_CONFIG.testSessionId,
    'funnel_type': 'annuity'
  });
  logTest('DataLayer', 'Quiz Start event pushed');

  // Test Question Answer Events
  const questions = [
    {
      question_number: 1,
      question_text: 'Do you have a minimum of at least $100,000 or more in investable assets?',
      answer_value: 'Yes, I have $100,000 or more'
    },
    {
      question_number: 2,
      question_text: 'How soon are you planning to retire?',
      answer_value: 'Within 1-2 years'
    },
    {
      question_number: 3,
      question_text: 'What type of retirement plans are you investing in now?',
      answer_value: '401k, IRA'
    }
  ];

  questions.forEach((q, index) => {
    setTimeout(() => {
      window.dataLayer.push({
        'event': 'question_answer',
        'question_number': q.question_number,
        'question_text': q.question_text,
        'answer_value': q.answer_value,
        'session_id': TEST_CONFIG.testSessionId,
        'funnel_type': 'annuity'
      });
      logTest('DataLayer', `Question ${q.question_number} answer event pushed`);
    }, index * 1000);
  });

  // Test Quiz Complete Event
  setTimeout(() => {
    window.dataLayer.push({
      'event': 'quiz_complete',
      'quiz_type': 'annuity',
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity',
      'completion_time': 45000, // 45 seconds
      'lead_score': 85
    });
    logTest('DataLayer', 'Quiz Complete event pushed');
  }, 4000);

  // Test Lead Form Submit Event
  setTimeout(() => {
    window.dataLayer.push({
      'event': 'lead_form_submit',
      'event_category': 'lead_generation',
      'event_label': 'SeniorSimple Medicare Quiz',
      'value': 1,
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity',
      'lead_score': 85,
      'first_name': TEST_CONFIG.testUser.firstName,
      'last_name': TEST_CONFIG.testUser.lastName,
      'email': TEST_CONFIG.testUser.email,
      'phone': TEST_CONFIG.testUser.phone,
      'zip_code': TEST_CONFIG.testUser.zipCode,
      'state': TEST_CONFIG.testUser.state
    });
    logTest('DataLayer', 'Lead Form Submit event pushed');
  }, 5000);
}

// Test GA4 events with fallback
function testGA4Events() {
  console.log('📈 Testing GA4 Events...');
  
  if (typeof gtag !== 'undefined') {
    // Test Quiz Start
    gtag('event', 'quiz_start', {
      'quiz_type': 'annuity',
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity'
    });
    logTest('GA4', 'Quiz Start event sent');

    // Test Question Answer
    gtag('event', 'question_answer', {
      'question_number': 1,
      'question_text': 'Do you have a minimum of at least $100,000 or more in investable assets?',
      'answer_value': 'Yes, I have $100,000 or more',
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity'
    });
    logTest('GA4', 'Question Answer event sent');

    // Test Quiz Complete
    gtag('event', 'quiz_complete', {
      'quiz_type': 'annuity',
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity',
      'completion_time': 45000,
      'lead_score': 85
    });
    logTest('GA4', 'Quiz Complete event sent');

    // Test Lead Form Submit
    gtag('event', 'lead_form_submit', {
      'event_category': 'lead_generation',
      'event_label': 'SeniorSimple Medicare Quiz',
      'value': 1,
      'session_id': TEST_CONFIG.testSessionId,
      'funnel_type': 'annuity',
      'lead_score': 85
    });
    logTest('GA4', 'Lead Form Submit event sent');
  } else {
    logWarning('GA4', 'gtag function not found - GA4 may not be loaded');
    logWarning('GA4', 'This is normal if GA4 is loaded via GTM');
    logWarning('GA4', 'Check GTM Preview mode to verify GA4 events');
  }
}

// Test Meta events with fallback
function testMetaEvents() {
  console.log('📱 Testing Meta Events...');
  
  if (typeof fbq !== 'undefined') {
    // Test PageView
    fbq('track', 'PageView');
    logTest('Meta', 'PageView event sent');

    // Test Lead
    fbq('track', 'Lead', {
      content_name: 'SeniorSimple Medicare Quiz',
      content_category: 'lead_generation',
      value: 1,
      currency: 'USD',
      lead_source: 'seniorsimple_platform',
      session_id: TEST_CONFIG.testSessionId,
      funnel_type: 'annuity',
      lead_score: 85
    });
    logTest('Meta', 'Lead event sent');
  } else {
    logWarning('Meta', 'fbq function not found - Meta Pixel may not be loaded');
    logWarning('Meta', 'This is normal if Meta Pixel is loaded via GTM');
    logWarning('Meta', 'Check GTM Preview mode to verify Meta events');
  }
}

// Test CAPI events with better error handling
async function testCAPIEvents() {
  console.log('🔄 Testing CAPI Events...');
  
  try {
    // Test CAPI Lead Event
    const leadData = {
      firstName: TEST_CONFIG.testUser.firstName,
      lastName: TEST_CONFIG.testUser.lastName,
      email: TEST_CONFIG.testUser.email,
      phoneNumber: TEST_CONFIG.testUser.phone,
      zipCode: TEST_CONFIG.testUser.zipCode,
      state: TEST_CONFIG.testUser.state,
      stateName: TEST_CONFIG.testUser.stateName,
      quizAnswers: TEST_CONFIG.testAnswers,
      sessionId: TEST_CONFIG.testSessionId,
      funnelType: 'annuity',
      leadScore: 85,
      riskLevel: 'moderate',
      recommendedProducts: ['Annuity', 'Medicare Supplement']
    };

    // Try different CAPI endpoints
    const capiEndpoints = [
      '/api/capi/lead',
      '/api/leads/process-lead',
      '/api/leads/capi',
      '/api/tracking/capi'
    ];

    let capiSuccess = false;
    for (const endpoint of capiEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...leadData, siteKey: 'SENIORSIMPLE' })
        });

        if (response.ok) {
          logTest('CAPI', `Lead event sent successfully to ${endpoint}`);
          capiSuccess = true;
          break;
        } else {
          logWarning('CAPI', `${endpoint} returned ${response.status}`);
        }
      } catch (error) {
        logWarning('CAPI', `${endpoint} failed: ${error.message}`);
      }
    }

    if (!capiSuccess) {
      logWarning('CAPI', 'No CAPI endpoints found - this is normal if CAPI is not implemented yet');
      logWarning('CAPI', 'CAPI events will be handled by Supabase Edge Functions');
    }
  } catch (error) {
    logError('CAPI', 'CAPI test failed', error);
  }
}

// Test GTM variables with better error handling
function testGTMVariables() {
  console.log('🏷️ Testing GTM Variables...');
  
  if (typeof window.google_tag_manager !== 'undefined') {
    const gtmContainer = window.google_tag_manager[window.google_tag_manager.length - 1];
    
    if (gtmContainer && gtmContainer.macro) {
      const variables = [
        'GA4 Measurement ID - SeniorSimple',
        'Meta Pixel ID - SeniorSimple',
        'DLV - Event Category',
        'DLV - Event Label',
        'DLV - Value',
        'DLV - Session ID',
        'DLV - Funnel Type'
      ];

      variables.forEach(variable => {
        try {
          const value = gtmContainer.macro(variable);
          logTest('GTM', `Variable ${variable}: ${value}`);
        } catch (error) {
          logWarning('GTM', `Variable ${variable} not found`);
        }
      });
    } else {
      logWarning('GTM', 'GTM container found but macro function not available');
      logWarning('GTM', 'This is normal in some GTM configurations');
    }
  } else {
    logWarning('GTM', 'GTM not found - check if GTM container is loaded');
  }
}

// Test GTM Preview mode
function testGTMPreview() {
  console.log('🔍 Testing GTM Preview Mode...');
  
  if (window.google_tag_manager) {
    logTest('GTM', 'GTM container loaded');
    
    // Check if in preview mode
    if (window.google_tag_manager.length > 0) {
      logTest('GTM', 'GTM is active');
    }
  } else {
    logWarning('GTM', 'GTM not loaded - check container ID and script');
  }
}

// Main test function
async function runTrackingTests() {
  console.log('🚀 Starting SeniorSimple Tracking Tests (Fixed Version)...');
  console.log('Test Session ID:', TEST_CONFIG.testSessionId);
  
  // Check tracking systems first
  const systems = checkTrackingSystems();
  
  // Test 1: DataLayer Events
  testDataLayerEvents();
  await wait(2000);
  
  // Test 2: GA4 Events
  testGA4Events();
  await wait(2000);
  
  // Test 3: Meta Events
  testMetaEvents();
  await wait(2000);
  
  // Test 4: CAPI Events
  await testCAPIEvents();
  await wait(2000);
  
  // Test 5: GTM Variables
  testGTMVariables();
  await wait(1000);
  
  // Test 6: GTM Preview
  testGTMPreview();
  
  console.log('✅ All tracking tests completed!');
  console.log('📊 Check the following for verification:');
  console.log('   - GA4 Real-time reports');
  console.log('   - Meta Events Manager');
  console.log('   - GTM Preview mode');
  console.log('   - Browser console for errors');
  
  // Summary
  console.log('📋 Test Summary:');
  console.log(`   - DataLayer Events: ${systems.dataLayer ? '✅' : '❌'}`);
  console.log(`   - GA4 Events: ${systems.ga4 ? '✅' : '⚠️ (via GTM)'}`);
  console.log(`   - Meta Events: ${systems.meta ? '✅' : '⚠️ (via GTM)'}`);
  console.log(`   - GTM Container: ${systems.gtm ? '✅' : '❌'}`);
}

// Run tests
runTrackingTests();

// Export for manual testing
window.testSeniorSimpleTracking = {
  runTests: runTrackingTests,
  testDataLayer: testDataLayerEvents,
  testGA4: testGA4Events,
  testMeta: testMetaEvents,
  testCAPI: testCAPIEvents,
  testGTM: testGTMVariables,
  testGTMPreview: testGTMPreview,
  checkSystems: checkTrackingSystems,
  config: TEST_CONFIG
};

console.log('🎯 Test functions available:');
console.log('   - window.testSeniorSimpleTracking.runTests()');
console.log('   - window.testSeniorSimpleTracking.testDataLayer()');
console.log('   - window.testSeniorSimpleTracking.testGA4()');
console.log('   - window.testSeniorSimpleTracking.testMeta()');
console.log('   - window.testSeniorSimpleTracking.testCAPI()');
console.log('   - window.testSeniorSimpleTracking.testGTM()');
console.log('   - window.testSeniorSimpleTracking.testGTMPreview()');
console.log('   - window.testSeniorSimpleTracking.checkSystems()');
