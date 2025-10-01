#!/usr/bin/env node

/**
 * UTM Tracking Test Script for SeniorSimple
 * 
 * This script generates test traffic with various UTM parameters
 * to verify the UTM tracking implementation is working correctly.
 */

const https = require('https');
const http = require('http');

// Test URLs with different UTM parameters
const testUrls = [
  // Google Ads traffic
  'https://seniorsimple.org/quiz?utm_source=google&utm_medium=cpc&utm_campaign=annuity_retirement&utm_term=retirement+planning&utm_content=ad1&gclid=test123',
  
  // Facebook Ads traffic
  'https://seniorsimple.org/quiz?utm_source=facebook&utm_medium=cpc&utm_campaign=senior_annuities&utm_content=carousel_ad&fbclid=test456',
  
  // Email marketing
  'https://seniorsimple.org/quiz?utm_source=email&utm_medium=newsletter&utm_campaign=monthly_update&utm_content=cta_button',
  
  // Organic search
  'https://seniorsimple.org/quiz?utm_source=google&utm_medium=organic&utm_campaign=seo&utm_term=annuity+calculator',
  
  // Social media
  'https://seniorsimple.org/quiz?utm_source=linkedin&utm_medium=social&utm_campaign=professional_network&utm_content=sponsored_post',
  
  // Direct traffic (no UTM)
  'https://seniorsimple.org/quiz',
  
  // Microsoft Ads
  'https://seniorsimple.org/quiz?utm_source=microsoft&utm_medium=cpc&utm_campaign=bing_ads&utm_term=retirement+income&msclkid=test789',
  
  // YouTube traffic
  'https://seniorsimple.org/quiz?utm_source=youtube&utm_medium=video&utm_campaign=retirement_education&utm_content=video_description'
];

// Additional pages to test
const additionalPages = [
  'https://seniorsimple.org/',
  'https://seniorsimple.org/calculators',
  'https://seniorsimple.org/resources',
  'https://seniorsimple.org/tools'
];

function makeRequest(url, userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36') {
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
        'Referer': 'https://google.com'
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
          utmParams: extractUTMParams(url)
        });
      });
    });

    req.on('error', (err) => {
      reject({ url, error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({ url, error: 'Request timeout' });
    });

    req.end();
  });
}

function extractUTMParams(url) {
  const urlObj = new URL(url);
  const params = {};
  
  for (const [key, value] of urlObj.searchParams.entries()) {
    if (key.startsWith('utm_') || key === 'gclid' || key === 'fbclid' || key === 'msclkid') {
      params[key] = value;
    }
  }
  
  return params;
}

async function runUTMTests() {
  console.log('🧪 Starting UTM Tracking Tests for SeniorSimple');
  console.log('=' .repeat(60));
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Test main quiz page with UTM parameters
  console.log('\n📊 Testing Quiz Page with UTM Parameters:');
  console.log('-'.repeat(50));
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    const utmParams = extractUTMParams(url);
    
    console.log(`\n${i + 1}. Testing: ${url}`);
    console.log(`   UTM Parameters: ${Object.keys(utmParams).length > 0 ? JSON.stringify(utmParams, null, 2) : 'None'}`);
    
    try {
      const result = await makeRequest(url);
      results.push(result);
      successCount++;
      
      console.log(`   ✅ Status: ${result.status} | Data Length: ${result.dataLength} bytes`);
      
      // Add delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.error || error.message}`);
      errorCount++;
      results.push({ url, error: error.error || error.message });
    }
  }
  
  // Test additional pages
  console.log('\n📄 Testing Additional Pages:');
  console.log('-'.repeat(50));
  
  for (let i = 0; i < additionalPages.length; i++) {
    const url = additionalPages[i];
    
    console.log(`\n${i + 1}. Testing: ${url}`);
    
    try {
      const result = await makeRequest(url);
      results.push(result);
      successCount++;
      
      console.log(`   ✅ Status: ${result.status} | Data Length: ${result.dataLength} bytes`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.error || error.message}`);
      errorCount++;
      results.push({ url, error: error.error || error.message });
    }
  }
  
  // Summary
  console.log('\n📈 Test Summary:');
  console.log('=' .repeat(60));
  console.log(`✅ Successful requests: ${successCount}`);
  console.log(`❌ Failed requests: ${errorCount}`);
  console.log(`📊 Total requests: ${successCount + errorCount}`);
  
  // UTM Parameter Analysis
  console.log('\n🔍 UTM Parameter Analysis:');
  console.log('-'.repeat(50));
  
  const utmSources = new Set();
  const utmMediums = new Set();
  const utmCampaigns = new Set();
  
  testUrls.forEach(url => {
    const utmParams = extractUTMParams(url);
    if (utmParams.utm_source) utmSources.add(utmParams.utm_source);
    if (utmParams.utm_medium) utmMediums.add(utmParams.utm_medium);
    if (utmParams.utm_campaign) utmCampaigns.add(utmParams.utm_campaign);
  });
  
  console.log(`📊 UTM Sources tested: ${Array.from(utmSources).join(', ')}`);
  console.log(`📊 UTM Mediums tested: ${Array.from(utmMediums).join(', ')}`);
  console.log(`📊 UTM Campaigns tested: ${Array.from(utmCampaigns).join(', ')}`);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Check browser console logs for UTM tracking messages');
  console.log('2. Verify Supabase analytics_events table for utm_tracked events');
  console.log('3. Test quiz completion flow with UTM parameters');
  console.log('4. Verify UTM data in GHL webhook payloads');
  
  console.log('\n✨ UTM Tracking Test Complete!');
}

// Run the tests
runUTMTests().catch(console.error);


