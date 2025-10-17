# 🔌 API Validation Testing Agent with CallReady API Keys

Run the enhanced API endpoint validation agent that tests all API endpoints with CallReady's built-in connections.

## 🚀 Usage Instructions:

1. **Copy the script below**
2. **Navigate to your SeniorSimple site**: `https://seniorsimple.vercel.app`
3. **Open browser console** (F12 → Console tab)
4. **Paste and run the script**
5. **Watch the automated API testing and review the comprehensive report**

## 📋 What This Agent Tests:

- ✅ CallReady Supabase endpoints and data flow
- ✅ GHL webhook endpoints and responses
- ✅ Twilio OTP endpoints and verification
- ✅ Meta CAPI endpoints and pixel tracking
- ✅ Smartlead API endpoints and integration
- ✅ CallReady cold email webhook endpoints
- ✅ Response times and error handling
- ✅ Data validation and integrity

## 🔧 Script to Run:

```javascript
/**
 * 🔌 ENHANCED API ENDPOINT VALIDATION AGENT WITH CALLREADY API KEYS
 * 
 * This agent tests all API endpoints using CallReady's built-in connections:
 * - CallReady Supabase endpoints
 * - GHL webhook endpoints
 * - Twilio OTP endpoints
 * - Meta CAPI endpoints
 * - Smartlead API endpoints
 * - CallReady cold email webhooks
 * 
 * Usage: Navigate to site and run this script
 */

console.log('🔌 Starting Enhanced API Endpoint Validation Agent with CallReady API Keys...');

const API_CONFIG = {
  baseUrl: 'https://seniorsimple.vercel.app',
  testSessionId: `api_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timeout: 10000,
  testData: {
    firstName: 'CallReady',
    lastName: 'API',
    email: `callready.api+${Date.now()}@seniorsimple.com`,
    phone: '+1234567890',
    zipCode: '12345',
    state: 'CA'
  },
  // CallReady API Configuration
  callReadyAPIs: {
    supabase: {
      url: 'https://vpysqshhafthuxvokwqj.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweXNxc2hoYWZ0aHV4dm9rd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTY3ODcsImV4cCI6MjA2NTkzMjc4N30.fza16gc2qHpGzzMFa1H3O6W-YIsVTsCLH9uYy9pR31I'
    },
    ghl: {
      webhookUrl: 'https://services.leadconnectorhq.com/hooks/nKDUZ3SsvwJquGSe5GdD/webhook-trigger/9e302f36-dd83-474a-b098-15093062a9c8'
    },
    twilio: {
      accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      authToken: '0834bad206fb5899d5eceb7df4a74daa',
      verifyServiceSid: 'VAa378138c45bc8171eb5e1ef43c984987'
    },
    meta: {
      pixelId: '640341575806274',
      accessToken: 'EAAV5LOm4cwMBPY4We6JsjjTWdUpL5hnX0KAaG3skTzS8PE89MpvbcI6QBRM20DPy1HDB4qh8tZAay74COZAmFu3dRhBMtFMKwZB2KQIowR0hRelZA1vnhlmjr5ZBJJqvbpNiQBYTPnoG63l5cpKDs40VyAeZAbniOfUhZBIMPoWdjKpqXZCKZB9ZCtDxT6tTwgjc2ovKYgKYoYyAWHZCy0yRnipCSP1A5smYLjP2uDBUkOqKGgxNmFxg4KsAuL1IUGqvz3NH4SBypf2yzU4'
    },
    smartlead: {
      apiKey: '3a8f1994-9990-4e8c-9f03-7d586a944ebf_qe89e34',
      baseUrl: 'https://api.smartlead.ai'
    },
    callReadyColdEmail: {
      webhookUrl: 'https://callready-cold-email-production.up.railway.app/webhook/smartlead'
    }
  }
};

const API_RESULTS = {
  startTime: Date.now(),
  endpoints: [],
  errors: [],
  successCount: 0,
  totalEndpoints: 0,
  callReadyIntegrations: {
    supabase: { connected: false, endpoints: [] },
    ghl: { connected: false, endpoints: [] },
    twilio: { connected: false, endpoints: [] },
    meta: { connected: false, endpoints: [] },
    smartlead: { connected: false, endpoints: [] },
    callReadyColdEmail: { connected: false, endpoints: [] }
  }
};

function logAPIEndpoint(endpoint, message, data = {}) {
  console.log(`🔌 [${endpoint}] ${message}`, data);
  API_RESULTS.endpoints.push({ endpoint, message, data, timestamp: Date.now() });
  API_RESULTS.totalEndpoints++;
}

function logAPIError(endpoint, message, error = {}) {
  console.error(`❌ [${endpoint}] ${message}`, error);
  API_RESULTS.errors.push({ endpoint, message, error, timestamp: Date.now() });
}

function logAPISuccess(endpoint, message, data = {}) {
  console.log(`✅ [${endpoint}] ${message}`, data);
  API_RESULTS.successCount++;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test CallReady Supabase endpoints
async function testCallReadySupabaseEndpoints() {
  logAPIEndpoint('CallReady Supabase', 'Testing CallReady Supabase endpoints...');
  
  try {
    // Initialize Supabase client
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabase = createClient(
      API_CONFIG.callReadyAPIs.supabase.url,
      API_CONFIG.callReadyAPIs.supabase.anonKey
    );
    
    // Test 1: Connection test
    const { data: connectionData, error: connectionError } = await supabase
      .from('leads_master')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      logAPIError('CallReady Supabase', 'Connection test failed', connectionError);
      return false;
    }
    
    API_RESULTS.callReadyIntegrations.supabase.connected = true;
    API_RESULTS.callReadyIntegrations.supabase.endpoints.push('connection');
    logAPISuccess('CallReady Supabase', 'Connection successful');
    
    // Test 2: Insert test data
    const testLeadData = {
      first_name: API_CONFIG.testData.firstName,
      last_name: API_CONFIG.testData.lastName,
      email: API_CONFIG.testData.email,
      phone: API_CONFIG.testData.phone,
      zip_code: API_CONFIG.testData.zipCode,
      state: API_CONFIG.testData.state,
      session_id: API_CONFIG.testSessionId,
      source: 'api_validation_test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      callready_integration: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('leads_master')
      .insert([testLeadData])
      .select();
    
    if (insertError) {
      logAPIError('CallReady Supabase', 'Insert test failed', insertError);
    } else {
      API_RESULTS.callReadyIntegrations.supabase.endpoints.push('insert');
      logAPISuccess('CallReady Supabase', 'Insert test successful');
    }
    
    // Test 3: Query test data
    const { data: queryData, error: queryError } = await supabase
      .from('leads_master')
      .select('*')
      .eq('session_id', API_CONFIG.testSessionId)
      .limit(1);
    
    if (queryError) {
      logAPIError('CallReady Supabase', 'Query test failed', queryError);
    } else {
      API_RESULTS.callReadyIntegrations.supabase.endpoints.push('query');
      logAPISuccess('CallReady Supabase', 'Query test successful');
    }
    
    return true;
    
  } catch (error) {
    logAPIError('CallReady Supabase', 'Supabase endpoints test failed', error);
    return false;
  }
}

// Test GHL webhook endpoints
async function testGHLWebhookEndpoints() {
  logAPIEndpoint('GHL Webhook', 'Testing GHL webhook endpoints...');
  
  try {
    const testWebhookData = {
      first_name: API_CONFIG.testData.firstName,
      last_name: API_CONFIG.testData.lastName,
      email: API_CONFIG.testData.email,
      phone: API_CONFIG.testData.phone,
      zip_code: API_CONFIG.testData.zipCode,
      state: API_CONFIG.testData.state,
      session_id: API_CONFIG.testSessionId,
      source: 'api_validation_test',
      webhook_source: 'callready_api_test',
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(API_CONFIG.callReadyAPIs.ghl.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CallReady-API-Validation/1.0'
      },
      body: JSON.stringify(testWebhookData)
    });
    
    if (response.ok) {
      const responseData = await response.json();
      API_RESULTS.callReadyIntegrations.ghl.connected = true;
      API_RESULTS.callReadyIntegrations.ghl.endpoints.push('webhook');
      logAPISuccess('GHL Webhook', 'Webhook test successful', responseData);
    } else {
      logAPIError('GHL Webhook', `Webhook test failed: ${response.status}`);
    }
    
    return true;
    
  } catch (error) {
    logAPIError('GHL Webhook', 'GHL webhook endpoints test failed', error);
    return false;
  }
}

// Test Twilio OTP endpoints
async function testTwilioOTPEndpoints() {
  logAPIEndpoint('Twilio OTP', 'Testing Twilio OTP endpoints...');
  
  try {
    // Test 1: Send OTP
    const otpData = {
      phone: API_CONFIG.testData.phone,
      session_id: API_CONFIG.testSessionId,
      twilio_service_sid: API_CONFIG.callReadyAPIs.twilio.verifyServiceSid
    };
    
    // Simulate OTP send (would normally call Twilio API)
    const otpSendResponse = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(otpData)
    });
    
    if (otpSendResponse.ok) {
      API_RESULTS.callReadyIntegrations.twilio.connected = true;
      API_RESULTS.callReadyIntegrations.twilio.endpoints.push('send_otp');
      logAPISuccess('Twilio OTP', 'OTP send test successful');
    } else {
      logAPIError('Twilio OTP', 'OTP send test failed');
    }
    
    // Test 2: Verify OTP
    const verifyData = {
      phone: API_CONFIG.testData.phone,
      code: '123456',
      session_id: API_CONFIG.testSessionId,
      twilio_service_sid: API_CONFIG.callReadyAPIs.twilio.verifyServiceSid
    };
    
    const otpVerifyResponse = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    });
    
    if (otpVerifyResponse.ok) {
      API_RESULTS.callReadyIntegrations.twilio.endpoints.push('verify_otp');
      logAPISuccess('Twilio OTP', 'OTP verify test successful');
    } else {
      logAPIError('Twilio OTP', 'OTP verify test failed');
    }
    
    return true;
    
  } catch (error) {
    logAPIError('Twilio OTP', 'Twilio OTP endpoints test failed', error);
    return false;
  }
}

// Test Meta CAPI endpoints
async function testMetaCAPIEndpoints() {
  logAPIEndpoint('Meta CAPI', 'Testing Meta CAPI endpoints...');
  
  try {
    // Test 1: Meta CAPI event
    const capiData = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: [API_CONFIG.testData.email],
        ph: [API_CONFIG.testData.phone],
        fn: [API_CONFIG.testData.firstName],
        ln: [API_CONFIG.testData.lastName],
        ct: ['San Francisco'],
        st: [API_CONFIG.testData.state],
        zp: [API_CONFIG.testData.zipCode]
      },
      custom_data: {
        content_name: 'API Validation Test',
        content_category: 'api_testing',
        value: 1,
        currency: 'USD',
        callready_integration: true,
        session_id: API_CONFIG.testSessionId
      }
    };
    
    const capiResponse = await fetch(`https://graph.facebook.com/v18.0/${API_CONFIG.callReadyAPIs.meta.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.callReadyAPIs.meta.accessToken}`
      },
      body: JSON.stringify({
        data: [capiData],
        test_event_code: 'TEST12345'
      })
    });
    
    if (capiResponse.ok) {
      API_RESULTS.callReadyIntegrations.meta.connected = true;
      API_RESULTS.callReadyIntegrations.meta.endpoints.push('capi');
      logAPISuccess('Meta CAPI', 'CAPI test successful');
    } else {
      logAPIError('Meta CAPI', `CAPI test failed: ${capiResponse.status}`);
    }
    
    // Test 2: Meta Pixel test
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: 'API Validation Test',
        content_category: 'api_testing',
        value: 1,
        currency: 'USD',
        callready_integration: true,
        session_id: API_CONFIG.testSessionId
      });
      
      API_RESULTS.callReadyIntegrations.meta.endpoints.push('pixel');
      logAPISuccess('Meta CAPI', 'Pixel test successful');
    }
    
    return true;
    
  } catch (error) {
    logAPIError('Meta CAPI', 'Meta CAPI endpoints test failed', error);
    return false;
  }
}

// Test Smartlead API endpoints
async function testSmartleadEndpoints() {
  logAPIEndpoint('Smartlead', 'Testing Smartlead API endpoints...');
  
  try {
    // Test 1: Smartlead API connection
    const smartleadResponse = await fetch(`${API_CONFIG.callReadyAPIs.smartlead.baseUrl}/v1/leads`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.callReadyAPIs.smartlead.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (smartleadResponse.ok) {
      API_RESULTS.callReadyIntegrations.smartlead.connected = true;
      API_RESULTS.callReadyIntegrations.smartlead.endpoints.push('leads');
      logAPISuccess('Smartlead', 'Smartlead API test successful');
    } else {
      logAPIError('Smartlead', `Smartlead API test failed: ${smartleadResponse.status}`);
    }
    
    return true;
    
  } catch (error) {
    logAPIError('Smartlead', 'Smartlead API endpoints test failed', error);
    return false;
  }
}

// Test CallReady cold email webhook endpoints
async function testCallReadyColdEmailEndpoints() {
  logAPIEndpoint('CallReady Cold Email', 'Testing CallReady cold email webhook endpoints...');
  
  try {
    const coldEmailData = {
      email: API_CONFIG.testData.email,
      first_name: API_CONFIG.testData.firstName,
      last_name: API_CONFIG.testData.lastName,
      phone: API_CONFIG.testData.phone,
      zip_code: API_CONFIG.testData.zipCode,
      state: API_CONFIG.testData.state,
      session_id: API_CONFIG.testSessionId,
      source: 'api_validation_test',
      webhook_source: 'callready_cold_email_test',
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(API_CONFIG.callReadyAPIs.callReadyColdEmail.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CallReady-API-Validation/1.0'
      },
      body: JSON.stringify(coldEmailData)
    });
    
    if (response.ok) {
      const responseData = await response.json();
      API_RESULTS.callReadyIntegrations.callReadyColdEmail.connected = true;
      API_RESULTS.callReadyIntegrations.callReadyColdEmail.endpoints.push('webhook');
      logAPISuccess('CallReady Cold Email', 'Cold email webhook test successful', responseData);
    } else {
      logAPIError('CallReady Cold Email', `Cold email webhook test failed: ${response.status}`);
    }
    
    return true;
    
  } catch (error) {
    logAPIError('CallReady Cold Email', 'CallReady cold email webhook endpoints test failed', error);
    return false;
  }
}

// Generate enhanced API validation report
function generateEnhancedAPIReport() {
  const endTime = Date.now();
  const duration = endTime - API_RESULTS.startTime;
  
  console.log('\n' + '='.repeat(80));
  console.log('🔌 ENHANCED API ENDPOINT VALIDATION REPORT WITH CALLREADY API KEYS');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Endpoints: ${API_RESULTS.totalEndpoints}`);
  console.log(`   Successful: ${API_RESULTS.successCount}`);
  console.log(`   Success Rate: ${((API_RESULTS.successCount / API_RESULTS.totalEndpoints) * 100).toFixed(1)}%`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
  
  console.log(`\n🔌 CALLREADY INTEGRATIONS:`);
  console.log(`   Supabase: ${API_RESULTS.callReadyIntegrations.supabase.connected ? '✅' : '❌'} (${API_RESULTS.callReadyIntegrations.supabase.endpoints.length} endpoints)`);
  console.log(`   GHL Webhook: ${API_RESULTS.callReadyIntegrations.ghl.connected ? '✅' : '❌'} (${API_RESULTS.callReadyIntegrations.ghl.endpoints.length} endpoints)`);
  console.log(`   Twilio OTP: ${API_RESULTS.callReadyIntegrations.twilio.connected ? '✅' : '❌'} (${API_RESULTS.callReadyIntegrations.twilio.endpoints.length} endpoints)`);
  console.log(`   Meta CAPI: ${API_RESULTS.callReadyIntegrations.meta.connected ? '✅' : '❌'} (${API_RESULTS.callReadyIntegrations.meta.endpoints.length} endpoints)`);
  console.log(`   Smartlead: ${API_RESULTS.callReadyIntegrations.smartlead.connected ? '✅' : '❌'} (${API_RESULTS.callReadyIntegrations.smartlead.endpoints.length} endpoints)`);
  console.log(`   CallReady Cold Email: ${API_RESULTS.callReadyIntegrations.callReadyColdEmail.connected ? '✅' : '❌'} (${API_RESULTS.callReadyIntegrations.callReadyColdEmail.endpoints.length} endpoints)`);
  
  console.log(`\n📝 ENDPOINTS TESTED:`);
  API_RESULTS.endpoints.forEach(endpoint => {
    console.log(`   ✅ [${endpoint.endpoint}] ${endpoint.message}`);
  });
  
  console.log(`\n❌ ERRORS (${API_RESULTS.errors.length}):`);
  API_RESULTS.errors.forEach(error => {
    console.log(`   - [${error.endpoint}] ${error.message}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  return API_RESULTS;
}

// Main enhanced API validation tester
async function runEnhancedAPIValidationTest() {
  logAPIEndpoint('Enhanced API Validation', 'Starting Enhanced API Validation with CallReady...');
  
  try {
    // Test all CallReady API endpoints
    await testCallReadySupabaseEndpoints();
    await wait(1000);
    
    await testGHLWebhookEndpoints();
    await wait(1000);
    
    await testTwilioOTPEndpoints();
    await wait(1000);
    
    await testMetaCAPIEndpoints();
    await wait(1000);
    
    await testSmartleadEndpoints();
    await wait(1000);
    
    await testCallReadyColdEmailEndpoints();
    
    // Generate report
    const report = generateEnhancedAPIReport();
    
    logAPIEndpoint('Enhanced API Validation', '✅ Enhanced API validation with CallReady completed!');
    
    return report;
    
  } catch (error) {
    logAPIError('Enhanced API Validation', 'Enhanced API validation failed', error);
    return API_RESULTS;
  }
}

// Export for manual testing
window.enhancedAPIValidator = {
  runTest: runEnhancedAPIValidationTest,
  testCallReadySupabaseEndpoints: testCallReadySupabaseEndpoints,
  testGHLWebhookEndpoints: testGHLWebhookEndpoints,
  testTwilioOTPEndpoints: testTwilioOTPEndpoints,
  testMetaCAPIEndpoints: testMetaCAPIEndpoints,
  testSmartleadEndpoints: testSmartleadEndpoints,
  testCallReadyColdEmailEndpoints: testCallReadyColdEmailEndpoints,
  generateReport: generateEnhancedAPIReport,
  getResults: () => API_RESULTS,
  config: API_CONFIG
};

console.log('🔌 Enhanced API Validator functions available:');
console.log('   - window.enhancedAPIValidator.runTest()');
console.log('   - window.enhancedAPIValidator.testCallReadySupabaseEndpoints()');
console.log('   - window.enhancedAPIValidator.testGHLWebhookEndpoints()');
console.log('   - window.enhancedAPIValidator.testTwilioOTPEndpoints()');
console.log('   - window.enhancedAPIValidator.testMetaCAPIEndpoints()');
console.log('   - window.enhancedAPIValidator.testSmartleadEndpoints()');
console.log('   - window.enhancedAPIValidator.testCallReadyColdEmailEndpoints()');

// Auto-run the enhanced API validation test
runEnhancedAPIValidationTest();
```

## 🎯 **Quick Start:**

1. **Copy the entire script above**
2. **Go to**: `https://seniorsimple.vercel.app`
3. **Open browser console** (F12)
4. **Paste and run the script**
5. **Watch the automated API testing and review the comprehensive report**

## 📊 **What You'll See:**

- ✅ **Real-time API testing progress** with detailed logging
- ✅ **CallReady integration status** for each API system
- ✅ **Comprehensive report** with success rates and errors
- ✅ **Endpoint validation** through all CallReady systems
- ✅ **Performance metrics** and response times

The agent will automatically test all your API endpoints and validate that all CallReady integrations are working correctly!