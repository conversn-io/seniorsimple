// Comprehensive GTM Debug Test for Lead Form Submission
console.log('🔍 GTM Debug Test for Lead Form Submission...');

// Check if we're in GTM Preview mode
const isGTMPreview = window.location.search.includes('gtm_preview') || 
                     window.location.search.includes('gtm_debug') ||
                     document.querySelector('[data-gtm-preview]');

console.log('📊 GTM Preview Mode:', isGTMPreview ? '✅ Active' : '❌ Not Active');

// Check GTM container
if (typeof window !== 'undefined' && window.google_tag_manager) {
  console.log('✅ GTM Container loaded');
  console.log('📦 GTM Container ID:', window.google_tag_manager[Object.keys(window.google_tag_manager)[0]]?.containerId);
} else {
  console.log('❌ GTM Container not found');
}

// Check DataLayer
if (typeof window !== 'undefined' && window.dataLayer) {
  console.log('✅ DataLayer available');
  console.log('📊 DataLayer length:', window.dataLayer.length);
  console.log('📊 Last 3 DataLayer events:', window.dataLayer.slice(-3));
} else {
  console.log('❌ DataLayer not available');
}

// Check for GTM variables
console.log('🔍 Checking GTM Variables...');
if (typeof window !== 'undefined' && window.google_tag_manager) {
  const container = window.google_tag_manager[Object.keys(window.google_tag_manager)[0]];
  if (container && container.macros) {
    console.log('📊 Available GTM Macros:', Object.keys(container.macros));
  }
}

// Test the exact event structure that GTM expects
console.log('🧪 Testing GTM Event Structure...');

if (typeof window !== 'undefined' && window.dataLayer) {
  // Push the exact event structure that matches the GTM trigger
  window.dataLayer.push({
    event: 'lead_form_submit',
    lead_data: {
      firstName: 'Test',
      lastName: 'User', 
      email: 'test@example.com',
      phoneNumber: '555-1234',
      zipCode: '12345',
      state: 'CA',
      sessionId: 'test_session_123',
      funnelType: 'annuity',
      leadScore: 75
    },
    lead_source: 'seniorsimple_platform',
    funnel_type: 'annuity',
    session_id: 'test_session_123',
    lead_score: 75,
    event_category: 'lead_generation',
    event_label: 'seniorsimple_lead',
    value: 1
  });
  
  console.log('✅ Test lead_form_submit event pushed with complete structure');
  console.log('📊 Updated DataLayer:', window.dataLayer.slice(-1));
} else {
  console.log('❌ Cannot push to DataLayer');
}

// Check if GA4 is loaded through GTM
setTimeout(() => {
  console.log('🔍 Checking GA4 Status...');
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ gtag function available (loaded via GTM)');
  } else {
    console.log('❌ gtag function not available');
  }
  
  // Check if Meta Pixel is loaded through GTM
  console.log('🔍 Checking Meta Pixel Status...');
  if (typeof window !== 'undefined' && window.fbq) {
    console.log('✅ fbq function available (loaded via GTM)');
  } else {
    console.log('❌ fbq function not available');
  }
}, 1000);

console.log('🎯 Debug test complete! Check GTM Preview mode for tag firing.');
console.log('💡 If tags aren\'t firing, check:');
console.log('   1. GTM Preview mode is active');
console.log('   2. Trigger 29 (Lead Form Submit) is configured correctly');
console.log('   3. Tags are using the correct trigger');
console.log('   4. Variables are populated correctly');
