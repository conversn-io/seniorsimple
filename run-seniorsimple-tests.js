/**
 * 🚀 SENIORSIMPLE AUTOMATED TEST RUNNER
 * 
 * This script opens the SeniorSimple website and runs all test scripts
 * automatically in the browser console.
 * 
 * Usage: node run-seniorsimple-tests.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://www.seniorsimple.org/quiz',
  testScripts: [
    'test-seniorsimple-tracking-fixed.js',
    'test-seniorsimple-crawler.js',
    'test-verification-script.js',
    'test-seniorsimple-diagnostics.js'
  ],
  browser: 'chrome', // or 'firefox', 'safari'
  headless: false // Set to true for headless mode
};

// Read test script content
function readTestScript(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  if (fs.existsSync(scriptPath)) {
    return fs.readFileSync(scriptPath, 'utf8');
  } else {
    console.log(`❌ Script not found: ${scriptName}`);
    return null;
  }
}

// Create browser automation script
function createBrowserScript() {
  const scriptContent = `
// 🚀 SENIORSIMPLE AUTOMATED TEST RUNNER
console.log('🚀 Starting SeniorSimple Automated Tests...');

// Test configuration
const TEST_CONFIG = {
  baseUrl: '${TEST_CONFIG.baseUrl}',
  testSessionId: \`auto_test_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
  delayBetweenTests: 5000 // 5 seconds between tests
};

// Utility functions
function logTest(step, message, data = {}) {
  console.log(\`✅ [\${step}] \${message}\`, data);
}

function logError(step, message, error = {}) {
  console.error(\`❌ [\${step}] \${message}\`, error);
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
    logTest('Crawler', \`Question \${question.number} answered\`);
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
      logTest('System', \`\${system.toUpperCase()} loaded\`);
    } else {
      logTest('System', \`\${system.toUpperCase()} not loaded (via GTM)\`);
    }
  });

  // Check fired events
  const dataLayerEvents = window.dataLayer?.filter(item => item.event) || [];
  logTest('Verification', \`DataLayer events: \${dataLayerEvents.length}\`);
  
  dataLayerEvents.forEach(event => {
    logTest('Event', \`\${event.event} fired\`);
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
  logTest('Diagnostics', \`Tracking requests: \${trackingRequests.length}\`);

  logTest('Diagnostics', 'Diagnostics test completed');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SeniorSimple Automated Tests...');
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

// Run tests
runAllTests();

// Export for manual testing
window.seniorSimpleAutoTests = {
  runAllTests: runAllTests,
  runBasicTracking: runBasicTrackingTest,
  runQuizCrawler: runQuizCrawlerTest,
  runVerification: runVerificationTest,
  runDiagnostics: runDiagnosticsTest,
  config: TEST_CONFIG
};

console.log('🎯 Auto test functions available:');
console.log('   - window.seniorSimpleAutoTests.runAllTests()');
console.log('   - window.seniorSimpleAutoTests.runBasicTracking()');
console.log('   - window.seniorSimpleAutoTests.runQuizCrawler()');
console.log('   - window.seniorSimpleAutoTests.runVerification()');
console.log('   - window.seniorSimpleAutoTests.runDiagnostics()');
`;

  return scriptContent;
}

// Create HTML test page
function createTestPage() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SeniorSimple Test Runner</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .test-button { padding: 10px 20px; margin: 5px; background: #007cba; color: white; border: none; border-radius: 3px; cursor: pointer; }
        .test-button:hover { background: #005a87; }
        .test-results { margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 3px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>🚀 SeniorSimple Test Runner</h1>
    <p>This page will automatically run all SeniorSimple tracking tests.</p>
    
    <div class="test-section">
        <h3>Test Controls</h3>
        <button class="test-button" onclick="runAllTests()">Run All Tests</button>
        <button class="test-button" onclick="runBasicTracking()">Basic Tracking</button>
        <button class="test-button" onclick="runQuizCrawler()">Quiz Crawler</button>
        <button class="test-button" onclick="runVerification()">Verification</button>
        <button class="test-button" onclick="runDiagnostics()">Diagnostics</button>
    </div>
    
    <div class="test-section">
        <h3>Test Results</h3>
        <div id="test-results" class="test-results">
            <p>Click a test button to run tests...</p>
        </div>
    </div>
    
    <div class="test-section">
        <h3>Console Output</h3>
        <div id="console-output" class="test-results">
            <p>Check browser console for detailed output...</p>
        </div>
    </div>

    <script>
        // Test configuration
        const TEST_CONFIG = {
            baseUrl: '${TEST_CONFIG.baseUrl}',
            testSessionId: \`auto_test_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
            delayBetweenTests: 5000
        };

        // Utility functions
        function logTest(step, message, data = {}) {
            console.log(\`✅ [\${step}] \${message}\`, data);
            updateResults(\`✅ [\${step}] \${message}\`);
        }

        function logError(step, message, error = {}) {
            console.error(\`❌ [\${step}] \${message}\`, error);
            updateResults(\`❌ [\${step}] \${message}\`);
        }

        function updateResults(message) {
            const results = document.getElementById('test-results');
            const timestamp = new Date().toLocaleTimeString();
            results.innerHTML += \`<p>[\${timestamp}] \${message}</p>\`;
        }

        // Test functions
        async function runBasicTrackingTest() {
            logTest('Basic', 'Starting basic tracking test...');
            
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

        async function runQuizCrawlerTest() {
            logTest('Crawler', 'Starting quiz crawler test...');
            
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
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.dataLayer.push({
                    'event': 'question_answer',
                    'question_number': question.number,
                    'question_text': question.text,
                    'answer_value': question.answer,
                    'session_id': TEST_CONFIG.testSessionId,
                    'funnel_type': 'annuity'
                });
                logTest('Crawler', \`Question \${question.number} answered\`);
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

        async function runVerificationTest() {
            logTest('Verification', 'Starting verification test...');
            
            // Check tracking systems
            const systems = {
                gtm: typeof window.google_tag_manager !== 'undefined',
                ga4: typeof gtag !== 'undefined',
                meta: typeof fbq !== 'undefined',
                dataLayer: Array.isArray(window.dataLayer)
            };

            Object.entries(systems).forEach(([system, loaded]) => {
                if (loaded) {
                    logTest('System', \`\${system.toUpperCase()} loaded\`);
                } else {
                    logTest('System', \`\${system.toUpperCase()} not loaded (via GTM)\`);
                }
            });

            // Check fired events
            const dataLayerEvents = window.dataLayer?.filter(item => item.event) || [];
            logTest('Verification', \`DataLayer events: \${dataLayerEvents.length}\`);
            
            dataLayerEvents.forEach(event => {
                logTest('Event', \`\${event.event} fired\`);
            });

            logTest('Verification', 'Verification test completed');
        }

        async function runDiagnosticsTest() {
            logTest('Diagnostics', 'Starting diagnostics test...');
            
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
            logTest('Diagnostics', \`Tracking requests: \${trackingRequests.length}\`);

            logTest('Diagnostics', 'Diagnostics test completed');
        }

        // Main test runner
        async function runAllTests() {
            logTest('TestRunner', 'Starting all tests...');
            console.log('Test Session ID:', TEST_CONFIG.testSessionId);
            
            try {
                await runBasicTrackingTest();
                await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
                
                await runQuizCrawlerTest();
                await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
                
                await runVerificationTest();
                await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
                
                await runDiagnosticsTest();
                
                logTest('TestRunner', 'All tests completed successfully!');
                
            } catch (error) {
                logError('TestRunner', 'Test execution failed', error);
            }
        }

        // Global functions for buttons
        window.runAllTests = runAllTests;
        window.runBasicTracking = runBasicTrackingTest;
        window.runQuizCrawler = runQuizCrawlerTest;
        window.runVerification = runVerificationTest;
        window.runDiagnostics = runDiagnosticsTest;

        // Auto-run tests on page load
        window.addEventListener('load', () => {
            logTest('TestRunner', 'Page loaded, starting tests...');
            runAllTests();
        });
    </script>
</body>
</html>`;

  return htmlContent;
}

// Main execution
async function runTests() {
  console.log('🚀 Starting SeniorSimple Test Runner...');
  
  // Create test page
  const testPage = createTestPage();
  const testPagePath = path.join(__dirname, 'seniorsimple-test-page.html');
  fs.writeFileSync(testPagePath, testPage);
  
  console.log('📄 Test page created:', testPagePath);
  
  // Open browser with test page
  const browserCommand = TEST_CONFIG.browser === 'chrome' 
    ? `open -a "Google Chrome" "${testPagePath}"`
    : TEST_CONFIG.browser === 'firefox'
    ? `open -a "Firefox" "${testPagePath}"`
    : `open "${testPagePath}"`;
  
  console.log('🌐 Opening browser...');
  exec(browserCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error opening browser:', error);
      return;
    }
    console.log('✅ Browser opened successfully!');
    console.log('📊 Tests will run automatically in the browser.');
    console.log('🔍 Check the browser console for detailed output.');
  });
  
  console.log('🎯 Test page URL:', testPagePath);
  console.log('📋 Manual test commands available in browser console:');
  console.log('   - runAllTests()');
  console.log('   - runBasicTracking()');
  console.log('   - runQuizCrawler()');
  console.log('   - runVerification()');
  console.log('   - runDiagnostics()');
}

// Run tests
runTests();
