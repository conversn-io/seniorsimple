// Test GTM Trigger Configuration for Lead Form Submit
console.log('🎯 Testing GTM Trigger Configuration...');

// Test 1: Standard DataLayer push (what we're currently doing)
console.log('📝 Test 1: Standard DataLayer push');
if (typeof window !== 'undefined' && window.dataLayer) {
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
  console.log('✅ Standard DataLayer push completed');
}

// Test 2: Alternative structure that might match GTM trigger expectations
console.log('📝 Test 2: Alternative DataLayer structure');
if (typeof window !== 'undefined' && window.dataLayer) {
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'lead_form_submit',
    lead_form_submit: true, // Explicit flag
    lead_data: {
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@example.com',
      phoneNumber: '555-1235',
      zipCode: '12346',
      state: 'NY',
      sessionId: 'test_session_456',
      funnelType: 'annuity',
      leadScore: 80
    },
    lead_source: 'seniorsimple_platform',
    funnel_type: 'annuity',
    session_id: 'test_session_456',
    lead_score: 80
  });
  console.log('✅ Alternative DataLayer push completed');
}

// Test 3: Check what GTM variables are available
console.log('📊 Checking GTM Variables...');
if (typeof window !== 'undefined' && window.google_tag_manager) {
  const containerId = Object.keys(window.google_tag_manager)[0];
  const container = window.google_tag_manager[containerId];
  
  if (container) {
    console.log('📦 Container ID:', containerId);
    console.log('📊 Container macros:', Object.keys(container.macros || {}));
    console.log('📊 Container variables:', Object.keys(container.variables || {}));
  }
}

// Test 4: Check if we can access the _event variable
console.log('🔍 Checking _event variable...');
if (typeof window !== 'undefined' && window.google_tag_manager) {
  const containerId = Object.keys(window.google_tag_manager)[0];
  const container = window.google_tag_manager[containerId];
  
  if (container && container.macros) {
    const eventMacro = container.macros['_event'];
    if (eventMacro) {
      console.log('✅ _event macro found:', eventMacro);
    } else {
      console.log('❌ _event macro not found');
    }
  }
}

console.log('🎯 Trigger test complete!');
console.log('💡 If tags still don\'t fire, the issue might be:');
console.log('   1. GTM trigger configuration mismatch');
console.log('   2. Variables not populating correctly');
console.log('   3. Tag configuration issues');
console.log('   4. GTM Preview mode not detecting the events');
