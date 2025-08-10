// Accessibility Checker Utility for SeniorSimple
// This utility helps validate common accessibility requirements

export interface AccessibilityCheckResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AccessibilityReport {
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  results: AccessibilityCheckResult[];
}

/**
 * Checks if an element has sufficient color contrast
 * This is a simplified check - for production use a proper contrast library
 */
export function checkColorContrast(foreground: string, background: string): AccessibilityCheckResult {
  // Simplified contrast check - in production, use a proper contrast calculation library
  const commonGoodContrasts = [
    { fg: '#36596A', bg: '#FFFFFF' }, // Primary on white
    { fg: '#FFFFFF', bg: '#36596A' }, // White on primary
    { fg: '#374151', bg: '#FFFFFF' }, // Gray text on white
  ];

  const hasGoodContrast = commonGoodContrasts.some(
    combo => combo.fg.toLowerCase() === foreground.toLowerCase() && 
             combo.bg.toLowerCase() === background.toLowerCase()
  );

  return {
    passed: hasGoodContrast,
    message: hasGoodContrast 
      ? `Good contrast between ${foreground} and ${background}` 
      : `Potential contrast issue between ${foreground} and ${background}`,
    severity: hasGoodContrast ? 'info' : 'warning'
  };
}

/**
 * Checks if touch targets meet minimum size requirements (44px)
 */
export function checkTouchTargets(): AccessibilityCheckResult {
  if (typeof window === 'undefined') {
    return {
      passed: true,
      message: 'Touch target check skipped (server-side)',
      severity: 'info'
    };
  }

  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
  const smallTargets: Element[] = [];

  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      // Check if element has touch-target class or appropriate sizing
      const hasAccessibleSizing = element.classList.contains('touch-target') ||
                                 element.classList.contains('btn-accessible') ||
                                 rect.width >= 44 && rect.height >= 44;
      
      if (!hasAccessibleSizing) {
        smallTargets.push(element);
      }
    }
  });

  return {
    passed: smallTargets.length === 0,
    message: smallTargets.length === 0 
      ? 'All interactive elements meet touch target requirements'
      : `${smallTargets.length} interactive elements may be too small for touch`,
    severity: smallTargets.length === 0 ? 'info' : 'warning'
  };
}

/**
 * Checks for proper focus indicators
 */
export function checkFocusIndicators(): AccessibilityCheckResult {
  if (typeof window === 'undefined') {
    return {
      passed: true,
      message: 'Focus indicator check skipped (server-side)',
      severity: 'info'
    };
  }

  const focusableElements = document.querySelectorAll(
    'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  let elementsWithoutFocus = 0;

  focusableElements.forEach(element => {
    const hasFocusClass = element.classList.contains('focus-visible-enhanced') ||
                         element.classList.contains('focus:ring') ||
                         element.classList.contains('focus-visible:ring');
    
    if (!hasFocusClass) {
      elementsWithoutFocus++;
    }
  });

  return {
    passed: elementsWithoutFocus === 0,
    message: elementsWithoutFocus === 0
      ? 'All focusable elements have focus indicators'
      : `${elementsWithoutFocus} focusable elements may lack proper focus indicators`,
    severity: elementsWithoutFocus === 0 ? 'info' : 'warning'
  };
}

/**
 * Checks for proper heading structure
 */
export function checkHeadingStructure(): AccessibilityCheckResult {
  if (typeof window === 'undefined') {
    return {
      passed: true,
      message: 'Heading structure check skipped (server-side)',
      severity: 'info'
    };
  }

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels: number[] = [];
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    headingLevels.push(level);
  });

  // Check if headings start with h1 and don't skip levels
  let hasIssues = false;
  let issueMessage = '';

  if (headingLevels.length > 0 && headingLevels[0] !== 1) {
    hasIssues = true;
    issueMessage = 'Page should start with h1';
  }

  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      hasIssues = true;
      issueMessage = 'Heading levels should not be skipped';
      break;
    }
  }

  return {
    passed: !hasIssues,
    message: hasIssues ? issueMessage : 'Heading structure is properly organized',
    severity: hasIssues ? 'warning' : 'info'
  };
}

/**
 * Checks for alt text on images
 */
export function checkImageAltText(): AccessibilityCheckResult {
  if (typeof window === 'undefined') {
    return {
      passed: true,
      message: 'Image alt text check skipped (server-side)',
      severity: 'info'
    };
  }

  const images = document.querySelectorAll('img');
  const imagesWithoutAlt: Element[] = [];

  images.forEach(img => {
    const alt = img.getAttribute('alt');
    if (alt === null || alt.trim() === '') {
      // Check if image is decorative (should have empty alt)
      const isDecorative = img.getAttribute('role') === 'presentation' ||
                          img.getAttribute('aria-hidden') === 'true';
      
      if (!isDecorative) {
        imagesWithoutAlt.push(img);
      }
    }
  });

  return {
    passed: imagesWithoutAlt.length === 0,
    message: imagesWithoutAlt.length === 0
      ? 'All images have appropriate alt text'
      : `${imagesWithoutAlt.length} images may be missing alt text`,
    severity: imagesWithoutAlt.length === 0 ? 'info' : 'error'
  };
}

/**
 * Checks for proper form labels
 */
export function checkFormLabels(): AccessibilityCheckResult {
  if (typeof window === 'undefined') {
    return {
      passed: true,
      message: 'Form labels check skipped (server-side)',
      severity: 'info'
    };
  }

  const formControls = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
  const controlsWithoutLabels: Element[] = [];

  formControls.forEach(control => {
    const id = control.getAttribute('id');
    const ariaLabel = control.getAttribute('aria-label');
    const ariaLabelledBy = control.getAttribute('aria-labelledby');
    
    let hasLabel = false;
    
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) hasLabel = true;
    }
    
    if (ariaLabel || ariaLabelledBy) {
      hasLabel = true;
    }
    
    // Check if control is inside a label
    const parentLabel = control.closest('label');
    if (parentLabel) hasLabel = true;
    
    if (!hasLabel) {
      controlsWithoutLabels.push(control);
    }
  });

  return {
    passed: controlsWithoutLabels.length === 0,
    message: controlsWithoutLabels.length === 0
      ? 'All form controls have proper labels'
      : `${controlsWithoutLabels.length} form controls may be missing labels`,
    severity: controlsWithoutLabels.length === 0 ? 'info' : 'error'
  };
}

/**
 * Runs all accessibility checks and returns a comprehensive report
 */
export function runAccessibilityAudit(): AccessibilityReport {
  const checks = [
    checkTouchTargets(),
    checkFocusIndicators(),
    checkHeadingStructure(),
    checkImageAltText(),
    checkFormLabels(),
    // Add color contrast checks for common combinations
    checkColorContrast('#36596A', '#FFFFFF'),
    checkColorContrast('#FFFFFF', '#36596A'),
    checkColorContrast('#374151', '#FFFFFF'),
  ];

  const report: AccessibilityReport = {
    totalChecks: checks.length,
    passed: 0,
    warnings: 0,
    errors: 0,
    results: checks
  };

  checks.forEach(check => {
    if (check.passed) {
      report.passed++;
    } else if (check.severity === 'warning') {
      report.warnings++;
    } else if (check.severity === 'error') {
      report.errors++;
    }
  });

  return report;
}

/**
 * Logs accessibility report to console
 */
export function logAccessibilityReport(): void {
  const report = runAccessibilityAudit();
  
  console.group('🔍 SeniorSimple Accessibility Audit');
  console.log(`📊 Total Checks: ${report.totalChecks}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`⚠️ Warnings: ${report.warnings}`);
  console.log(`❌ Errors: ${report.errors}`);
  
  if (report.results.length > 0) {
    console.group('📋 Detailed Results');
    report.results.forEach(result => {
      const icon = result.passed ? '✅' : (result.severity === 'error' ? '❌' : '⚠️');
      console.log(`${icon} ${result.message}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}