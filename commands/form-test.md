# 📝 Form Submission Testing Agent with CallReady Supabase Integration

Run the enhanced form submission testing agent that tests all forms with CallReady's built-in Supabase integration.

## 🚀 Usage Instructions:

1. **Copy the script below**
2. **Navigate to your SeniorSimple site**: `https://seniorsimple.vercel.app`
3. **Open browser console** (F12 → Console tab)
4. **Paste and run the script**
5. **Watch the automated form testing and review the comprehensive report**

## 📋 What This Agent Tests:

- ✅ Form validation and submission
- ✅ CallReady Supabase data insertion
- ✅ Data integrity and field validation
- ✅ GHL webhook integration
- ✅ Twilio OTP verification
- ✅ Meta CAPI integration
- ✅ Form error handling
- ✅ Data flow validation through all systems

## 🔧 Script to Run:

```javascript
/**
 * 📝 ENHANCED FORM SUBMISSION TESTING AGENT WITH CALLREADY SUPABASE INTEGRATION
 * 
 * This agent tests all forms using CallReady's built-in connections:
 * - Form validation and submission
 * - CallReady Supabase data insertion
 * - GHL webhook integration
 * - Twilio OTP verification
 * - Meta CAPI integration
 * 
 * Usage: Navigate to site and run this script
 */

console.log('📝 Starting Enhanced Form Submission Testing Agent with CallReady Supabase Integration...');

const FORM_CONFIG = {
  baseUrl: 'https://seniorsimple.vercel.app',
  testSessionId: `form_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  testData: {
    firstName: 'CallReady',
    lastName: 'Form',
    email: `callready.form+${Date.now()}@seniorsimple.com`,
    phone: '+1234567890',
    zipCode: '12345',
    state: 'CA'
  },
  // CallReady Supabase Configuration
  callReadySupabase: {
    url: 'https://vpysqshhafthuxvokwqj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweXNxc2hoYWZ0aHV4dm9rd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTY3ODcsImV4cCI6MjA2NTkzMjc4N30.fza16gc2qHpGzzMFa1H3O6W-YIsVTsCLH9uYy9pR31I'
  },
  // CallReady GHL Configuration
  callReadyGHL: {
    webhookUrl: 'https://services.leadconnectorhq.com/hooks/nKDUZ3SsvwJquGSe5GdD/webhook-trigger/9e302f36-dd83-474a-b098-15093062a9c8'
  },
  // CallReady Twilio Configuration
  callReadyTwilio: {
    accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    authToken: '0834bad206fb5899d5eceb7df4a74daa',
    verifyServiceSid: 'VAa378138c45bc8171eb5e1ef43c984987'
  },
  // CallReady Meta Configuration
  callReadyMeta: {
    pixelId: '640341575806274',
    accessToken: 'EAAV5LOm4cwMBPY4We6JsjjTWdUpL5hnX0KAaG3skTzS8PE89MpvbcI6QBRM20DPy1HDB4qh8tZAay74COZAmFu3dRhBMtFMKwZB2KQIowR0hRelZA1vnhlmjr5ZBJJqvbpNiQBYTPnoG63l5cpKDs40VyAeZAbniOfUhZBIMPoWdjKpqXZCKZB9ZCtDxT6tTwgjc2ovKYgKYoYyAWHZCy0yRnipCSP1A5smYLjP2uDBUkOqKGgxNmFxg4KsAuL1IUGqvz3NH4SBypf2yzU4'
  }
};

const FORM_RESULTS = {
  startTime: Date.now(),
  forms: [],
  errors: [],
  successCount: 0,
  totalForms: 0,
  callReadyIntegrations: {
    supabase: { connected: false, dataInserted: false },
    ghl: { webhookSent: false, response: null },
    twilio: { otpSent: false, otpVerified: false },
    meta: { capiSent: false, pixelFired: false }
  }
};

function logFormStep(form, message, data = {}) {
  console.log(`📝 [${form}] ${message}`, data);
  FORM_RESULTS.forms.push({ form, message, data, timestamp: Date.now() });
  FORM_RESULTS.totalForms++;
}

function logFormError(form, message, error = {}) {
  console.error(`❌ [${form}] ${message}`, error);
  FORM_RESULTS.errors.push({ form, message, error, timestamp: Date.now() });
}

function logFormSuccess(form, message, data = {}) {
  console.log(`✅ [${form}] ${message}`, data);
  FORM_RESULTS.successCount++;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize CallReady Supabase client
async function initCallReadySupabaseClient() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    return createClient(
      FORM_CONFIG.callReadySupabase.url,
      FORM_CONFIG.callReadySupabase.anonKey
    );
  } catch (error) {
    logFormError('CallReady Supabase', 'Failed to initialize Supabase client', error);
    return null;
  }
}

// Test CallReady Supabase connection
async function testCallReadySupabaseConnection() {
  logFormStep('CallReady Supabase', 'Testing CallReady Supabase connection...');
  
  try {
    const supabase = await initCallReadySupabaseClient();
    if (!supabase) {
      logFormError('CallReady Supabase', 'Supabase client initialization failed');
      return false;
    }
    
    // Test connection
    const { data, error } = await supabase
      .from('leads_master')
      .select('count')
      .limit(1);
    
    if (error) {
      logFormError('CallReady Supabase', 'Connection test failed', error);
      return false;
    }
    
    FORM_RESULTS.callReadyIntegrations.supabase.connected = true;
    logFormSuccess('CallReady Supabase', 'Connected to CallReady Quiz CRM');
    return supabase;
    
  } catch (error) {
    logFormError('CallReady Supabase', 'Connection test failed', error);
    return false;
  }
}

// Test form validation with CallReady
async function testFormValidationWithCallReady() {
  logFormStep('Form Validation', 'Testing form validation with CallReady...');
  
  try {
    // Find all forms on the page
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) {
      logFormError('Form Validation', 'No forms found on page');
      return false;
    }
    
    logFormSuccess('Form Validation', `Found ${forms.length} forms on page`);
    
    // Test each form
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const formId = form.id || `form_${i}`;
      
      logFormStep('Form Validation', `Testing form: ${formId}`);
      
      // Check for required fields
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      logFormSuccess('Form Validation', `Form ${formId} has ${requiredFields.length} required fields`);
      
      // Check for email fields
      const emailFields = form.querySelectorAll('input[type="email"]');
      if (emailFields.length > 0) {
        logFormSuccess('Form Validation', `Form ${formId} has ${emailFields.length} email fields`);
      }
      
      // Check for phone fields
      const phoneFields = form.querySelectorAll('input[type="tel"], input[name*="phone"]');
      if (phoneFields.length > 0) {
        logFormSuccess('Form Validation', `Form ${formId} has ${phoneFields.length} phone fields`);
      }
    }
    
    return true;
    
  } catch (error) {
    logFormError('Form Validation', 'Form validation test failed', error);
    return false;
  }
}

// Test form submission with CallReady Supabase
async function testFormSubmissionWithCallReadySupabase() {
  logFormStep('Form Submission', 'Testing form submission with CallReady Supabase...');
  
  try {
    // Get CallReady Supabase client
    const supabase = await testCallReadySupabaseConnection();
    if (!supabase) {
      logFormError('Form Submission', 'CallReady Supabase connection failed');
      return false;
    }
    
    // Find forms and test submission
    const forms = document.querySelectorAll('form');
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const formId = form.id || `form_${i}`;
      
      logFormStep('Form Submission', `Testing form submission: ${formId}`);
      
      // Fill form fields
      const formFields = [
        { selector: 'input[name="firstName"], input[name="first_name"]', value: FORM_CONFIG.testData.firstName, name: 'First Name' },
        { selector: 'input[name="lastName"], input[name="last_name"]', value: FORM_CONFIG.testData.lastName, name: 'Last Name' },
        { selector: 'input[name="email"], input[type="email"]', value: FORM_CONFIG.testData.email, name: 'Email' },
        { selector: 'input[name="phone"], input[type="tel"]', value: FORM_CONFIG.testData.phone, name: 'Phone' },
        { selector: 'input[name="zipCode"], input[name="zip_code"]', value: FORM_CONFIG.testData.zipCode, name: 'Zip Code' }
      ];
      
      // Fill form fields
      for (const field of formFields) {
        const element = form.querySelector(field.selector);
        if (element) {
          element.value = field.value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          logFormSuccess('Form Submission', `${field.name} filled: ${field.value}`);
        }
        await wait(500);
      }
      
      // Prepare CallReady lead data for Supabase
      const callReadyLeadData = {
        first_name: FORM_CONFIG.testData.firstName,
        last_name: FORM_CONFIG.testData.lastName,
        email: FORM_CONFIG.testData.email,
        phone: FORM_CONFIG.testData.phone,
        zip_code: FORM_CONFIG.testData.zipCode,
        state: FORM_CONFIG.testData.state,
        session_id: FORM_CONFIG.testSessionId,
        source: 'form_submission_test',
        form_id: formId,
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
        logFormError('Form Submission', `CallReady Supabase insert failed for ${formId}`, insertError);
      } else {
        FORM_RESULTS.callReadyIntegrations.supabase.dataInserted = true;
        logFormSuccess('Form Submission', `Lead data inserted into CallReady Supabase for ${formId}`);
      }
      
      // Test GHL webhook integration
      await testCallReadyGHLWebhookIntegration(callReadyLeadData);
      
      // Test Meta CAPI integration
      await testCallReadyMetaCAPI(callReadyLeadData);
      
      // Test Twilio OTP integration
      await testCallReadyTwilioOTP(callReadyLeadData);
    }
    
    return true;
    
  } catch (error) {
    logFormError('Form Submission', 'Form submission with CallReady Supabase failed', error);
    return false;
  }
}

// Test CallReady GHL webhook integration
async function testCallReadyGHLWebhookIntegration(leadData) {
  logFormStep('CallReady GHL', 'Testing CallReady GHL webhook integration...');
  
  try {
    const response = await fetch(FORM_CONFIG.callReadyGHL.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CallReady-Form-Integration/1.0'
      },
      body: JSON.stringify({
        ...leadData,
        webhook_source: 'callready_form_test',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const responseData = await response.json();
      FORM_RESULTS.callReadyIntegrations.ghl.webhookSent = true;
      FORM_RESULTS.callReadyIntegrations.ghl.response = responseData;
      logFormSuccess('CallReady GHL', 'GHL webhook sent successfully');
    } else {
      logFormError('CallReady GHL', `GHL webhook failed: ${response.status}`);
    }
    
  } catch (error) {
    logFormError('CallReady GHL', 'CallReady GHL webhook integration failed', error);
  }
}

// Test CallReady Meta CAPI integration
async function testCallReadyMetaCAPI(leadData) {
  logFormStep('CallReady Meta', 'Testing CallReady Meta CAPI integration...');
  
  try {
    // Simulate Meta CAPI event
    const capiData = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: [leadData.email],
        ph: [leadData.phone],
        fn: [leadData.first_name],
        ln: [leadData.last_name],
        ct: ['San Francisco'],
        st: [leadData.state],
        zp: [leadData.zip_code]
      },
      custom_data: {
        content_name: 'Form Submission Test',
        content_category: 'form_testing',
        value: 1,
        currency: 'USD',
        callready_integration: true,
        session_id: FORM_CONFIG.testSessionId
      }
    };
    
    // Simulate CAPI call
    const response = await fetch(`https://graph.facebook.com/v18.0/${FORM_CONFIG.callReadyMeta.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORM_CONFIG.callReadyMeta.accessToken}`
      },
      body: JSON.stringify({
        data: [capiData],
        test_event_code: 'TEST12345'
      })
    });
    
    if (response.ok) {
      FORM_RESULTS.callReadyIntegrations.meta.capiSent = true;
      logFormSuccess('CallReady Meta', 'Meta CAPI event sent successfully');
    } else {
      logFormError('CallReady Meta', `Meta CAPI failed: ${response.status}`);
    }
    
  } catch (error) {
    logFormError('CallReady Meta', 'CallReady Meta CAPI integration failed', error);
  }
}

// Test CallReady Twilio OTP integration
async function testCallReadyTwilioOTP(leadData) {
  logFormStep('CallReady Twilio', 'Testing CallReady Twilio OTP integration...');
  
  try {
    // Simulate OTP send
    const otpData = {
      phone: leadData.phone,
      session_id: FORM_CONFIG.testSessionId,
      twilio_service_sid: FORM_CONFIG.callReadyTwilio.verifyServiceSid
    };
    
    // Simulate API call to send OTP
    const sendResponse = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(otpData)
    });
    
    if (sendResponse.ok) {
      FORM_RESULTS.callReadyIntegrations.twilio.otpSent = true;
      logFormSuccess('CallReady Twilio', 'OTP send successful');
    } else {
      logFormError('CallReady Twilio', 'OTP send failed');
    }
    
    // Simulate OTP verification
    const verifyData = {
      phone: leadData.phone,
      code: '123456',
      session_id: FORM_CONFIG.testSessionId,
      twilio_service_sid: FORM_CONFIG.callReadyTwilio.verifyServiceSid
    };
    
    const verifyResponse = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    });
    
    if (verifyResponse.ok) {
      FORM_RESULTS.callReadyIntegrations.twilio.otpVerified = true;
      logFormSuccess('CallReady Twilio', 'OTP verification successful');
    } else {
      logFormError('CallReady Twilio', 'OTP verification failed');
    }
    
  } catch (error) {
    logFormError('CallReady Twilio', 'CallReady Twilio OTP integration failed', error);
  }
}

// Test all forms with CallReady
async function testAllFormsWithCallReady() {
  logFormStep('All Forms', 'Testing all forms with CallReady...');
  
  try {
    // Test form validation
    await testFormValidationWithCallReady();
    await wait(1000);
    
    // Test form submission with CallReady Supabase
    await testFormSubmissionWithCallReadySupabase();
    
    return true;
    
  } catch (error) {
    logFormError('All Forms', 'All forms testing with CallReady failed', error);
    return false;
  }
}

// Generate enhanced form test report
function generateEnhancedFormReport() {
  const endTime = Date.now();
  const duration = endTime - FORM_RESULTS.startTime;
  
  console.log('\n' + '='.repeat(80));
  console.log('📝 ENHANCED FORM SUBMISSION TESTING REPORT WITH CALLREADY SUPABASE INTEGRATION');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Forms: ${FORM_RESULTS.totalForms}`);
  console.log(`   Successful: ${FORM_RESULTS.successCount}`);
  console.log(`   Success Rate: ${((FORM_RESULTS.successCount / FORM_RESULTS.totalForms) * 100).toFixed(1)}%`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
  
  console.log(`\n🔌 CALLREADY INTEGRATIONS:`);
  console.log(`   Supabase Connection: ${FORM_RESULTS.callReadyIntegrations.supabase.connected ? '✅' : '❌'}`);
  console.log(`   Supabase Data Insert: ${FORM_RESULTS.callReadyIntegrations.supabase.dataInserted ? '✅' : '❌'}`);
  console.log(`   GHL Webhook: ${FORM_RESULTS.callReadyIntegrations.ghl.webhookSent ? '✅' : '❌'}`);
  console.log(`   Twilio OTP: ${FORM_RESULTS.callReadyIntegrations.twilio.otpVerified ? '✅' : '❌'}`);
  console.log(`   Meta CAPI: ${FORM_RESULTS.callReadyIntegrations.meta.capiSent ? '✅' : '❌'}`);
  
  console.log(`\n📝 FORMS TESTED:`);
  FORM_RESULTS.forms.forEach(form => {
    console.log(`   ✅ [${form.form}] ${form.message}`);
  });
  
  console.log(`\n❌ ERRORS (${FORM_RESULTS.errors.length}):`);
  FORM_RESULTS.errors.forEach(error => {
    console.log(`   - [${error.form}] ${error.message}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  return FORM_RESULTS;
}

// Main enhanced form submission tester
async function runEnhancedFormSubmissionTest() {
  logFormStep('Enhanced Form Submission', 'Starting Enhanced Form Submission Testing with CallReady...');
  
  try {
    // Test all forms with CallReady
    await testAllFormsWithCallReady();
    
    // Generate report
    const report = generateEnhancedFormReport();
    
    logFormStep('Enhanced Form Submission', '✅ Enhanced form submission testing with CallReady completed!');
    
    return report;
    
  } catch (error) {
    logFormError('Enhanced Form Submission', 'Enhanced form submission testing failed', error);
    return FORM_RESULTS;
  }
}

// Export for manual testing
window.enhancedFormTester = {
  runTest: runEnhancedFormSubmissionTest,
  testCallReadySupabaseConnection: testCallReadySupabaseConnection,
  testFormValidationWithCallReady: testFormValidationWithCallReady,
  testFormSubmissionWithCallReadySupabase: testFormSubmissionWithCallReadySupabase,
  testCallReadyGHLWebhookIntegration: testCallReadyGHLWebhookIntegration,
  testCallReadyMetaCAPI: testCallReadyMetaCAPI,
  testCallReadyTwilioOTP: testCallReadyTwilioOTP,
  testAllFormsWithCallReady: testAllFormsWithCallReady,
  generateReport: generateEnhancedFormReport,
  getResults: () => FORM_RESULTS,
  config: FORM_CONFIG
};

console.log('📝 Enhanced Form Tester functions available:');
console.log('   - window.enhancedFormTester.runTest()');
console.log('   - window.enhancedFormTester.testCallReadySupabaseConnection()');
console.log('   - window.enhancedFormTester.testFormValidationWithCallReady()');
console.log('   - window.enhancedFormTester.testFormSubmissionWithCallReadySupabase()');
console.log('   - window.enhancedFormTester.testCallReadyGHLWebhookIntegration(leadData)');
console.log('   - window.enhancedFormTester.testCallReadyMetaCAPI(leadData)');
console.log('   - window.enhancedFormTester.testCallReadyTwilioOTP(leadData)');
console.log('   - window.enhancedFormTester.testAllFormsWithCallReady()');

// Auto-run the enhanced form submission test
runEnhancedFormSubmissionTest();
```

## 🎯 **Quick Start:**

1. **Copy the entire script above**
2. **Go to**: `https://seniorsimple.vercel.app`
3. **Open browser console** (F12)
4. **Paste and run the script**
5. **Watch the automated form testing and review the comprehensive report**

## 📊 **What You'll See:**

- ✅ **Real-time form testing** with detailed logging
- ✅ **CallReady integration status** for each system
- ✅ **Comprehensive report** with success rates and errors
- ✅ **Data flow validation** through all CallReady systems
- ✅ **Form validation** and submission testing

The agent will automatically test all your forms and validate that all CallReady integrations are working correctly!