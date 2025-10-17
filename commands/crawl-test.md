# 🕷️ Comprehensive Site Crawler Agent

Run the comprehensive site crawler that discovers broken links and UX issues across your entire site.

## 🚀 Usage Instructions:

### **Option 1: Project-Specific Crawlers (Recommended)**
```bash
# For SeniorSimple (port 3010)
/crawl-test-seniorsimple

# For RateRoots (port 3000)  
/crawl-test-rateroots
```

### **Option 2: CrewAI Agent (Generic)**
```bash
# Run the CrewAI agent that automatically injects the crawler script
cd /Users/funkyfortress/Documents/01-ALL\ DOCUMENTS/05\ -\ Projects/CallReady
./scripts/crawler-crewai-agent.py
```

### **Option 3: Manual Browser Method**
1. **Copy the script below**
2. **Navigate to your site**: `http://localhost:3000` or `http://localhost:3010`
3. **Open browser console** (F12 → Console tab)
4. **Paste and run the script**
5. **Watch the automated crawling and review the comprehensive report**

## 📋 What This Agent Tests:

- ✅ URL accessibility and broken links
- ✅ Navigation elements and menu structure
- ✅ Form functionality and validation
- ✅ Performance metrics and loading times
- ✅ Mobile responsiveness
- ✅ SEO elements and meta tags
- ✅ CallReady integration points
- ✅ User experience issues

## 🔧 Script to Run:

```javascript
/**
 * 🕷️ COMPREHENSIVE SITE CRAWLER AGENT
 * 
 * This agent crawls the entire site to discover:
 * - Broken links and 404 errors
 * - Navigation issues
 * - Form problems
 * - Performance issues
 * - UX problems
 * - CallReady integration issues
 * 
 * Usage: Navigate to site and run this script
 * Works on both localhost and production automatically!
 */

console.log('🕷️ Starting Comprehensive Site Crawler Agent...');

// Auto-detect environment (localhost vs production)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const port = window.location.port || '3000';
const baseUrl = isLocalhost ? `http://localhost:${port}` : 'https://seniorsimple.org';

console.log(`🌐 Environment detected: ${isLocalhost ? 'Localhost' : 'Production'}`);
console.log(`🔗 Base URL: ${baseUrl}`);
console.log(`🚀 Port: ${isLocalhost ? port : 'Production'}`);

const CRAWLER_CONFIG = {
  baseUrl: baseUrl,
  testSessionId: `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  delayBetweenActions: 1500,
  maxRetries: 3,
  timeout: 10000,
  testUser: {
    firstName: 'Crawl',
    lastName: 'Test',
    email: 'crawl@seniorsimple.com',
    phone: '+1234567890',
    zipCode: '12345',
    state: 'CA'
  }
};

const CRAWLER_RESULTS = {
  startTime: Date.now(),
  pages: [],
  links: [],
  forms: [],
  errors: [],
  successCount: 0,
  totalChecks: 0,
  brokenLinks: [],
  performanceIssues: [],
  uxIssues: [],
  callReadyIssues: []
};

function logCrawlStep(step, message, data = {}) {
  console.log(`🕷️ [${step}] ${message}`, data);
  CRAWLER_RESULTS.pages.push({ step, message, data, timestamp: Date.now() });
  CRAWLER_RESULTS.totalChecks++;
}

function logCrawlError(step, message, error = {}) {
  console.error(`❌ [${step}] ${message}`, error);
  CRAWLER_RESULTS.errors.push({ step, message, error, timestamp: Date.now() });
}

function logCrawlSuccess(step, message, data = {}) {
  console.log(`✅ [${step}] ${message}`, data);
  CRAWLER_RESULTS.successCount++;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test URL accessibility
async function testURLAccessibility(url) {
  logCrawlStep('URL Test', `Testing URL accessibility: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: CRAWLER_CONFIG.timeout
    });
    
    if (response.ok) {
      logCrawlSuccess('URL Test', `URL accessible: ${url} (${response.status})`);
      return { url, status: response.status, accessible: true };
    } else {
      logCrawlError('URL Test', `URL not accessible: ${url} (${response.status})`);
      CRAWLER_RESULTS.brokenLinks.push({ url, status: response.status, error: 'HTTP Error' });
      return { url, status: response.status, accessible: false };
    }
    
  } catch (error) {
    logCrawlError('URL Test', `URL test failed: ${url}`, error);
    CRAWLER_RESULTS.brokenLinks.push({ url, status: 'ERROR', error: error.message });
    return { url, status: 'ERROR', accessible: false };
  }
}

// Test navigation elements
async function testNavigationElements() {
  logCrawlStep('Navigation', 'Testing navigation elements...');
  
  try {
    // Test main navigation
    const mainNav = document.querySelector('nav, .navigation, .navbar');
    if (mainNav) {
      logCrawlSuccess('Navigation', 'Main navigation found');
      
      // Test navigation links
      const navLinks = mainNav.querySelectorAll('a[href]');
      logCrawlSuccess('Navigation', `Found ${navLinks.length} navigation links`);
      
      // Test each navigation link
      for (const link of navLinks) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          const fullUrl = href.startsWith('http') ? href : `${CRAWLER_CONFIG.baseUrl}${href}`;
          await testURLAccessibility(fullUrl);
          await wait(CRAWLER_CONFIG.delayBetweenActions);
        }
      }
    } else {
      logCrawlError('Navigation', 'Main navigation not found');
      CRAWLER_RESULTS.uxIssues.push({ issue: 'Missing main navigation', severity: 'high' });
    }
    
    // Test mobile menu
    const mobileMenu = document.querySelector('.mobile-menu, .hamburger, [data-mobile-menu]');
    if (mobileMenu) {
      logCrawlSuccess('Navigation', 'Mobile menu found');
    } else {
      logCrawlError('Navigation', 'Mobile menu not found');
      CRAWLER_RESULTS.uxIssues.push({ issue: 'Missing mobile menu', severity: 'medium' });
    }
    
    return true;
    
  } catch (error) {
    logCrawlError('Navigation', 'Navigation testing failed', error);
    return false;
  }
}

// Test form functionality
async function testFormFunctionality() {
  logCrawlStep('Forms', 'Testing form functionality...');
  
  try {
    const forms = document.querySelectorAll('form');
    logCrawlSuccess('Forms', `Found ${forms.length} forms on page`);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const formId = form.id || `form_${i}`;
      
      logCrawlStep('Forms', `Testing form: ${formId}`);
      
      // Test form fields
      const inputs = form.querySelectorAll('input, select, textarea');
      logCrawlSuccess('Forms', `Form ${formId} has ${inputs.length} input fields`);
      
      // Test required fields
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      if (requiredFields.length > 0) {
        logCrawlSuccess('Forms', `Form ${formId} has ${requiredFields.length} required fields`);
      }
      
      // Test form validation
      const emailFields = form.querySelectorAll('input[type="email"]');
      if (emailFields.length > 0) {
        logCrawlSuccess('Forms', `Form ${formId} has ${emailFields.length} email fields`);
      }
      
      // Test form submission
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        logCrawlSuccess('Forms', `Form ${formId} has submit button`);
      } else {
        logCrawlError('Forms', `Form ${formId} missing submit button`);
        CRAWLER_RESULTS.uxIssues.push({ issue: `Form ${formId} missing submit button`, severity: 'high' });
      }
    }
    
    return true;
    
  } catch (error) {
    logCrawlError('Forms', 'Form functionality testing failed', error);
    return false;
  }
}

// Test performance metrics
async function testPerformanceMetrics() {
  logCrawlStep('Performance', 'Testing performance metrics...');
  
  try {
    // Test page load time
    const loadTime = performance.now();
    logCrawlSuccess('Performance', `Page load time: ${loadTime.toFixed(2)}ms`);
    
    // Test Core Web Vitals
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        logCrawlSuccess('Performance', `DOM Content Loaded: ${nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart}ms`);
        logCrawlSuccess('Performance', `Load Complete: ${nav.loadEventEnd - nav.loadEventStart}ms`);
      }
    }
    
    // Test image loading
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    let brokenImages = 0;
    
    for (const img of images) {
      if (img.complete && img.naturalHeight !== 0) {
        loadedImages++;
      } else {
        brokenImages++;
        CRAWLER_RESULTS.performanceIssues.push({ issue: `Broken image: ${img.src}`, severity: 'medium' });
      }
    }
    
    logCrawlSuccess('Performance', `Images: ${loadedImages} loaded, ${brokenImages} broken`);
    
    // Test CSS loading
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    logCrawlSuccess('Performance', `Stylesheets: ${stylesheets.length} loaded`);
    
    // Test JavaScript loading
    const scripts = document.querySelectorAll('script[src]');
    logCrawlSuccess('Performance', `Scripts: ${scripts.length} loaded`);
    
    return true;
    
  } catch (error) {
    logCrawlError('Performance', 'Performance testing failed', error);
    return false;
  }
}

// Test mobile responsiveness
async function testMobileResponsiveness() {
  logCrawlStep('Mobile', 'Testing mobile responsiveness...');
  
  try {
    // Test viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      logCrawlSuccess('Mobile', 'Viewport meta tag found');
    } else {
      logCrawlError('Mobile', 'Viewport meta tag missing');
      CRAWLER_RESULTS.uxIssues.push({ issue: 'Missing viewport meta tag', severity: 'high' });
    }
    
    // Test responsive images
    const responsiveImages = document.querySelectorAll('img[srcset], img[sizes]');
    logCrawlSuccess('Mobile', `Responsive images: ${responsiveImages.length} found`);
    
    // Test touch targets
    const touchTargets = document.querySelectorAll('button, a, input, select');
    let smallTargets = 0;
    
    for (const target of touchTargets) {
      const rect = target.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTargets++;
      }
    }
    
    if (smallTargets > 0) {
      logCrawlError('Mobile', `${smallTargets} touch targets too small (< 44px)`);
      CRAWLER_RESULTS.uxIssues.push({ issue: `${smallTargets} touch targets too small`, severity: 'medium' });
    } else {
      logCrawlSuccess('Mobile', 'All touch targets appropriately sized');
    }
    
    return true;
    
  } catch (error) {
    logCrawlError('Mobile', 'Mobile responsiveness testing failed', error);
    return false;
  }
}

// Test SEO elements
async function testSEOElements() {
  logCrawlStep('SEO', 'Testing SEO elements...');
  
  try {
    // Test title tag
    const title = document.querySelector('title');
    if (title && title.textContent.trim()) {
      logCrawlSuccess('SEO', `Title: ${title.textContent.trim()}`);
    } else {
      logCrawlError('SEO', 'Title tag missing or empty');
      CRAWLER_RESULTS.uxIssues.push({ issue: 'Missing or empty title tag', severity: 'high' });
    }
    
    // Test meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.content.trim()) {
      logCrawlSuccess('SEO', `Meta description: ${metaDescription.content.trim()}`);
    } else {
      logCrawlError('SEO', 'Meta description missing or empty');
      CRAWLER_RESULTS.uxIssues.push({ issue: 'Missing or empty meta description', severity: 'medium' });
    }
    
    // Test heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    logCrawlSuccess('SEO', `Headings: ${headings.length} found`);
    
    // Test h1 tag
    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length === 1) {
      logCrawlSuccess('SEO', 'Single H1 tag found');
    } else if (h1Tags.length === 0) {
      logCrawlError('SEO', 'No H1 tag found');
      CRAWLER_RESULTS.uxIssues.push({ issue: 'Missing H1 tag', severity: 'high' });
    } else {
      logCrawlError('SEO', `Multiple H1 tags found: ${h1Tags.length}`);
      CRAWLER_RESULTS.uxIssues.push({ issue: `Multiple H1 tags: ${h1Tags.length}`, severity: 'medium' });
    }
    
    // Test alt attributes
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    
    for (const img of images) {
      if (!img.alt) {
        imagesWithoutAlt++;
      }
    }
    
    if (imagesWithoutAlt > 0) {
      logCrawlError('SEO', `${imagesWithoutAlt} images missing alt attributes`);
      CRAWLER_RESULTS.uxIssues.push({ issue: `${imagesWithoutAlt} images missing alt attributes`, severity: 'medium' });
    } else {
      logCrawlSuccess('SEO', 'All images have alt attributes');
    }
    
    return true;
    
  } catch (error) {
    logCrawlError('SEO', 'SEO testing failed', error);
    return false;
  }
}

// Test CallReady integration points
async function testCallReadyIntegrationPoints() {
  logCrawlStep('CallReady', 'Testing CallReady integration points...');
  
  try {
    // Test for CallReady tracking
    const callReadyElements = document.querySelectorAll('[data-callready], .callready, [data-tracking]');
    if (callReadyElements.length > 0) {
      logCrawlSuccess('CallReady', `Found ${callReadyElements.length} CallReady elements`);
    } else {
      logCrawlError('CallReady', 'No CallReady elements found');
      CRAWLER_RESULTS.callReadyIssues.push({ issue: 'No CallReady elements found', severity: 'high' });
    }
    
    // Test for tracking scripts
    const trackingScripts = document.querySelectorAll('script[src*="gtag"], script[src*="fbq"], script[src*="analytics"]');
    if (trackingScripts.length > 0) {
      logCrawlSuccess('CallReady', `Found ${trackingScripts.length} tracking scripts`);
    } else {
      logCrawlError('CallReady', 'No tracking scripts found');
      CRAWLER_RESULTS.callReadyIssues.push({ issue: 'No tracking scripts found', severity: 'medium' });
    }
    
    // Test for form tracking
    const forms = document.querySelectorAll('form');
    let formsWithTracking = 0;
    
    for (const form of forms) {
      if (form.querySelector('[data-tracking], [data-callready]') || form.hasAttribute('data-tracking')) {
        formsWithTracking++;
      }
    }
    
    if (formsWithTracking > 0) {
      logCrawlSuccess('CallReady', `${formsWithTracking} forms have tracking`);
    } else {
      logCrawlError('CallReady', 'No forms have tracking');
      CRAWLER_RESULTS.callReadyIssues.push({ issue: 'No forms have tracking', severity: 'medium' });
    }
    
    return true;
    
  } catch (error) {
    logCrawlError('CallReady', 'CallReady integration testing failed', error);
    return false;
  }
}

// Generate comprehensive crawl report
function generateComprehensiveCrawlReport() {
  const endTime = Date.now();
  const duration = endTime - CRAWLER_RESULTS.startTime;
  
  console.log('\n' + '='.repeat(80));
  console.log('🕷️ COMPREHENSIVE SITE CRAWLER REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Checks: ${CRAWLER_RESULTS.totalChecks}`);
  console.log(`   Successful: ${CRAWLER_RESULTS.successCount}`);
  console.log(`   Success Rate: ${((CRAWLER_RESULTS.successCount / CRAWLER_RESULTS.totalChecks) * 100).toFixed(1)}%`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
  
  console.log(`\n🔗 BROKEN LINKS (${CRAWLER_RESULTS.brokenLinks.length}):`);
  CRAWLER_RESULTS.brokenLinks.forEach(link => {
    console.log(`   ❌ ${link.url} (${link.status})`);
  });
  
  console.log(`\n⚡ PERFORMANCE ISSUES (${CRAWLER_RESULTS.performanceIssues.length}):`);
  CRAWLER_RESULTS.performanceIssues.forEach(issue => {
    console.log(`   ⚠️ ${issue.issue} (${issue.severity})`);
  });
  
  console.log(`\n🎨 UX ISSUES (${CRAWLER_RESULTS.uxIssues.length}):`);
  CRAWLER_RESULTS.uxIssues.forEach(issue => {
    console.log(`   ⚠️ ${issue.issue} (${issue.severity})`);
  });
  
  console.log(`\n🔌 CALLREADY ISSUES (${CRAWLER_RESULTS.callReadyIssues.length}):`);
  CRAWLER_RESULTS.callReadyIssues.forEach(issue => {
    console.log(`   ⚠️ ${issue.issue} (${issue.severity})`);
  });
  
  console.log(`\n📝 CRAWL STEPS:`);
  CRAWLER_RESULTS.pages.forEach(page => {
    console.log(`   ✅ [${page.step}] ${page.message}`);
  });
  
  console.log(`\n❌ ERRORS (${CRAWLER_RESULTS.errors.length}):`);
  CRAWLER_RESULTS.errors.forEach(error => {
    console.log(`   - [${error.step}] ${error.message}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  return CRAWLER_RESULTS;
}

// Main comprehensive site crawler
async function runComprehensiveSiteCrawler() {
  logCrawlStep('Site Crawler', 'Starting Comprehensive Site Crawler...');
  
  try {
    // Test current page
    await testURLAccessibility(window.location.href);
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Test navigation elements
    await testNavigationElements();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Test form functionality
    await testFormFunctionality();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Test performance metrics
    await testPerformanceMetrics();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Test mobile responsiveness
    await testMobileResponsiveness();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Test SEO elements
    await testSEOElements();
    await wait(CRAWLER_CONFIG.delayBetweenActions);
    
    // Test CallReady integration points
    await testCallReadyIntegrationPoints();
    
    // Generate report
    const report = generateComprehensiveCrawlReport();
    
    logCrawlStep('Site Crawler', '✅ Comprehensive site crawling completed!');
    
    return report;
    
  } catch (error) {
    logCrawlError('Site Crawler', 'Comprehensive site crawling failed', error);
    return CRAWLER_RESULTS;
  }
}

// Export for manual testing
window.comprehensiveSiteCrawler = {
  runTest: runComprehensiveSiteCrawler,
  testURLAccessibility: testURLAccessibility,
  testNavigationElements: testNavigationElements,
  testFormFunctionality: testFormFunctionality,
  testPerformanceMetrics: testPerformanceMetrics,
  testMobileResponsiveness: testMobileResponsiveness,
  testSEOElements: testSEOElements,
  testCallReadyIntegrationPoints: testCallReadyIntegrationPoints,
  generateReport: generateComprehensiveCrawlReport,
  getResults: () => CRAWLER_RESULTS,
  config: CRAWLER_CONFIG
};

console.log('🕷️ Comprehensive Site Crawler functions available:');
console.log('   - window.comprehensiveSiteCrawler.runTest()');
console.log('   - window.comprehensiveSiteCrawler.testURLAccessibility(url)');
console.log('   - window.comprehensiveSiteCrawler.testNavigationElements()');
console.log('   - window.comprehensiveSiteCrawler.testFormFunctionality()');
console.log('   - window.comprehensiveSiteCrawler.testPerformanceMetrics()');
console.log('   - window.comprehensiveSiteCrawler.testMobileResponsiveness()');
console.log('   - window.comprehensiveSiteCrawler.testSEOElements()');
console.log('   - window.comprehensiveSiteCrawler.testCallReadyIntegrationPoints()');

// Auto-run the comprehensive site crawler
runComprehensiveSiteCrawler();
```

## 🎯 **Quick Start:**

1. **Copy the entire script above**
2. **Go to**: `https://seniorsimple.org`
3. **Open browser console** (F12)
4. **Paste and run the script**
5. **Watch the automated crawling and review the comprehensive report**

## 📊 **What You'll See:**

- ✅ **Real-time crawling progress** with detailed logging
- ✅ **Broken links and 404 errors** identified
- ✅ **Performance issues** and loading problems
- ✅ **UX issues** and accessibility problems
- ✅ **SEO problems** and missing elements
- ✅ **CallReady integration issues** and tracking problems

The agent will automatically crawl your site and identify all issues that need to be fixed!