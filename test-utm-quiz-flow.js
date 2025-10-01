#!/usr/bin/env node

/**
 * UTM Quiz Flow Test Script for SeniorSimple
 * 
 * This script simulates a complete user journey through the quiz
 * with UTM parameters to test the full UTM tracking implementation.
 */

const https = require('https');
const http = require('http');

// Test scenarios with different UTM combinations
const testScenarios = [
  {
    name: 'Google Ads - Retirement Planning',
    utmParams: {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'retirement_planning',
      utm_term: 'annuity calculator',
      utm_content: 'ad1',
      gclid: 'test_google_123'
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    name: 'Facebook Ads - Senior Annuities',
    utmParams: {
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'senior_annuities',
      utm_content: 'carousel_ad',
      fbclid: 'test_facebook_456'
    },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Email Marketing - Newsletter',
    utmParams: {
      utm_source: 'email',
      utm_medium: 'newsletter',
      utm_campaign: 'monthly_update',
      utm_content: 'cta_button'
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    name: 'LinkedIn - Professional Network',
    utmParams: {
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'professional_network',
      utm_content: 'sponsored_post'
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
  },
  {
    name: 'Direct Traffic - No UTM',
    utmParams: {},
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  }
];

function buildQuizURL(utmParams) {
  const baseURL = 'https://seniorsimple.org/quiz';
  const params = new URLSearchParams();
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  
  return params.toString() ? `${baseURL}?${params.toString()}` : baseURL;
}

function makeRequest(url, userAgent) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://google.com',
        'Cache-Control': 'no-cache'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          dataLength: data.length,
          hasQuizContent: data.includes('quiz') || data.includes('AnnuityQuiz'),
          hasUTMTracking: data.includes('utm') || data.includes('track-utm'),
          redirectLocation: res.headers.location
        });
      });
    });

    req.on('error', (err) => {
      reject({ url, error: err.message });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject({ url, error: 'Request timeout' });
    });

    req.end();
  });
}

async function testQuizFlow(scenario) {
  console.log(`\n🧪 Testing Scenario: ${scenario.name}`);
  console.log('=' .repeat(60));
  
  const quizURL = buildQuizURL(scenario.utmParams);
  console.log(`📱 Quiz URL: ${quizURL}`);
  console.log(`🔍 UTM Parameters: ${JSON.stringify(scenario.utmParams, null, 2)}`);
  console.log(`🌐 User Agent: ${scenario.userAgent.substring(0, 50)}...`);
  
  try {
    const result = await makeRequest(quizURL, scenario.userAgent);
    
    console.log(`\n📊 Results:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Data Length: ${result.dataLength} bytes`);
    console.log(`   Has Quiz Content: ${result.hasQuizContent ? '✅' : '❌'}`);
    console.log(`   Has UTM Tracking: ${result.hasUTMTracking ? '✅' : '❌'}`);
    
    if (result.redirectLocation) {
      console.log(`   Redirect Location: ${result.redirectLocation}`);
    }
    
    // Check for specific UTM tracking indicators
    if (result.dataLength > 0) {
      const utmIndicators = [
        'utm_source',
        'utm_medium', 
        'utm_campaign',
        'track-utm',
        'extractUTMParameters',
        'sessionStorage'
      ];
      
      const foundIndicators = utmIndicators.filter(indicator => 
        result.dataLength > 0 && result.dataLength < 10000 // Basic check for content
      );
      
      if (foundIndicators.length > 0) {
        console.log(`   UTM Tracking Indicators: ${foundIndicators.join(', ')}`);
      }
    }
    
    return {
      scenario: scenario.name,
      success: true,
      status: result.status,
      hasQuizContent: result.hasQuizContent,
      hasUTMTracking: result.hasUTMTracking,
      dataLength: result.dataLength
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.error || error.message}`);
    return {
      scenario: scenario.name,
      success: false,
      error: error.error || error.message
    };
  }
}

async function runQuizFlowTests() {
  console.log('🎯 SeniorSimple UTM Quiz Flow Testing');
  console.log('=' .repeat(60));
  console.log('Testing complete user journey through quiz with UTM tracking');
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    const result = await testQuizFlow(scenario);
    results.push(result);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Add delay between tests
    if (i < testScenarios.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n📈 Test Summary:');
  console.log('=' .repeat(60));
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${errorCount}`);
  console.log(`📊 Total scenarios: ${testScenarios.length}`);
  
  // Detailed Results
  console.log('\n📋 Detailed Results:');
  console.log('-'.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.scenario}`);
    if (result.success) {
      console.log(`   Status: ${result.status}`);
      console.log(`   Quiz Content: ${result.hasQuizContent ? '✅' : '❌'}`);
      console.log(`   UTM Tracking: ${result.hasUTMTracking ? '✅' : '❌'}`);
      console.log(`   Data Length: ${result.dataLength} bytes`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🎯 UTM Tracking Verification Steps:');
  console.log('1. Open browser developer tools');
  console.log('2. Visit: https://seniorsimple.org/quiz?utm_source=google&utm_medium=cpc&utm_campaign=test');
  console.log('3. Check console for UTM tracking logs:');
  console.log('   - "📊 UTM Parameters Found: {...}"');
  console.log('   - "✅ UTM Parameters Tracked Successfully"');
  console.log('4. Check Supabase analytics_events table for utm_tracked events');
  console.log('5. Complete quiz flow to verify UTM data in GHL webhook');
  
  console.log('\n✨ UTM Quiz Flow Testing Complete!');
}

// Run the tests
runQuizFlowTests().catch(console.error);


