/**
 * Email validation utility functions
 * Provides format validation, state management, and fake domain detection
 */

// Stricter email regex: requires valid domain (min 2 chars) and TLD (min 2 chars)
// Format: local@domain.tld where domain has at least 2 chars and TLD has at least 2 chars
const EMAIL_REGEX = /^[^\s@]+@[^\s@]{2,}\.[^\s@]{2,}$/;

const FAKE_EMAIL_DOMAINS = [
  'email.com', 'test.com', 'example.com', 'mail.com',
  'testmail.com', 'fakemail.com', 'tempmail.com',
  'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'yopmail.com', 'mohmal.com',
  'temp-mail.org', 'getnada.com', 'maildrop.cc'
];

/**
 * Detects fake email domains (disposable/temporary email services)
 * @param email - Email address input
 * @returns Detection result with isFake flag and optional reason
 */
export function detectFakeEmail(email: string): { isFake: boolean; reason?: string } {
  if (!email || !email.includes('@')) {
    return { isFake: false }; // Let format validation handle this
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isFake: false };
  }
  
  if (FAKE_EMAIL_DOMAINS.includes(domain)) {
    return { isFake: true, reason: 'Disposable email addresses are not allowed. Please use your real email.' };
  }
  
  return { isFake: false };
}

/**
 * Validates email format and detects fake domains
 * @param email - Email address input
 * @returns Validation result with isValid flag, optional error message, and isFake flag
 */
export function validateEmailFormat(email: string): { isValid: boolean; error?: string; isFake?: boolean } {
  if (!email || email.length === 0) {
    return { isValid: false, error: undefined }; // Empty state
  }
  
  // Basic format check with regex
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@example.com)' };
  }
  
  // Additional validation: check for minimum lengths
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  const [localPart, domainPart] = parts;
  const domainParts = domainPart.split('.');
  
  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: 'Email address must have a name before @' };
  }
  
  // Validate domain structure
  if (domainParts.length < 2) {
    return { isValid: false, error: 'Email address must include a domain and extension (e.g., .com)' };
  }
  
  const domain = domainParts[0];
  const tld = domainParts[domainParts.length - 1];
  
  // Domain must be at least 2 characters
  if (!domain || domain.length < 2) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // TLD must be at least 2 characters
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Email address must have a valid extension (e.g., .com, .org)' };
  }
  
  // Check for fake domains
  const fakeCheck = detectFakeEmail(email);
  if (fakeCheck.isFake) {
    return { isValid: false, error: fakeCheck.reason, isFake: true };
  }
  
  return { isValid: true };
}

/**
 * Gets the validation state for UI rendering
 * @param email - Email address input
 * @returns 'empty' | 'invalid' | 'valid'
 */
export function getEmailValidationState(email: string): 'empty' | 'invalid' | 'valid' {
  if (!email || email.length === 0) return 'empty';
  return EMAIL_REGEX.test(email) ? 'valid' : 'invalid';
}

/**
 * Validates email address via MillionVerifier API
 * @param email - Email address input
 * @returns Validation result with valid flag and optional error message
 */
export async function validateEmailAPI(email: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('/api/validate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.valid) {
      return { valid: false, error: data.error || 'Invalid email address' };
    }
    
    if (data.disposable) {
      return { valid: false, error: 'Disposable email addresses are not allowed' };
    }
    
    if (data.roleBased) {
      return { valid: false, error: 'Role-based emails (e.g., info@, admin@) are not allowed' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Email API validation error:', error);
    // Don't block submission on API failure
    return { valid: true }; // Fallback to allow submission
  }
}

