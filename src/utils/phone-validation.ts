/**
 * Phone number validation utility functions
 * Provides format validation, state management, and fake pattern detection
 */

const FAKE_PHONE_PATTERNS = {
  tollFree: ['800', '833', '844', '855', '866', '877', '888'],
  fakeSequences: ['555', '1234', '0000', '1111', '2222', '3333', '4444', '6666', '7777', '8888', '9999'],
  testNumbers: ['5550100', '5551234', '5555555'],
};

/**
 * Detects fake phone number patterns
 * @param phone - Phone number input
 * @returns Detection result with isFake flag and optional reason
 */
export function detectFakePhone(phone: string): { isFake: boolean; reason?: string } {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length !== 10) {
    return { isFake: false }; // Let format validation handle this
  }
  
  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const number = digits.slice(6);
  
  // Check toll-free (optional - can be configurable)
  // if (FAKE_PHONE_PATTERNS.tollFree.includes(areaCode)) {
  //   return { isFake: true, reason: 'Toll-free numbers are not allowed' };
  // }
  
  // Check fake sequences
  if (FAKE_PHONE_PATTERNS.fakeSequences.some(pattern => digits.includes(pattern))) {
    return { isFake: true, reason: 'This appears to be a test number. Please enter your real phone number.' };
  }
  
  // Check test numbers
  if (FAKE_PHONE_PATTERNS.testNumbers.some(test => digits.includes(test))) {
    return { isFake: true, reason: 'Test numbers are not allowed. Please enter your real phone number.' };
  }
  
  // Check for all same digits (1111111111, 2222222222, etc.)
  if (/^(\d)\1{9}$/.test(digits)) {
    return { isFake: true, reason: 'Invalid phone number pattern' };
  }
  
  return { isFake: false };
}

/**
 * Validates phone number format (10-digit US format) and detects fake patterns
 * @param phone - Phone number input
 * @returns Validation result with isValid flag, optional error message, and isFake flag
 */
export function validatePhoneFormat(phone: string): { isValid: boolean; error?: string; isFake?: boolean } {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { isValid: false, error: undefined }; // Empty state
  }
  
  if (digits.length < 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit US phone number' };
  }
  
  if (digits.length === 10) {
    // Check for fake patterns
    const fakeCheck = detectFakePhone(digits);
    if (fakeCheck.isFake) {
      return { isValid: false, error: fakeCheck.reason, isFake: true };
    }
    return { isValid: true };
  }
  
  return { isValid: false, error: 'Phone number must be exactly 10 digits' };
}

/**
 * Gets the validation state for UI rendering
 * @param phone - Phone number input
 * @returns 'empty' | 'invalid' | 'valid'
 */
export function getPhoneValidationState(phone: string): 'empty' | 'invalid' | 'valid' {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return 'empty';
  if (digits.length === 10) return 'valid';
  return 'invalid';
}

/**
 * Validates phone number via Twilio Lookup API
 * @param phone - Phone number input (10 digits)
 * @returns Validation result with valid flag and optional error message
 */
export async function validatePhoneAPI(phone: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      return { valid: false, error: 'Phone number must be 10 digits' };
    }
    
    const response = await fetch('/api/validate-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.valid) {
      return { valid: false, error: data.error || 'Invalid phone number' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Phone API validation error:', error);
    // Don't block submission on API failure
    return { valid: true }; // Fallback to allow submission
  }
}

