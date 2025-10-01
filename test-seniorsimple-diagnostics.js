/**
 * 🔍 SENIORSIMPLE TRACKING DIAGNOSTICS
 * 
 * This script diagnoses tracking issues and provides solutions.
 * 
 * Usage:
 * 1. Open SeniorSimple website
 * 2. Open browser console
 * 3. Paste and run this script
 * 4. Review diagnostic results
 */

console.log('🔍 Starting SeniorSimple Tracking Diagnostics...');

// Diagnostic functions
function diagnoseGTM() {
  console.log('🏷️ Diagnosing GTM...');
  
  // Check GTM script
  const gtmScript = document.querySelector('script[src*="googletagmanager.com"]');
  if (gtmScript) {
    console.log('✅ GTM script found:', gtmScript.src);
  } else {
    console.log('❌ GTM script not found');
    console.log('💡 Solution: Add GTM script to page head');
  }
  
  // Check GTM container
  if (typeof window.google_tag_manager !== 'undefined') {
    console.log('✅ GTM container loaded');
    console.log('   Container count:', window.google_tag_manager.length);
  } else {
    console.log('❌ GTM container not loaded');
    console.log('💡 Solution: Check GTM container ID and script');
  }
  
  // Check dataLayer
  if (Array.isArray(window.dataLayer)) {
    console.log('✅ DataLayer initialized');
    console.log('   DataLayer length:', window.dataLayer.length);
  } else {
    console.log('❌ DataLayer not initialized');
    console.log('💡 Solution: Initialize dataLayer before GTM script');
  }
}

function diagnoseGA4() {
  console.log('📈 Diagnosing GA4...');
  
  // Check gtag function
  if (typeof gtag !== 'undefined') {
    console.log('✅ gtag function available');
  } else {
    console.log('❌ gtag function not found');
    console.log('💡 Solution: GA4 may be loaded via GTM - check GTM Preview mode');
  }
  
  // Check GA4 script
  const ga4Script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (ga4Script) {
    console.log('✅ GA4 script found:', ga4Script.src);
  } else {
    console.log('❌ GA4 script not found');
    console.log('💡 Solution: GA4 may be loaded via GTM');
  }
  
  // Check for GA4 measurement ID
  const ga4Id = document.querySelector('script').textContent.match(/G-[A-Z0-9]+/);
  if (ga4Id) {
    console.log('✅ GA4 Measurement ID found:', ga4Id[0]);
  } else {
    console.log('❌ GA4 Measurement ID not found');
    console.log('💡 Solution: Check GTM configuration for GA4 Measurement ID');
  }
}

function diagnoseMeta() {
  console.log('📱 Diagnosing Meta Pixel...');
  
  // Check fbq function
  if (typeof fbq !== 'undefined') {
    console.log('✅ fbq function available');
  } else {
    console.log('❌ fbq function not found');
    console.log('💡 Solution: Meta Pixel may be loaded via GTM - check GTM Preview mode');
  }
  
  // Check Meta Pixel script
  const metaScript = document.querySelector('script[src*="facebook.com/tr"]');
  if (metaScript) {
    console.log('✅ Meta Pixel script found:', metaScript.src);
  } else {
    console.log('❌ Meta Pixel script not found');
    console.log('💡 Solution: Meta Pixel may be loaded via GTM');
  }
  
  // Check for Meta Pixel ID
  const metaId = document.querySelector('script').textContent.match(/[0-9]{15,16}/);
  if (metaId) {
    console.log('✅ Meta Pixel ID found:', metaId[0]);
  } else {
    console.log('❌ Meta Pixel ID not found');
    console.log('💡 Solution: Check GTM configuration for Meta Pixel ID');
  }
}

function diagnoseCAPI() {
  console.log('🔄 Diagnosing CAPI...');
  
  // Check for CAPI endpoints
  const capiEndpoints = [
    '/api/capi/lead',
    '/api/leads/process-lead',
    '/api/leads/capi',
    '/api/tracking/capi'
  ];
  
  console.log('🔍 Checking CAPI endpoints...');
  capiEndpoints.forEach(endpoint => {
    console.log(`   - ${endpoint}: ${document.querySelector(`script[src*="${endpoint}"]`) ? 'Found' : 'Not found'}`);
  });
  
  console.log('💡 Solution: CAPI endpoints are server-side - check Supabase Edge Functions');
}

function diagnoseEnvironment() {
  console.log('🌍 Diagnosing Environment...');
  
  console.log('Current URL:', window.location.href);
  console.log('User Agent:', navigator.userAgent);
  console.log('Timestamp:', new Date().toISOString());
  
  // Check for environment variables
  const envVars = [
    'NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE',
    'NEXT_PUBLIC_META_PIXEL_ID_SENIORSIMPLE',
    'NEXT_PUBLIC_GTM_CONTAINER_ID_SENIORSIMPLE'
  ];
  
  console.log('🔍 Checking environment variables...');
  envVars.forEach(envVar => {
    const value = process.env?.[envVar] || 'Not available in browser';
    console.log(`   - ${envVar}: ${value}`);
  });
}

function diagnoseNetwork() {
  console.log('🌐 Diagnosing Network...');
  
  // Check for network requests
  const networkRequests = performance.getEntriesByType('resource');
  const trackingRequests = networkRequests.filter(req => 
    req.name.includes('googletagmanager.com') || 
    req.name.includes('facebook.com') ||
    req.name.includes('google-analytics.com')
  );
  
  console.log('📊 Tracking network requests:', trackingRequests.length);
  trackingRequests.forEach(req => {
    console.log(`   - ${req.name}: ${req.responseStatus || 'Success'}`);
  });
}

function generateDiagnosticReport() {
  console.log('📋 Generating Diagnostic Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    gtm: {
      script: !!document.querySelector('script[src*="googletagmanager.com"]'),
      container: typeof window.google_tag_manager !== 'undefined',
      dataLayer: Array.isArray(window.dataLayer)
    },
    ga4: {
      gtag: typeof gtag !== 'undefined',
      script: !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
    },
    meta: {
      fbq: typeof fbq !== 'undefined',
      script: !!document.querySelector('script[src*="facebook.com/tr"]')
    },
    network: performance.getEntriesByType('resource').filter(req => 
      req.name.includes('googletagmanager.com') || 
      req.name.includes('facebook.com') ||
      req.name.includes('google-analytics.com')
    ).length
  };
  
  console.log('📋 Diagnostic Report:', report);
  
  // Save report
  localStorage.setItem('seniorsimple_diagnostic_report', JSON.stringify(report));
  
  return report;
}

// Main diagnostic function
function runDiagnostics() {
  console.log('🔍 Starting SeniorSimple Tracking Diagnostics...');
  
  diagnoseGTM();
  diagnoseGA4();
  diagnoseMeta();
  diagnoseCAPI();
  diagnoseEnvironment();
  diagnoseNetwork();
  
  const report = generateDiagnosticReport();
  
  console.log('✅ Diagnostics completed!');
  console.log('📊 Summary:');
  console.log(`   - GTM: ${report.gtm.container ? '✅' : '❌'}`);
  console.log(`   - GA4: ${report.ga4.gtag ? '✅' : '⚠️ (via GTM)'}`);
  console.log(`   - Meta: ${report.meta.fbq ? '✅' : '⚠️ (via GTM)'}`);
  console.log(`   - Network: ${report.network} tracking requests`);
  
  return report;
}

// Run diagnostics
runDiagnostics();

// Export for manual testing
window.seniorSimpleDiagnostics = {
  runDiagnostics: runDiagnostics,
  diagnoseGTM: diagnoseGTM,
  diagnoseGA4: diagnoseGA4,
  diagnoseMeta: diagnoseMeta,
  diagnoseCAPI: diagnoseCAPI,
  diagnoseEnvironment: diagnoseEnvironment,
  diagnoseNetwork: diagnoseNetwork,
  generateReport: generateDiagnosticReport
};

console.log('🎯 Diagnostic functions available:');
console.log('   - window.seniorSimpleDiagnostics.runDiagnostics()');
console.log('   - window.seniorSimpleDiagnostics.diagnoseGTM()');
console.log('   - window.seniorSimpleDiagnostics.diagnoseGA4()');
console.log('   - window.seniorSimpleDiagnostics.diagnoseMeta()');
console.log('   - window.seniorSimpleDiagnostics.diagnoseCAPI()');
console.log('   - window.seniorSimpleDiagnostics.diagnoseEnvironment()');
console.log('   - window.seniorSimpleDiagnostics.diagnoseNetwork()');
console.log('   - window.seniorSimpleDiagnostics.generateReport()');
