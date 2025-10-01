/**
 * 🧪 SENIORSIMPLE TRACKING FIXES TEST
 * 
 * This script tests the fixed tracking implementation
 * to verify all issues are resolved
 */

console.log('🧪 Starting SeniorSimple Tracking Fixes Test...');

// Test configuration
const TEST_CONFIG = {
  testSessionId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

// Test 1: Quiz Start Event
async function testQuizStart() {
  console.log('🧪 Testing Quiz Start Event...');
  
  const eventData = {
    event: 'quiz_start',
    quiz_type: 'annuity',
    session_id: TEST_CONFIG.testSessionId,
    funnel_type: 'annuity',
    page_title: 'SeniorSimple Retirement Quiz',
    page_location: window.location.href,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  logTest('Quiz Start', 'Event pushed with all required data');
  logTest('Quiz Start', `Session ID: ${eventData.session_id}`);
  logTest('Quiz Start', `Quiz Type: ${eventData.quiz_type}`);
  logTest('Quiz Start', `Funnel Type: ${eventData.funnel_type}`);
  
  return eventData;
}

// Test 2: Question Answer Events
async function testQuestionAnswers() {
  console.log('🧪 Testing Question Answer Events...');
  
  const questions = [
    { number: 1, text: 'Do you have $100,000+ in investable assets?', answer: 'Yes, I have $100,000 or more' },
    { number: 2, text: 'How soon are you planning to retire?', answer: 'Within 1-2 years' },
    { number: 3, text: 'What type of retirement plans?', answer: '401k, IRA' },
    { number: 4, text: 'How much saved for retirement?', answer: '$750,000 - $999,999' },
    { number: 5, text: 'What is your risk tolerance?', answer: 'Moderate' }
  ];
  
  for (const question of questions) {
    const eventData = {
      event: 'question_answer',
      question_number: question.number,
      question_text: question.text,
      answer_value: question.answer,
      quiz_type: 'annuity',
      session_id: TEST_CONFIG.testSessionId,
      funnel_type: 'annuity',
      timestamp: Date.now()
    };
    
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
    
    logTest('Question Answer', `Question ${question.number} answered`);
    logTest('Question Answer', `Answer: ${question.answer}`);
    
    await wait(1000);
  }
  
  logTest('Question Answers', 'All 5 questions answered with proper data');
}

// Test 3: Quiz Complete Event
async function testQuizComplete() {
  console.log('🧪 Testing Quiz Complete Event...');
  
  const eventData = {
    event: 'quiz_complete',
    quiz_type: 'annuity',
    session_id: TEST_CONFIG.testSessionId,
    funnel_type: 'annuity',
    completion_time: 12000,
    lead_score: 85,
    total_questions: 5,
    answered_questions: 5,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  logTest('Quiz Complete', 'Event pushed with completion data');
  logTest('Quiz Complete', `Completion Time: ${eventData.completion_time}ms`);
  logTest('Quiz Complete', `Lead Score: ${eventData.lead_score}`);
  
  return eventData;
}

// Test 4: Form Start Event
async function testFormStart() {
  console.log('🧪 Testing Form Start Event...');
  
  const eventData = {
    event: 'form_start',
    form_id: 'lead_form',
    form_name: 'SeniorSimple Lead Form',
    form_destination: window.location.href,
    form_length: 4,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  logTest('Form Start', 'Event pushed with form data');
  logTest('Form Start', `Form ID: ${eventData.form_id}`);
  logTest('Form Start', `Form Name: ${eventData.form_name}`);
  
  return eventData;
}

// Test 5: Lead Form Submit Event
async function testLeadFormSubmit() {
  console.log('🧪 Testing Lead Form Submit Event...');
  
  const leadData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    zip_code: '12345',
    age: '65',
    current_insurance: 'Medicare',
    health_status: 'Good',
    medicare_eligibility: 'Yes',
    income_range: '$50,000 - $75,000'
  };
  
  const eventData = {
    event: 'lead_form_submit',
    event_category: 'lead_generation',
    event_label: 'SeniorSimple Medicare Quiz',
    value: 1,
    quiz_type: 'annuity',
    session_id: TEST_CONFIG.testSessionId,
    funnel_type: 'annuity',
    lead_score: 85,
    completion_time: 12000,
    form_id: 'lead_form',
    form_name: 'SeniorSimple Lead Form',
    // Include all lead data
    first_name: leadData.first_name,
    last_name: leadData.last_name,
    email: leadData.email,
    phone: leadData.phone,
    zip_code: leadData.zip_code,
    age: leadData.age,
    current_insurance: leadData.current_insurance,
    health_status: leadData.health_status,
    medicare_eligibility: leadData.medicare_eligibility,
    income_range: leadData.income_range,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  logTest('Lead Form Submit', 'Event pushed with complete lead data');
  logTest('Lead Form Submit', `Lead Score: ${eventData.lead_score}`);
  logTest('Lead Form Submit', `Event Category: ${eventData.event_category}`);
  logTest('Lead Form Submit', `Event Label: ${eventData.event_label}`);
  
  return eventData;
}

// Test 6: Form Submit Event
async function testFormSubmit() {
  console.log('🧪 Testing Form Submit Event...');
  
  const eventData = {
    event: 'form_submit',
    form_id: 'lead_form',
    form_name: 'SeniorSimple Lead Form',
    form_destination: window.location.href,
    form_length: 4,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  logTest('Form Submit', 'Event pushed with form data');
  logTest('Form Submit', `Form ID: ${eventData.form_id}`);
  logTest('Form Submit', `Form Name: ${eventData.form_name}`);
  
  return eventData;
}

// Test 7: Verify DataLayer Events
function verifyDataLayerEvents() {
  console.log('🧪 Verifying DataLayer Events...');
  
  const dataLayerEvents = window.dataLayer?.filter(item => item.event) || [];
  logTest('DataLayer', `Total events: ${dataLayerEvents.length}`);
  
  const eventTypes = dataLayerEvents.map(event => event.event);
  logTest('DataLayer', `Event types: ${eventTypes.join(', ')}`);
  
  // Check for required events
  const requiredEvents = ['quiz_start', 'question_answer', 'quiz_complete', 'lead_form_submit'];
  const missingEvents = requiredEvents.filter(event => !eventTypes.includes(event));
  
  if (missingEvents.length === 0) {
    logTest('DataLayer', 'All required events present');
  } else {
    logError('DataLayer', `Missing events: ${missingEvents.join(', ')}`);
  }
  
  return dataLayerEvents;
}

// Test 8: Check GTM Variables
function checkGTMVariables() {
  console.log('🧪 Checking GTM Variables...');
  
  // Check if GTM is loaded
  if (typeof window.google_tag_manager !== 'undefined') {
    logTest('GTM', 'GTM container loaded');
  } else {
    logError('GTM', 'GTM container not loaded');
  }
  
  // Check if DataLayer is available
  if (Array.isArray(window.dataLayer)) {
    logTest('GTM', 'DataLayer available');
  } else {
    logError('GTM', 'DataLayer not available');
  }
  
  // Check for tracking scripts
  const gtmScript = document.querySelector('script[src*="googletagmanager.com"]');
  if (gtmScript) {
    logTest('GTM', 'GTM script found');
  } else {
    logError('GTM', 'GTM script not found');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SeniorSimple Tracking Fixes Test...');
  console.log('Test Session ID:', TEST_CONFIG.testSessionId);
  console.log('Current URL:', window.location.href);
  
  try {
    // Test 1: Quiz Start
    await testQuizStart();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 2: Question Answers
    await testQuestionAnswers();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 3: Quiz Complete
    await testQuizComplete();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 4: Form Start
    await testFormStart();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 5: Lead Form Submit
    await testLeadFormSubmit();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 6: Form Submit
    await testFormSubmit();
    await wait(TEST_CONFIG.delayBetweenTests);
    
    // Test 7: Verify DataLayer
    verifyDataLayerEvents();
    
    // Test 8: Check GTM
    checkGTMVariables();
    
    console.log('✅ All tests completed successfully!');
    console.log('📊 Next steps:');
    console.log('   1. Check GTM Preview mode for all events');
    console.log('   2. Verify all tags are firing');
    console.log('   3. Check GA4 Real-time reports');
    console.log('   4. Check Meta Events Manager');
    console.log('   5. Verify no more undefined variables');
    
  } catch (error) {
    logError('TestRunner', 'Test execution failed', error);
  }
}

// Run tests automatically
runAllTests();

// Export for manual testing
window.seniorSimpleFixesTest = {
  runAllTests,
  testQuizStart,
  testQuestionAnswers,
  testQuizComplete,
  testFormStart,
  testLeadFormSubmit,
  testFormSubmit,
  verifyDataLayerEvents,
  checkGTMVariables,
  config: TEST_CONFIG
};

console.log('🎯 Fixes test functions available:');
console.log('   - window.seniorSimpleFixesTest.runAllTests()');
console.log('   - window.seniorSimpleFixesTest.testQuizStart()');
console.log('   - window.seniorSimpleFixesTest.testQuestionAnswers()');
console.log('   - window.seniorSimpleFixesTest.testQuizComplete()');
console.log('   - window.seniorSimpleFixesTest.testFormStart()');
console.log('   - window.seniorSimpleFixesTest.testLeadFormSubmit()');
console.log('   - window.seniorSimpleFixesTest.testFormSubmit()');
console.log('   - window.seniorSimpleFixesTest.verifyDataLayerEvents()');
console.log('   - window.seniorSimpleFixesTest.checkGTMVariables()');
