// test-webhook-functions.js
const SUPABASE_URL = 'https://jqjftrlnyysqcwbbigpw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxamZ0cmxueXlzcWN3YmJpZ3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTQ2MzksImV4cCI6MjA2Njg3MDYzOX0.ZqgLIflQJY5zC3ZnU5K9k_KEM9bDdNhtq3ek6ckuwjAo';

// Test payloads for different functions
const testPayloads = {
  'submit-quiz': {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+15551234567',
    zipCode: '92102',
    state: 'CA',
    quizAnswers: {
      age: '65',
      retirementGoal: 'comfortable',
      currentSavings: '500000'
    }
  },
  'submit-form': {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+15551234567',
    zipCode: '92102',
    state: 'CA',
    message: 'Test form submission'
  },
  'webhook-dispatch': {
    webhook_url: 'https://hooks.zapier.com/hooks/catch/test/',
    payload: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+15551234567'
    }
  },
  'resend-webhooks': {
    webhook_url: 'https://hooks.zapier.com/hooks/catch/test/',
    payload: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe'
    }
  }
};

async function testWebhookFunction(functionName, payload) {
  console.log(`\n🧪 Testing ${functionName}...`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const data = await response.json();
    
    console.log(`📡 ${functionName} Response:`, {
      status: response.status,
      responseTime: `${responseTime}ms`,
      data: data
    });
    
    return {
      function: functionName,
      success: response.ok,
      status: response.status,
      responseTime: responseTime,
      data: data,
      error: null
    };
  } catch (error) {
    console.error(`❌ ${functionName} Error:`, error);
    return {
      function: functionName,
      success: false,
      status: 0,
      responseTime: 0,
      data: null,
      error: error.message
    };
  }
}

async function runAllTests() {
  const functions = ['submit-quiz', 'submit-form', 'webhook-dispatch', 'resend-webhooks'];
  const results = [];
  
  console.log('🚀 WEBHOOK FUNCTION EVALUATION');
  console.log('==============================');
  
  for (const func of functions) {
    const payload = testPayloads[func];
    console.log(`\nTesting ${func} with payload:`, payload);
    const result = await testWebhookFunction(func, payload);
    results.push(result);
    
    // Wait 1 second between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 WEBHOOK EVALUATION RESULTS:');
  console.log('============================');
  
  results.forEach(result => {
    console.log(`\n${result.function}:`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Response Time: ${result.responseTime}ms`);
    if (result.data) console.log(`  Data:`, result.data);
    if (result.error) console.log(`  Error:`, result.error);
  });
  
  // Determine best webhook
  const successfulFunctions = results.filter(r => r.success);
  
  console.log('\n🎯 RECOMMENDATION:');
  if (successfulFunctions.length > 0) {
    const fastestFunction = successfulFunctions.reduce((prev, current) => 
      (prev.responseTime < current.responseTime) ? prev : current
    );
    console.log(`Best Function: ${fastestFunction.function}`);
    console.log(`Reason: Successfully processed test payload in ${fastestFunction.responseTime}ms`);
    console.log(`Status: ${fastestFunction.status}`);
  } else {
    console.log('No functions working - investigate further');
  }
  
  return results;
}

// Run the tests
runAllTests().then(results => {
  console.log('\n✅ Webhook evaluation complete');
  process.exit(0);
}).catch(error => {
  console.error('🚨 Webhook evaluation failed:', error);
  process.exit(1);
});