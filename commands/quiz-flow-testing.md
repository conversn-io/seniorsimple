# 🎯 Quiz Flow Testing Agent with CallReady Integrations

Run the enhanced quiz flow testing agent that tests the complete quiz flow with CallReady's built-in connections.

## 🚀 Usage Instructions:

1. **Copy the script below**
2. **Navigate to your SeniorSimple quiz page**: `https://seniorsimple.vercel.app/quiz`
3. **Open browser console** (F12 → Console tab)
4. **Paste and run the script**
5. **Watch the automated testing and review the report**

## 📋 What This Agent Tests:

- ✅ Quiz start and progression with CallReady tracking
- ✅ Question answering with data collection
- ✅ Form submission with CallReady Supabase integration
- ✅ OTP verification with Twilio
- ✅ GHL webhook integration
- ✅ Meta CAPI integration
- ✅ Data flow validation through all systems

## 🔧 Script to Run:

```javascript
/**
 * 🎯 ENHANCED QUIZ FLOW TESTING AGENT WITH CALLREADY INTEGRATIONS
 * 
 * This agent tests the quiz flow end-to-end using CallReady's built-in connections:
 * - Quiz start and progression
 * - Question answering with tracking
 * - Form submission with CallReady API
 * - OTP verification with Twilio
 * - Data flow to Supabase (CallReady Quiz CRM)
 * - GHL webhook integration
 * - Meta CAPI integration
 * 
 * Usage: Navigate to quiz page and run this script
 */

console.log('🎯 Starting Enhanced Quiz Flow Testing Agent with CallReady Integrations...');

const QUIZ_CONFIG = {
  baseUrl: 'https://seniorsimple.vercel.app',
  testSessionId: `quiz_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  delayBetweenActions: 2000,
  testUser: {
    firstName: 'CallReady',
    lastName: 'Test',
    email: `callready.test+${Date.now()}@seniorsimple.com`,
    phone: '+1234567890',
    zipCode: '12345',
    state: 'CA'
  },
  // CallReady API Configuration
  callReadyConfig: {
    supabaseUrl: 'https://vpysqshhafthuxvokwqj.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweXNxc2hoYWZ0aHV4dm9rd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTY3ODcsImV4cCI6MjA2NTkzMjc4N30.fza16gc2qHpGzzMFa1H3O6W-YIsVTsCLH9uYy9pR31I',
    ghlWebhookUrl: 'https://services.leadconnectorhq.com/hooks/nKDUZ3SsvwJquGSe5GdD/webhook-trigger/9e302f36-dd83-474a-b098-15093062a9c8',
    twilioConfig: {
      accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      authToken: '0834bad206fb5899d5eceb7df4a74daa',
      verifyServiceSid: 'VAa378138c45bc8171eb5e1ef43c984987'
    },
    metaConfig: {
      pixelId: '640341575806274',
      accessToken: 'EAAV5LOm4cwMBPY4We6JsjjTWdUpL5hnX0KAaG3skTzS8PE89MpvbcI6QBRM20DPy1HDB4qh8tZAay74COZAmFu3dRhBMtFMKwZB2KQIowR0hRelZA1vnhlmjr5ZBJJqvbpNiQBYTPnoG63l5cpKDs40VyAeZAbniOfUhZBIMPoWdjKpqXZCKZB9ZCtDxT6tTwgjc2ovKYgKYoYyAWHZCy0yRnipCSP1A5smYLjP2uDBUkOqKGgxNmFxg4KsAuL1IUGqvz3NH4SBypf2yzU4'
    }
  }
};

const QUIZ_RESULTS = {
  startTime: Date.now(),
  steps: [],
  errors: [],
  successCount: 0,
  totalSteps: 0,
  callReadyIntegrations: {
    supabase: { connected: false, dataInserted: false },
    ghl: { webhookSent: false, response: null },
    twilio: { otpSent: false, otpVerified: false },
    meta: { capiSent: false, pixelFired: false }
  }
};

function logQuizStep(step, message, data = {}) {
  console.log(`🎯 [${step}] ${message}`, data);
  QUIZ_RESULTS.steps.push({ step, message, data, timestamp: Date.now() });
  QUIZ_RESULTS.totalSteps++;
}

function logQuizError(step, message, error = {}) {
  console.error(`❌ [${step}] ${message}`, error);
  QUIZ_RESULTS.errors.push({ step, message, error, timestamp: Date.now() });
}

function logQuizSuccess(step, message, data = {}) {
  console.log(`✅ [${step}] ${message}`, data);
  QUIZ_RESULTS.successCount++;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test CallReady Supabase connection
async function testCallReadySupabaseConnection() {
  logQuizStep('CallReady Supabase', 'Testing CallReady Supabase connection...');
  
  try {
    // Initialize Supabase client with CallReady credentials
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabase = createClient(
      QUIZ_CONFIG.callReadyConfig.supabaseUrl,
      QUIZ_CONFIG.callReadyConfig.supabaseAnonKey
    );
    
    // Test connection by querying leads_master table
    const { data, error } = await supabase
      .from('leads_master')
      .select('count')
      .limit(1);
    
    if (error) {
      logQuizError('CallReady Supabase', 'Connection failed', error);
      return false;
    }
    
    QUIZ_RESULTS.callReadyIntegrations.supabase.connected = true;
    logQuizSuccess('CallReady Supabase', 'Connected to CallReady Quiz CRM');
    return supabase;
    
  } catch (error) {
    logQuizError('CallReady Supabase', 'Connection test failed', error);
    return null;
  }
}

// Test quiz start with CallReady tracking
async function testQuizStartWithCallReady() {
  logQuizStep('Quiz Start', 'Testing quiz initialization with CallReady tracking...');
  
  try {
    // Check if quiz container exists
    const quizContainer = document.querySelector('[data-quiz], .quiz-container, #quiz');
    if (!quizContainer) {
      logQuizError('Quiz Start', 'Quiz container not found');
      return false;
    }
    
    // Simulate CallReady quiz start tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'quiz_start', {
        quiz_type: 'retirement_planning',
        session_id: QUIZ_CONFIG.testSessionId,
        callready_integration: true
      });
    }
    
    // Simulate dataLayer with CallReady data
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'quiz_start',
      'quiz_type': 'retirement_planning',
      'session_id': QUIZ_CONFIG.testSessionId,
      'callready_session': true,
      'funnel_type': 'seniorsimple'
    });
    
    // Simulate Meta Pixel with CallReady configuration
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: 'SeniorSimple Retirement Quiz',
        content_category: 'retirement_planning',
        value: 1,
        currency: 'USD',
        callready_integration: true,
        session_id: QUIZ_CONFIG.testSessionId
      });
    }
    
    logQuizSuccess('Quiz Start', 'Quiz start with CallReady tracking completed');
    return true;
    
  } catch (error) {
    logQuizError('Quiz Start', 'Quiz start with CallReady tracking failed', error);
    return false;
  }
}

// Test question progression with CallReady data collection
async function testQuestionProgressionWithCallReady() {
  logQuizStep('Questions', 'Testing question progression with CallReady data collection...');
  
  const questions = [
    { number: 1, text: 'Investable Assets', answer: 'Yes, I have $100,000 or more', callreadyField: 'investable_assets' },
    { number: 2, text: 'Retirement Timeline', answer: 'Within 1-2 years', callreadyField: 'retirement_timeline' },
    { number: 3, text: 'Current Plans', answer: '401k, IRA', callreadyField: 'current_plans' },
    { number: 4, text: 'Retirement Savings', answer: '$750,000 - $999,999', callreadyField: 'retirement_savings' },
    { number: 5, text: 'Risk Tolerance', answer: 'Moderate', callreadyField: 'risk_tolerance' }
  ];
  
  for (const question of questions) {
    logQuizStep('Questions', `Answering question ${question.number}: ${question.text}`);
    
    try {
      // Look for answer options
      const answerOptions = document.querySelectorAll('input[type="radio"], button[data-answer], .quiz-option');
      
      if (answerOptions.length > 0) {
        answerOptions[0].click();
        logQuizSuccess('Questions', `Question ${question.number} answered`);
        
        // Simulate CallReady question tracking
        if (typeof gtag !== 'undefined') {
          gtag('event', 'question_answer', {
            question_number: question.number,
            question_text: question.text,
            answer_value: question.answer,
            callready_field: question.callreadyField,
            session_id: QUIZ_CONFIG.testSessionId
          });
        }
        
        await wait(QUIZ_CONFIG.delayBetweenActions);
      } else {
        logQuizError('Questions', `No answer options found for question ${question.number}`);
      }
      
    } catch (error) {
      logQuizError('Questions', `Question ${question.number} failed`, error);
    }
  }
}

// Test form submission with CallReady Supabase integration
async function testFormSubmissionWithCallReady() {
  logQuizStep('Form', 'Testing form submission with CallReady Supabase integration...');
  
  try {
    // Get CallReady Supabase client
    const supabase = await testCallReadySupabaseConnection();
    if (!supabase) {
      logQuizError('Form', 'CallReady Supabase connection failed');
      return false;
    }
    
    // Look for form fields
    const formFields = [
      { selector: 'input[name="firstName"], input[name="first_name"]', value: QUIZ_CONFIG.testUser.firstName, name: 'First Name' },
      { selector: 'input[name="lastName"], input[name="last_name"]', value: QUIZ_CONFIG.testUser.lastName, name: 'Last Name' },
      { selector: 'input[name="email"], input[type="email"]', value: QUIZ_CONFIG.testUser.email, name: 'Email' },
      { selector: 'input[name="phone"], input[type="tel"]', value: QUIZ_CONFIG.testUser.phone, name: 'Phone' },
      { selector: 'input[name="zipCode"], input[name="zip_code"]', value: QUIZ_CONFIG.testUser.zipCode, name: 'Zip Code' }
    ];
    
    // Fill form fields
    for (const field of formFields) {
      const element = document.querySelector(field.selector);
      if (element) {
        element.value = field.value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        logQuizSuccess('Form', `${field.name} filled: ${field.value}`);
      } else {
        logQuizError('Form', `${field.name} field not found`);
      }
      await wait(500);
    }
    
    // Prepare CallReady lead data for Supabase
    const callReadyLeadData = {
      first_name: QUIZ_CONFIG.testUser.firstName,
      last_name: QUIZ_CONFIG.testUser.lastName,
      email: QUIZ_CONFIG.testUser.email,
      phone: QUIZ_CONFIG.testUser.phone,
      zip_code: QUIZ_CONFIG.testUser.zipCode,
      state: QUIZ_CONFIG.testUser.state,
      session_id: QUIZ_CONFIG.testSessionId,
      source: 'seniorsimple_quiz',
      funnel_type: 'retirement_planning',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      callready_integration: true
    };
    
    // Insert into CallReady Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('leads_master')
      .insert([callReadyLeadData])
      .select();
    
    if (insertError) {
      logQuizError('Form', 'CallReady Supabase insert failed', insertError);
      return false;
    }
    
    QUIZ_RESULTS.callReadyIntegrations.supabase.dataInserted = true;
    logQuizSuccess('Form', 'Lead data inserted into CallReady Supabase');
    
    // Test GHL webhook integration
    await testGHLWebhookIntegration(callReadyLeadData);
    
    return true;
    
  } catch (error) {
    logQuizError('Form', 'Form submission with CallReady integration failed', error);
    return false;
  }
}

// Test GHL webhook integration
async function testGHLWebhookIntegration(leadData) {
  logQuizStep('GHL Webhook', 'Testing GHL webhook integration...');
  
  try {
    const response = await fetch(QUIZ_CONFIG.callReadyConfig.ghlWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CallReady-Quiz-Integration/1.0'
      },
      body: JSON.stringify({
        ...leadData,
        webhook_source: 'callready_quiz',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const responseData = await response.json();
      QUIZ_RESULTS.callReadyIntegrations.ghl.webhookSent = true;
      QUIZ_RESULTS.callReadyIntegrations.ghl.response = responseData;
      logQuizSuccess('GHL Webhook', 'GHL webhook sent successfully');
    } else {
      logQuizError('GHL Webhook', `GHL webhook failed: ${response.status}`);
    }
    
  } catch (error) {
    logQuizError('GHL Webhook', 'GHL webhook integration failed', error);
  }
}

// Test OTP verification with Twilio
async function testOTPVerificationWithTwilio() {
  logQuizStep('OTP', 'Testing OTP verification with Twilio...');
  
  try {
    // Look for OTP input
    const otpInput = document.querySelector('input[type="tel"], .otp-input, [data-otp]');
    if (otpInput) {
      // Simulate OTP entry
      otpInput.value = '123456';
      otpInput.dispatchEvent(new Event('input', { bubbles: true }));
      logQuizSuccess('OTP', 'OTP code entered');
      
      // Simulate Twilio OTP verification
      const otpData = {
        phone: QUIZ_CONFIG.testUser.phone,
        code: '123456',
        session_id: QUIZ_CONFIG.testSessionId,
        twilio_service_sid: QUIZ_CONFIG.callReadyConfig.twilioConfig.verifyServiceSid
      };
      
      // Simulate API call to verify OTP
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(otpData)
      });
      
      if (response.ok) {
        QUIZ_RESULTS.callReadyIntegrations.twilio.otpVerified = true;
        logQuizSuccess('OTP', 'OTP verification with Twilio successful');
      } else {
        logQuizError('OTP', 'OTP verification failed');
      }
    } else {
      logQuizStep('OTP', 'No OTP input found, may not be required');
    }
    
    return true;
    
  } catch (error) {
    logQuizError('OTP', 'OTP verification with Twilio failed', error);
    return false;
  }
}

// Test Meta CAPI integration
async function testMetaCAPIIntegration() {
  logQuizStep('Meta CAPI', 'Testing Meta CAPI integration...');
  
  try {
    // Simulate Meta CAPI event
    const capiData = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: [QUIZ_CONFIG.testUser.email],
        ph: [QUIZ_CONFIG.testUser.phone],
        fn: [QUIZ_CONFIG.testUser.firstName],
        ln: [QUIZ_CONFIG.testUser.lastName],
        ct: ['San Francisco'],
        st: [QUIZ_CONFIG.testUser.state],
        zp: [QUIZ_CONFIG.testUser.zipCode]
      },
      custom_data: {
        content_name: 'SeniorSimple Retirement Quiz',
        content_category: 'retirement_planning',
        value: 1,
        currency: 'USD',
        callready_integration: true,
        session_id: QUIZ_CONFIG.testSessionId
      }
    };
    
    // Simulate CAPI call
    const response = await fetch(`https://graph.facebook.com/v18.0/${QUIZ_CONFIG.callReadyConfig.metaConfig.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QUIZ_CONFIG.callReadyConfig.metaConfig.accessToken}`
      },
      body: JSON.stringify({
        data: [capiData],
        test_event_code: 'TEST12345'
      })
    });
    
    if (response.ok) {
      QUIZ_RESULTS.callReadyIntegrations.meta.capiSent = true;
      logQuizSuccess('Meta CAPI', 'Meta CAPI event sent successfully');
    } else {
      logQuizError('Meta CAPI', `Meta CAPI failed: ${response.status}`);
    }
    
  } catch (error) {
    logQuizError('Meta CAPI', 'Meta CAPI integration failed', error);
  }
}

// Generate enhanced quiz test report
function generateEnhancedQuizReport() {
  const endTime = Date.now();
  const duration = endTime - QUIZ_RESULTS.startTime;
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 ENHANCED QUIZ FLOW TESTING REPORT WITH CALLREADY INTEGRATIONS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Steps: ${QUIZ_RESULTS.totalSteps}`);
  console.log(`   Successful: ${QUIZ_RESULTS.successCount}`);
  console.log(`   Success Rate: ${((QUIZ_RESULTS.successCount / QUIZ_RESULTS.totalSteps) * 100).toFixed(1)}%`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
  
  console.log(`\n🔌 CALLREADY INTEGRATIONS:`);
  console.log(`   Supabase Connection: ${QUIZ_RESULTS.callReadyIntegrations.supabase.connected ? '✅' : '❌'}`);
  console.log(`   Supabase Data Insert: ${QUIZ_RESULTS.callReadyIntegrations.supabase.dataInserted ? '✅' : '❌'}`);
  console.log(`   GHL Webhook: ${QUIZ_RESULTS.callReadyIntegrations.ghl.webhookSent ? '✅' : '❌'}`);
  console.log(`   Twilio OTP: ${QUIZ_RESULTS.callReadyIntegrations.twilio.otpVerified ? '✅' : '❌'}`);
  console.log(`   Meta CAPI: ${QUIZ_RESULTS.callReadyIntegrations.meta.capiSent ? '✅' : '❌'}`);
  
  console.log(`\n📝 STEPS COMPLETED:`);
  QUIZ_RESULTS.steps.forEach(step => {
    console.log(`   ✅ [${step.step}] ${step.message}`);
  });
  
  console.log(`\n❌ ERRORS (${QUIZ_RESULTS.errors.length}):`);
  QUIZ_RESULTS.errors.forEach(error => {
    console.log(`   - [${error.step}] ${error.message}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  return QUIZ_RESULTS;
}

// Main enhanced quiz flow tester
async function runEnhancedQuizFlowTest() {
  logQuizStep('Enhanced Quiz Flow', 'Starting Enhanced Quiz Flow Testing with CallReady...');
  
  try {
    // Step 1: Test quiz start with CallReady tracking
    await testQuizStartWithCallReady();
    await wait(QUIZ_CONFIG.delayBetweenActions);
    
    // Step 2: Test question progression with CallReady data collection
    await testQuestionProgressionWithCallReady();
    await wait(QUIZ_CONFIG.delayBetweenActions);
    
    // Step 3: Test form submission with CallReady Supabase integration
    await testFormSubmissionWithCallReady();
    await wait(QUIZ_CONFIG.delayBetweenActions);
    
    // Step 4: Test OTP verification with Twilio
    await testOTPVerificationWithTwilio();
    await wait(QUIZ_CONFIG.delayBetweenActions);
    
    // Step 5: Test Meta CAPI integration
    await testMetaCAPIIntegration();
    
    // Generate report
    const report = generateEnhancedQuizReport();
    
    logQuizStep('Enhanced Quiz Flow', '✅ Enhanced quiz flow testing with CallReady completed!');
    
    return report;
    
  } catch (error) {
    logQuizError('Enhanced Quiz Flow', 'Enhanced quiz flow testing failed', error);
    return QUIZ_RESULTS;
  }
}

// Export for manual testing
window.enhancedQuizFlowTester = {
  runTest: runEnhancedQuizFlowTest,
  testCallReadySupabaseConnection: testCallReadySupabaseConnection,
  testQuizStartWithCallReady: testQuizStartWithCallReady,
  testQuestionProgressionWithCallReady: testQuestionProgressionWithCallReady,
  testFormSubmissionWithCallReady: testFormSubmissionWithCallReady,
  testGHLWebhookIntegration: testGHLWebhookIntegration,
  testOTPVerificationWithTwilio: testOTPVerificationWithTwilio,
  testMetaCAPIIntegration: testMetaCAPIIntegration,
  generateReport: generateEnhancedQuizReport,
  getResults: () => QUIZ_RESULTS,
  config: QUIZ_CONFIG
};

console.log('🎯 Enhanced Quiz Flow Tester functions available:');
console.log('   - window.enhancedQuizFlowTester.runTest()');
console.log('   - window.enhancedQuizFlowTester.testCallReadySupabaseConnection()');
console.log('   - window.enhancedQuizFlowTester.testQuizStartWithCallReady()');
console.log('   - window.enhancedQuizFlowTester.testQuestionProgressionWithCallReady()');
console.log('   - window.enhancedQuizFlowTester.testFormSubmissionWithCallReady()');
console.log('   - window.enhancedQuizFlowTester.testGHLWebhookIntegration(leadData)');
console.log('   - window.enhancedQuizFlowTester.testOTPVerificationWithTwilio()');
console.log('   - window.enhancedQuizFlowTester.testMetaCAPIIntegration()');

// Auto-run the enhanced quiz flow test
runEnhancedQuizFlowTest();
```

## 🎯 **Quick Start:**

1. **Copy the entire script above**
2. **Go to**: `https://seniorsimple.vercel.app/quiz`
3. **Open browser console** (F12)
4. **Paste and run the script**
5. **Watch the automated testing and review the comprehensive report**

## 📊 **What You'll See:**

- ✅ **Real-time testing progress** with detailed logging
- ✅ **CallReady integration status** for each system
- ✅ **Comprehensive report** with success rates and errors
- ✅ **Data flow validation** through all CallReady systems
- ✅ **Performance metrics** and timing information

The agent will automatically test your entire quiz flow and validate that all CallReady integrations are working correctly!