// Test script to verify lead form submission tracking
console.log('🧪 Testing Lead Form Submission Tracking...');

// Test the dataLayer push
if (typeof window !== 'undefined' && window.dataLayer) {
  console.log('✅ DataLayer is available');
  
  // Push a test lead_form_submit event
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
    lead_score: 75
  });
  
  console.log('✅ Test lead_form_submit event pushed to dataLayer');
  console.log('📊 Current dataLayer:', window.dataLayer);
} else {
  console.log('❌ DataLayer not available');
}

// Test gtag function
if (typeof window !== 'undefined' && window.gtag) {
  console.log('✅ gtag function is available');
  
  // Send test GA4 event
  window.gtag('event', 'lead_form_submit', {
    event_category: 'lead_generation',
    event_label: 'seniorsimple_lead',
    value: 1,
    lead_source: 'seniorsimple_platform',
    funnel_type: 'annuity',
    lead_score: 75,
    session_id: 'test_session_123'
  });
  
  console.log('✅ Test GA4 lead_form_submit event sent');
} else {
  console.log('❌ gtag function not available');
}

// Test fbq function
if (typeof window !== 'undefined' && window.fbq) {
  console.log('✅ fbq function is available');
  
  // Send test Meta Lead event
  window.fbq('track', 'Lead', {
    content_name: 'SeniorSimple annuity Lead',
    content_category: 'lead_generation',
    value: 75,
    currency: 'USD'
  });
  
  console.log('✅ Test Meta Lead event sent');
} else {
  console.log('❌ fbq function not available');
}

console.log('🎯 Test complete! Check GTM Preview mode and browser console for events.');
