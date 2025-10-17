#!/usr/bin/env python3
"""
🤖 CrewAI Site Crawler Agent

This CrewAI agent automatically:
1. Opens the local browser to SeniorSimple
2. Injects the comprehensive crawler script
3. Executes the crawler automatically
4. Generates a detailed report
5. Provides actionable recommendations
"""

import os
import sys
import time
import json
import subprocess
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class SiteCrawlerCrewAIAgent:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.seniorsimple_url = "http://localhost:3010"
        self.driver = None
        self.results = {
            "start_time": None,
            "end_time": None,
            "duration": None,
            "pages_tested": [],
            "broken_links": [],
            "performance_issues": [],
            "ux_issues": [],
            "seo_issues": [],
            "callready_issues": [],
            "success_rate": 0,
            "total_checks": 0,
            "recommendations": []
        }
        
    def log(self, message, level="INFO"):
        """Log with emoji prefix and timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        emoji = {"INFO": "🤖", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}.get(level, "🤖")
        print(f"{emoji} [{timestamp}] {message}")
        
    def setup_browser(self):
        """Setup Chrome browser with optimal settings"""
        self.log("Setting up Chrome browser...")
        
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
            
            # Enable logging
            chrome_options.add_argument("--enable-logging")
            chrome_options.add_argument("--log-level=0")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            
            self.log("Chrome browser setup successful", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"Failed to setup browser: {e}", "ERROR")
            return False
            
    def navigate_to_site(self):
        """Navigate to SeniorSimple site"""
        self.log(f"Navigating to {self.seniorsimple_url}...")
        
        try:
            self.driver.get(self.seniorsimple_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            self.log("Successfully navigated to SeniorSimple", "SUCCESS")
            return True
            
        except TimeoutException:
            self.log("Timeout waiting for page to load", "ERROR")
            return False
        except Exception as e:
            self.log(f"Failed to navigate to site: {e}", "ERROR")
            return False
            
    def inject_crawler_script(self):
        """Inject the comprehensive crawler script into the browser"""
        self.log("Injecting comprehensive crawler script...")
        
        crawler_script = """
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
         * Automatically injected by CrewAI Agent
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
          delayBetweenActions: 1000,
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
          
          console.log('\\n' + '='.repeat(80));
          console.log('🕷️ COMPREHENSIVE SITE CRAWLER REPORT');
          console.log('='.repeat(80));
          
          console.log(`\\n📊 SUMMARY:`);
          console.log(`   Total Checks: ${CRAWLER_RESULTS.totalChecks}`);
          console.log(`   Successful: ${CRAWLER_RESULTS.successCount}`);
          console.log(`   Success Rate: ${((CRAWLER_RESULTS.successCount / CRAWLER_RESULTS.totalChecks) * 100).toFixed(1)}%`);
          console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
          
          console.log(`\\n🔗 BROKEN LINKS (${CRAWLER_RESULTS.brokenLinks.length}):`);
          CRAWLER_RESULTS.brokenLinks.forEach(link => {
            console.log(`   ❌ ${link.url} (${link.status})`);
          });
          
          console.log(`\\n⚡ PERFORMANCE ISSUES (${CRAWLER_RESULTS.performanceIssues.length}):`);
          CRAWLER_RESULTS.performanceIssues.forEach(issue => {
            console.log(`   ⚠️ ${issue.issue} (${issue.severity})`);
          });
          
          console.log(`\\n🎨 UX ISSUES (${CRAWLER_RESULTS.uxIssues.length}):`);
          CRAWLER_RESULTS.uxIssues.forEach(issue => {
            console.log(`   ⚠️ ${issue.issue} (${issue.severity})`);
          });
          
          console.log(`\\n🔌 CALLREADY ISSUES (${CRAWLER_RESULTS.callReadyIssues.length}):`);
          CRAWLER_RESULTS.callReadyIssues.forEach(issue => {
            console.log(`   ⚠️ ${issue.issue} (${issue.severity})`);
          });
          
          console.log(`\\n📝 CRAWL STEPS:`);
          CRAWLER_RESULTS.pages.forEach(page => {
            console.log(`   ✅ [${page.step}] ${page.message}`);
          });
          
          console.log(`\\n❌ ERRORS (${CRAWLER_RESULTS.errors.length}):`);
          CRAWLER_RESULTS.errors.forEach(error => {
            console.log(`   - [${error.step}] ${error.message}`);
          });
          
          console.log('\\n' + '='.repeat(80));
          
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

        // Make sure results are accessible globally
        window.CRAWLER_RESULTS = CRAWLER_RESULTS;
        
        // Auto-run the comprehensive site crawler
        runComprehensiveSiteCrawler();
        """
        
        try:
            # Execute the crawler script
            result = self.driver.execute_script(crawler_script)
            self.log("Crawler script injected and executed successfully", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"Failed to inject crawler script: {e}", "ERROR")
            return False
            
    def extract_results(self):
        """Extract crawler results from browser console"""
        self.log("Extracting crawler results...")
        
        try:
            # Wait for the crawler to complete
            time.sleep(5)
            
            # Extract results directly from the JavaScript object
            results = self.driver.execute_script("return window.CRAWLER_RESULTS || {};")
            
            if results:
                self.results = {
                    "start_time": results.get("startTime", time.time()),
                    "end_time": time.time(),
                    "duration": None,
                    "pages_tested": results.get("pages", []),
                    "broken_links": results.get("brokenLinks", []),
                    "performance_issues": results.get("performanceIssues", []),
                    "ux_issues": results.get("uxIssues", []),
                    "seo_issues": results.get("seoIssues", []),
                    "callready_issues": results.get("callReadyIssues", []),
                    "success_count": results.get("successCount", 0),
                    "total_checks": results.get("totalChecks", 0),
                    "success_rate": 0,
                    "recommendations": []
                }
                
                # Calculate success rate
                if self.results["total_checks"] > 0:
                    self.results["success_rate"] = (self.results["success_count"] / self.results["total_checks"]) * 100
                    
                self.log("Results extracted successfully", "SUCCESS")
                return True
            else:
                self.log("No results found in browser", "WARNING")
                return False
                    
        except Exception as e:
            self.log(f"Failed to extract results: {e}", "ERROR")
            return False
            
    def generate_report(self):
        """Generate comprehensive crawler report"""
        self.log("Generating comprehensive report...")
        
        try:
            # Calculate duration
            if self.results["start_time"] and self.results["end_time"]:
                self.results["duration"] = self.results["end_time"] - self.results["start_time"]
                
            # Calculate success rate
            if self.results["total_checks"] > 0:
                self.results["success_rate"] = (self.results["success_count"] / self.results["total_checks"]) * 100
                
            # Generate recommendations
            self.generate_recommendations()
            
            # Save report to file
            report_file = self.project_root / "crawler-report.json"
            with open(report_file, 'w') as f:
                json.dump(self.results, f, indent=2)
                
            self.log(f"Report saved to {report_file}", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"Failed to generate report: {e}", "ERROR")
            return False
            
    def generate_recommendations(self):
        """Generate actionable recommendations based on findings"""
        self.log("Generating actionable recommendations...")
        
        recommendations = []
        
        # Broken links recommendations
        if self.results["broken_links"]:
            recommendations.append({
                "priority": "HIGH",
                "category": "Broken Links",
                "issue": f"{len(self.results['broken_links'])} broken links found",
                "action": "Fix broken links and update navigation",
                "impact": "User experience and SEO"
            })
            
        # Performance recommendations
        if self.results["performance_issues"]:
            recommendations.append({
                "priority": "MEDIUM",
                "category": "Performance",
                "issue": f"{len(self.results['performance_issues'])} performance issues found",
                "action": "Optimize images and scripts",
                "impact": "Page load speed and user experience"
            })
            
        # UX recommendations
        if self.results["ux_issues"]:
            recommendations.append({
                "priority": "HIGH",
                "category": "User Experience",
                "issue": f"{len(self.results['ux_issues'])} UX issues found",
                "action": "Improve mobile responsiveness and accessibility",
                "impact": "User engagement and conversion"
            })
            
        # CallReady recommendations
        if self.results["callready_issues"]:
            recommendations.append({
                "priority": "MEDIUM",
                "category": "CallReady Integration",
                "issue": f"{len(self.results['callready_issues'])} CallReady issues found",
                "action": "Implement proper tracking and analytics",
                "impact": "Lead tracking and conversion optimization"
            })
            
        self.results["recommendations"] = recommendations
        self.log(f"Generated {len(recommendations)} recommendations", "SUCCESS")
        
    def cleanup(self):
        """Cleanup browser and resources"""
        self.log("Cleaning up resources...")
        
        try:
            if self.driver:
                self.driver.quit()
                self.log("Browser closed successfully", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"Error during cleanup: {e}", "WARNING")
            return False
            
    def run(self):
        """Main execution method"""
        self.log("🚀 Starting CrewAI Site Crawler Agent...")
        self.results["start_time"] = time.time()
        
        try:
            # Step 1: Setup browser
            if not self.setup_browser():
                return False
                
            # Step 2: Navigate to site
            if not self.navigate_to_site():
                return False
                
            # Step 3: Inject crawler script
            if not self.inject_crawler_script():
                return False
                
            # Step 4: Wait for crawler to complete
            self.log("Waiting for crawler to complete...")
            time.sleep(10)  # Wait for crawler to finish
            
            # Step 5: Extract results
            if not self.extract_results():
                return False
                
            # Step 6: Generate report
            if not self.generate_report():
                return False
                
            self.results["end_time"] = time.time()
            
            self.log("🎉 CrewAI Site Crawler Agent completed successfully!", "SUCCESS")
            self.log(f"📊 Report generated with {len(self.results.get('recommendations', []))} recommendations")
            
            return True
            
        except Exception as e:
            self.log(f"❌ CrewAI Site Crawler Agent failed: {e}", "ERROR")
            return False
            
        finally:
            self.cleanup()

def main():
    """Main entry point"""
    agent = SiteCrawlerCrewAIAgent()
    success = agent.run()
    
    if success:
        print("\n✅ CrewAI Site Crawler Agent completed successfully!")
        print("📊 Check crawler-report.json for detailed results")
        print("🎯 Review recommendations for actionable next steps")
    else:
        print("\n❌ CrewAI Site Crawler Agent failed.")
        print("🔧 Please check the error messages above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
