/**
 * 🔧 SENIORSIMPLE TRACKING - FIXED VERSION
 * 
 * This file contains the corrected tracking implementation
 * that addresses all the issues identified in GTM Preview
 */

// ✅ FIXED: Quiz Start Event
function trackQuizStart(quizType = 'annuity', sessionId = null) {
  const eventData = {
    event: 'quiz_start',
    quiz_type: quizType,
    session_id: sessionId || generateSessionId(),
    funnel_type: 'annuity',
    page_title: 'SeniorSimple Retirement Quiz',
    page_location: window.location.href,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Quiz Start] Event pushed:', eventData);
  return eventData;
}

// ✅ FIXED: Question Answer Event
function trackQuestionAnswer(questionNumber, questionText, answerValue, sessionId, quizType = 'annuity') {
  const eventData = {
    event: 'question_answer',
    question_number: questionNumber,
    question_text: questionText,
    answer_value: answerValue,
    quiz_type: quizType,
    session_id: sessionId,
    funnel_type: 'annuity',
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Question Answer] Event pushed:', eventData);
  return eventData;
}

// ✅ FIXED: Quiz Complete Event
function trackQuizComplete(quizType = 'annuity', sessionId, completionTime, leadScore = 85) {
  const eventData = {
    event: 'quiz_complete',
    quiz_type: quizType,
    session_id: sessionId,
    funnel_type: 'annuity',
    completion_time: completionTime,
    lead_score: leadScore,
    total_questions: 5,
    answered_questions: 5,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Quiz Complete] Event pushed:', eventData);
  return eventData;
}

// ✅ FIXED: Lead Form Submit Event
function trackLeadFormSubmit(leadData, sessionId, quizType = 'annuity') {
  const eventData = {
    event: 'lead_form_submit',
    event_category: 'lead_generation',
    event_label: 'SeniorSimple Medicare Quiz',
    value: 1,
    quiz_type: quizType,
    session_id: sessionId,
    funnel_type: 'annuity',
    lead_score: leadData.lead_score || 85,
    completion_time: leadData.completion_time || 0,
    form_id: 'lead_form',
    form_name: 'SeniorSimple Lead Form',
    // Include all lead data
    first_name: leadData.first_name || '',
    last_name: leadData.last_name || '',
    email: leadData.email || '',
    phone: leadData.phone || '',
    zip_code: leadData.zip_code || '',
    age: leadData.age || '',
    current_insurance: leadData.current_insurance || '',
    health_status: leadData.health_status || '',
    medicare_eligibility: leadData.medicare_eligibility || '',
    income_range: leadData.income_range || '',
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Lead Form Submit] Event pushed:', eventData);
  return eventData;
}

// ✅ FIXED: Form Start Event
function trackFormStart(formId = 'lead_form', formName = 'SeniorSimple Lead Form') {
  const eventData = {
    event: 'form_start',
    form_id: formId,
    form_name: formName,
    form_destination: window.location.href,
    form_length: 4,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Form Start] Event pushed:', eventData);
  return eventData;
}

// ✅ FIXED: Form Submit Event
function trackFormSubmit(formId = 'lead_form', formName = 'SeniorSimple Lead Form') {
  const eventData = {
    event: 'form_submit',
    form_id: formId,
    form_name: formName,
    form_destination: window.location.href,
    form_length: 4,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Form Submit] Event pushed:', eventData);
  return eventData;
}

// ✅ FIXED: Page View Event
function trackPageView(pageTitle, pageLocation) {
  const eventData = {
    event: 'page_view',
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: window.location.pathname,
    timestamp: Date.now()
  };
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
  
  console.log('✅ [Page View] Event pushed:', eventData);
  return eventData;
}

// Utility function to generate session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ✅ FIXED: Complete Quiz Flow Test
async function testCompleteQuizFlow() {
  console.log('🚀 Starting Complete Quiz Flow Test...');
  
  const sessionId = generateSessionId();
  console.log('Session ID:', sessionId);
  
  try {
    // Step 1: Quiz Start
    console.log('📝 Step 1: Quiz Start');
    trackQuizStart('annuity', sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Answer Questions
    console.log('📝 Step 2: Answering Questions');
    const questions = [
      { number: 1, text: 'Do you have $100,000+ in investable assets?', answer: 'Yes, I have $100,000 or more' },
      { number: 2, text: 'How soon are you planning to retire?', answer: 'Within 1-2 years' },
      { number: 3, text: 'What type of retirement plans?', answer: '401k, IRA' },
      { number: 4, text: 'How much saved for retirement?', answer: '$750,000 - $999,999' },
      { number: 5, text: 'What is your risk tolerance?', answer: 'Moderate' }
    ];
    
    for (const question of questions) {
      trackQuestionAnswer(question.number, question.text, question.answer, sessionId, 'annuity');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 3: Quiz Complete
    console.log('📝 Step 3: Quiz Complete');
    const completionTime = 12000;
    trackQuizComplete('annuity', sessionId, completionTime, 85);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Form Start
    console.log('📝 Step 4: Form Start');
    trackFormStart('lead_form', 'SeniorSimple Lead Form');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: Lead Form Submit
    console.log('📝 Step 5: Lead Form Submit');
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
      income_range: '$50,000 - $75,000',
      lead_score: 85,
      completion_time: completionTime
    };
    
    trackLeadFormSubmit(leadData, sessionId, 'annuity');
    
    // Step 6: Form Submit
    console.log('📝 Step 6: Form Submit');
    trackFormSubmit('lead_form', 'SeniorSimple Lead Form');
    
    console.log('✅ Complete Quiz Flow Test Finished!');
    console.log('📊 Check GTM Preview for all events and tags firing');
    console.log('📊 Check GA4 Real-time for quiz and lead events');
    console.log('📊 Check Meta Events Manager for lead events');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export functions for use
window.seniorSimpleTrackingFixed = {
  trackQuizStart,
  trackQuestionAnswer,
  trackQuizComplete,
  trackLeadFormSubmit,
  trackFormStart,
  trackFormSubmit,
  trackPageView,
  testCompleteQuizFlow,
  generateSessionId
};

console.log('🎯 SeniorSimple Tracking Fixed - Functions Available:');
console.log('   - window.seniorSimpleTrackingFixed.testCompleteQuizFlow()');
console.log('   - window.seniorSimpleTrackingFixed.trackQuizStart()');
console.log('   - window.seniorSimpleTrackingFixed.trackQuestionAnswer()');
console.log('   - window.seniorSimpleTrackingFixed.trackQuizComplete()');
console.log('   - window.seniorSimpleTrackingFixed.trackLeadFormSubmit()');
console.log('   - window.seniorSimpleTrackingFixed.trackFormStart()');
console.log('   - window.seniorSimpleTrackingFixed.trackFormSubmit()');
