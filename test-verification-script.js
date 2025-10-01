/**
 * 🔍 SENIORSIMPLE TRACKING VERIFICATION SCRIPT
 * 
 * This script verifies that all tracking systems are working correctly
 * by checking GA4, Meta, GTM, and CAPI events.
 * 
 * Usage:
 * 1. Run after completing the quiz crawler
 * 2. Open browser console
 * 3. Paste and run this script
 * 4. Review verification results
 */

console.log('🔍 Starting SeniorSimple Tracking Verification...');

// Verification configuration
const VERIFICATION_CONFIG = {
  testSessionId: window.testSeniorSimpleTracking?.config?.testSessionId || 
                 window.seniorSimpleCrawler?.config?.testSessionId || 
                 'unknown',
  expectedEvents: [
    'quiz_start',
    'question_answer',
    'quiz_complete',
    'lead_form_submit',
    'page_view'
  ],
  expectedMetaEvents: [
    'PageView',
    'Lead'
  ]
};

// Track events that have been fired
const firedEvents = {
  dataLayer: [],
  ga4: [],
  meta: [],
  capi: []
};

// Monitor dataLayer events
function monitorDataLayer() {
  const originalPush = window.dataLayer?.push;
  if (window.dataLayer) {
    window.dataLayer.push = function(...args) {
      const result = originalPush.apply(this, args);
      if (args[0] && args[0].event) {
        firedEvents.dataLayer.push({
          event: args[0].event,
          timestamp: new Date().toISOString(),
          data: args[0]
        });
        console.log('📊 DataLayer Event:', args[0].event, args[0]);
      }
      return result;
    };
  }
}

// Monitor GA4 events
function monitorGA4() {
  if (typeof gtag !== 'undefined') {
    const originalGtag = window.gtag;
    window.gtag = function(...args) {
      const result = originalGtag.apply(this, args);
      if (args[0] === 'event') {
        firedEvents.ga4.push({
          event: args[1],
          timestamp: new Date().toISOString(),
          parameters: args[2] || {}
        });
        console.log('📈 GA4 Event:', args[1], args[2]);
      }
      return result;
    };
  }
}

// Monitor Meta events
function monitorMeta() {
  if (typeof fbq !== 'undefined') {
    const originalFbq = window.fbq;
    window.fbq = function(...args) {
      const result = originalFbq.apply(this, args);
      if (args[0] === 'track') {
        firedEvents.meta.push({
          event: args[1],
          timestamp: new Date().toISOString(),
          parameters: args[2] || {}
        });
        console.log('📱 Meta Event:', args[1], args[2]);
      }
      return result;
    };
  }
}

// Check GTM container
function checkGTMContainer() {
  console.log('🏷️ Checking GTM Container...');
  
  if (typeof window.google_tag_manager !== 'undefined') {
    const gtmContainer = window.google_tag_manager[window.google_tag_manager.length - 1];
    console.log('✅ GTM Container loaded:', gtmContainer);
    
    // Check if GTM is in preview mode
    if (window.google_tag_manager && window.google_tag_manager.length > 0) {
      console.log('✅ GTM is active');
    } else {
      console.log('❌ GTM may not be loaded');
    }
  } else {
    console.log('❌ GTM not found');
  }
}

// Check GA4 configuration
function checkGA4Config() {
  console.log('📈 Checking GA4 Configuration...');
  
  if (typeof gtag !== 'undefined') {
    console.log('✅ gtag function available');
    
    // Check if GA4 is sending events
    if (window.gtag) {
      console.log('✅ GA4 gtag function loaded');
    } else {
      console.log('❌ GA4 gtag function not found');
    }
  } else {
    console.log('❌ GA4 not loaded');
  }
}

// Check Meta Pixel
function checkMetaPixel() {
  console.log('📱 Checking Meta Pixel...');
  
  if (typeof fbq !== 'undefined') {
    console.log('✅ Meta Pixel fbq function available');
    
    // Check if Meta Pixel is loaded
    if (window.fbq) {
      console.log('✅ Meta Pixel loaded');
    } else {
      console.log('❌ Meta Pixel not found');
    }
  } else {
    console.log('❌ Meta Pixel not loaded');
  }
}

// Verify fired events
function verifyFiredEvents() {
  console.log('🔍 Verifying Fired Events...');
  
  // Check DataLayer events
  console.log('📊 DataLayer Events:', firedEvents.dataLayer.length);
  firedEvents.dataLayer.forEach(event => {
    console.log(`  ✅ ${event.event} at ${event.timestamp}`);
  });
  
  // Check GA4 events
  console.log('📈 GA4 Events:', firedEvents.ga4.length);
  firedEvents.ga4.forEach(event => {
    console.log(`  ✅ ${event.event} at ${event.timestamp}`);
  });
  
  // Check Meta events
  console.log('📱 Meta Events:', firedEvents.meta.length);
  firedEvents.meta.forEach(event => {
    console.log(`  ✅ ${event.event} at ${event.timestamp}`);
  });
  
  // Check CAPI events (these would be server-side)
  console.log('🔄 CAPI Events: Check server logs for CAPI events');
}

// Check for missing events
function checkMissingEvents() {
  console.log('🔍 Checking for Missing Events...');
  
  const firedDataLayerEvents = firedEvents.dataLayer.map(e => e.event);
  const firedGA4Events = firedEvents.ga4.map(e => e.event);
  const firedMetaEvents = firedEvents.meta.map(e => e.event);
  
  const missingDataLayer = VERIFICATION_CONFIG.expectedEvents.filter(
    event => !firedDataLayerEvents.includes(event)
  );
  
  const missingGA4 = VERIFICATION_CONFIG.expectedEvents.filter(
    event => !firedGA4Events.includes(event)
  );
  
  const missingMeta = VERIFICATION_CONFIG.expectedMetaEvents.filter(
    event => !firedMetaEvents.includes(event)
  );
  
  if (missingDataLayer.length > 0) {
    console.log('❌ Missing DataLayer Events:', missingDataLayer);
  } else {
    console.log('✅ All expected DataLayer events fired');
  }
  
  if (missingGA4.length > 0) {
    console.log('❌ Missing GA4 Events:', missingGA4);
  } else {
    console.log('✅ All expected GA4 events fired');
  }
  
  if (missingMeta.length > 0) {
    console.log('❌ Missing Meta Events:', missingMeta);
  } else {
    console.log('✅ All expected Meta events fired');
  }
}

// Generate verification report
function generateVerificationReport() {
  console.log('📋 Generating Verification Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    testSessionId: VERIFICATION_CONFIG.testSessionId,
    url: window.location.href,
    userAgent: navigator.userAgent,
    gtmLoaded: typeof window.google_tag_manager !== 'undefined',
    ga4Loaded: typeof gtag !== 'undefined',
    metaLoaded: typeof fbq !== 'undefined',
    dataLayerEvents: firedEvents.dataLayer.length,
    ga4Events: firedEvents.ga4.length,
    metaEvents: firedEvents.meta.length,
    events: {
      dataLayer: firedEvents.dataLayer,
      ga4: firedEvents.ga4,
      meta: firedEvents.meta
    }
  };
  
  console.log('📋 Verification Report:', report);
  
  // Save report to localStorage for later reference
  localStorage.setItem('seniorsimple_verification_report', JSON.stringify(report));
  
  return report;
}

// Main verification function
function runVerification() {
  console.log('🔍 Starting SeniorSimple Tracking Verification...');
  
  // Set up monitoring
  monitorDataLayer();
  monitorGA4();
  monitorMeta();
  
  // Check configurations
  checkGTMContainer();
  checkGA4Config();
  checkMetaPixel();
  
  // Wait a moment for events to be captured
  setTimeout(() => {
    verifyFiredEvents();
    checkMissingEvents();
    generateVerificationReport();
    
    console.log('✅ Verification completed!');
    console.log('📊 Check the following for detailed verification:');
    console.log('   - GA4 Real-time reports');
    console.log('   - Meta Events Manager');
    console.log('   - GTM Preview mode');
    console.log('   - Browser console for errors');
  }, 2000);
}

// Run verification
runVerification();

// Export for manual testing
window.seniorSimpleVerification = {
  runVerification: runVerification,
  checkGTM: checkGTMContainer,
  checkGA4: checkGA4Config,
  checkMeta: checkMetaPixel,
  verifyEvents: verifyFiredEvents,
  checkMissing: checkMissingEvents,
  generateReport: generateVerificationReport,
  firedEvents: firedEvents,
  config: VERIFICATION_CONFIG
};

console.log('🎯 Verification functions available:');
console.log('   - window.seniorSimpleVerification.runVerification()');
console.log('   - window.seniorSimpleVerification.checkGTM()');
console.log('   - window.seniorSimpleVerification.checkGA4()');
console.log('   - window.seniorSimpleVerification.checkMeta()');
console.log('   - window.seniorSimpleVerification.verifyEvents()');
console.log('   - window.seniorSimpleVerification.checkMissing()');
console.log('   - window.seniorSimpleVerification.generateReport()');
