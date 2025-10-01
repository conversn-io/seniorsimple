/**
 * 🕷️ SENIORSIMPLE QUIZ CRAWLER
 * 
 * This script automatically crawls through the SeniorSimple quiz
 * and generates real tracking events by simulating user interactions.
 * 
 * Usage:
 * 1. Navigate to SeniorSimple quiz page
 * 2. Open browser console
 * 3. Paste and run this script
 * 4. Watch the automated quiz completion
 */

console.log('🕷️ Starting SeniorSimple Quiz Crawler...');

// Crawler configuration
const CRAWLER_CONFIG = {
  baseUrl: 'https://seniorsimple.com/quiz', // Update with your actual quiz URL
  testSessionId: `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  delayBetweenActions: 2000, // 2 seconds between actions
  testUser: {
    firstName: 'Crawl',
    lastName: 'Test',
    email: 'crawl@seniorsimple.com',
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
function logCrawl(step, message, data = {}) {
  console.log(`🕷️ [${step}] ${message}`, data);
}

function logError(step, message, error = {}) {
  console.error(`❌ [${step}] ${message}`, error);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Find and click elements
function findAndClick(selector, description) {
  const element = document.querySelector(selector);
  if (element) {
    element.click();
    logCrawl('Click', `Clicked ${description}`);
    return true;
  } else {
    logError('Click', `Element not found: ${selector}`);
    return false;
  }
}

// Find and fill input
function findAndFill(selector, value, description) {
  const element = document.querySelector(selector);
  if (element) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    logCrawl('Fill', `Filled ${description} with: ${value}`);
    return true;
  } else {
    logError('Fill', `Input not found: ${selector}`);
    return false;
  }
}

// Simulate quiz start
async function simulateQuizStart() {
  logCrawl('Quiz', 'Starting quiz simulation...');
  
  // Set quiz start time for tracking
  window.quizStartTime = Date.now();
  
  // Simulate page view tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'SeniorSimple Retirement Quiz',
      page_location: window.location.href
    });
  }
  
  // Simulate dataLayer quiz start
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'quiz_start',
    'quiz_type': 'annuity',
    'session_id': CRAWLER_CONFIG.testSessionId,
    'funnel_type': 'annuity'
  });
  
  logCrawl('Quiz', 'Quiz start event triggered');
}

// Simulate question answering
async function simulateQuestionAnswer(questionNumber, questionText, answerValue) {
  logCrawl('Question', `Answering question ${questionNumber}: ${questionText}`);
  
  // Simulate clicking on answer
  const answerSelectors = [
    'input[type="radio"]',
    'button[data-answer]',
    '.quiz-option',
    '.answer-option'
  ];
  
  let clicked = false;
  for (const selector of answerSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Click the first available answer option
      elements[0].click();
      clicked = true;
      break;
    }
  }
  
  if (!clicked) {
    // If no specific answer elements found, try to find any clickable element
    const clickableElements = document.querySelectorAll('button, input, .clickable');
    if (clickableElements.length > 0) {
      clickableElements[0].click();
      clicked = true;
    }
  }
  
  // Simulate dataLayer question answer event
  window.dataLayer.push({
    'event': 'question_answer',
    'question_number': questionNumber,
    'question_text': questionText,
    'answer_value': answerValue,
    'session_id': CRAWLER_CONFIG.testSessionId,
    'funnel_type': 'annuity'
  });
  
  // Simulate GA4 question answer event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'question_answer', {
      'question_number': questionNumber,
      'question_text': questionText,
      'answer_value': answerValue,
      'session_id': CRAWLER_CONFIG.testSessionId,
      'funnel_type': 'annuity'
    });
  }
  
  logCrawl('Question', `Question ${questionNumber} answered: ${answerValue}`);
}

// Simulate quiz completion
async function simulateQuizComplete() {
  logCrawl('Quiz', 'Completing quiz...');
  
  const completionTime = Date.now() - window.quizStartTime;
  
  // Simulate dataLayer quiz complete event
  window.dataLayer.push({
    'event': 'quiz_complete',
    'quiz_type': 'annuity',
    'session_id': CRAWLER_CONFIG.testSessionId,
    'funnel_type': 'annuity',
    'completion_time': completionTime,
    'lead_score': 85
  });
  
  // Simulate GA4 quiz complete event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'quiz_complete', {
      'quiz_type': 'annuity',
      'session_id': CRAWLER_CONFIG.testSessionId,
      'funnel_type': 'annuity',
      'completion_time': completionTime,
      'lead_score': 85
    });
  }
  
  logCrawl('Quiz', `Quiz completed in ${completionTime}ms`);
}

// Simulate lead form submission
async function simulateLeadSubmission() {
  logCrawl('Lead', 'Submitting lead form...');
  
  // Fill in lead form fields
  const formFields = [
    { selector: 'input[name="firstName"], input[name="first_name"]', value: CRAWLER_CONFIG.testUser.firstName, desc: 'First Name' },
    { selector: 'input[name="lastName"], input[name="last_name"]', value: CRAWLER_CONFIG.testUser.lastName, desc: 'Last Name' },
    { selector: 'input[name="email"], input[type="email"]', value: CRAWLER_CONFIG.testUser.email, desc: 'Email' },
    { selector: 'input[name="phone"], input[type="tel"]', value: CRAWLER_CONFIG.testUser.phone, desc: 'Phone' },
    { selector: 'input[name="zipCode"], input[name="zip_code"]', value: CRAWLER_CONFIG.testUser.zipCode, desc: 'Zip Code' }
  ];
  
  for (const field of formFields) {
    findAndFill(field.selector, field.value, field.desc);
    await wait(500);
  }
  
  // Simulate dataLayer lead form submit event
  window.dataLayer.push({
    'event': 'lead_form_submit',
    'event_category': 'lead_generation',
    'event_label': 'SeniorSimple Medicare Quiz',
    'value': 1,
    'session_id': CRAWLER_CONFIG.testSessionId,
    'funnel_type': 'annuity',
    'lead_score': 85,
    'first_name': CRAWLER_CONFIG.testUser.firstName,
    'last_name': CRAWLER_CONFIG.testUser.lastName,
    'email': CRAWLER_CONFIG.testUser.email,
    'phone': CRAWLER_CONFIG.testUser.phone,
    'zip_code': CRAWLER_CONFIG.testUser.zipCode,
    'state': CRAWLER_CONFIG.testUser.state
  });
  
  // Simulate GA4 lead form submit event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'lead_form_submit', {
      'event_category': 'lead_generation',
      'event_label': 'SeniorSimple Medicare Quiz',
      'value': 1,
      'session_id': CRAWLER_CONFIG.testSessionId,
      'funnel_type': 'annuity',
      'lead_score': 85
    });
  }
  
  // Simulate Meta Lead event
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
      content_name: 'SeniorSimple Medicare Quiz',
      content_category: 'lead_generation',
      value: 1,
      currency: 'USD',
      lead_source: 'seniorsimple_platform',
      session_id: CRAWLER_CONFIG.testSessionId,
      funnel_type: 'annuity',
      lead_score: 85
    });
  }
  
  logCrawl('Lead', 'Lead form submission simulated');
}

// Main crawler function
async function runQuizCrawler() {
  logCrawl('Crawler', 'Starting SeniorSimple Quiz Crawler...');
  logCrawl('Crawler', `Test Session ID: ${CRAWLER_CONFIG.testSessionId}`);
  
  try {
    // Step 1: Simulate quiz start
    await simulateQuizStart();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Step 2: Simulate answering questions
    const questions = [
      {
        number: 1,
        text: 'Do you have a minimum of at least $100,000 or more in investable assets?',
        answer: 'Yes, I have $100,000 or more'
      },
      {
        number: 2,
        text: 'How soon are you planning to retire?',
        answer: 'Within 1-2 years'
      },
      {
        number: 3,
        text: 'What type of retirement plans are you investing in now?',
        answer: '401k, IRA'
      },
      {
        number: 4,
        text: 'How much do you have saved for retirement?',
        answer: '$750,000 - $999,999'
      },
      {
        number: 5,
        text: 'What is your risk tolerance?',
        answer: 'Moderate'
      }
    ];
    
    for (const question of questions) {
      await simulateQuestionAnswer(question.number, question.text, question.answer);
      await wait(CRAWLER_CONFIG.delayBetweenActions);
    }
    
    // Step 3: Simulate quiz completion
    await simulateQuizComplete();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Step 4: Simulate lead form submission
    await simulateLeadSubmission();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    logCrawl('Crawler', '✅ Quiz crawler completed successfully!');
    logCrawl('Crawler', '📊 Check the following for verification:');
    logCrawl('Crawler', '   - GA4 Real-time reports');
    logCrawl('Crawler', '   - Meta Events Manager');
    logCrawl('Crawler', '   - GTM Preview mode');
    logCrawl('Crawler', '   - Browser console for events');
    
  } catch (error) {
    logError('Crawler', 'Quiz crawler failed', error);
  }
}

// Run crawler
runQuizCrawler();

// Export for manual testing
window.seniorSimpleCrawler = {
  runCrawler: runQuizCrawler,
  simulateQuizStart: simulateQuizStart,
  simulateQuestionAnswer: simulateQuestionAnswer,
  simulateQuizComplete: simulateQuizComplete,
  simulateLeadSubmission: simulateLeadSubmission,
  config: CRAWLER_CONFIG
};

console.log('🎯 Crawler functions available:');
console.log('   - window.seniorSimpleCrawler.runCrawler()');
console.log('   - window.seniorSimpleCrawler.simulateQuizStart()');
console.log('   - window.seniorSimpleCrawler.simulateQuestionAnswer(1, "Question?", "Answer")');
console.log('   - window.seniorSimpleCrawler.simulateQuizComplete()');
console.log('   - window.seniorSimpleCrawler.simulateLeadSubmission()');
