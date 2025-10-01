/**
 * Phone number utility functions for formatting and validation
 */

/**
 * Formats a US phone number to include country code
 * @param phoneNumber - Raw phone number input
 * @returns Formatted phone number with +1 country code
 */
export function formatUSPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it already starts with 1, remove it and add +1
  if (digits.startsWith('1') && digits.length === 11) {
    return `+1${digits.substring(1)}`;
  }
  
  // If it's 10 digits, add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already has +1, return as is
  if (phoneNumber.startsWith('+1')) {
    return phoneNumber;
  }
  
  // If it's 11 digits and doesn't start with 1, assume it's missing the country code
  if (digits.length === 11 && !digits.startsWith('1')) {
    return `+1${digits}`;
  }
  
  // For any other case, try to clean it up and add +1
  if (digits.length >= 10) {
    const last10Digits = digits.slice(-10);
    return `+1${last10Digits}`;
  }
  
  // If we can't format it properly, return the original with +1 prefix
  return `+1${digits}`;
}

/**
 * Validates if a phone number is a valid US phone number
 * @param phoneNumber - Phone number to validate
 * @returns True if valid US phone number
 */
export function isValidUSPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  const formatted = formatUSPhoneNumber(phoneNumber);
  
  // Check if it matches the pattern +1XXXXXXXXXX (11 digits after +1)
  const phoneRegex = /^\+1\d{10}$/;
  return phoneRegex.test(formatted);
}

/**
 * Formats phone number for display (e.g., +1 (555) 123-4567)
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const formatted = formatUSPhoneNumber(phoneNumber);
  
  // Extract the 10 digits after +1
  const digits = formatted.replace('+1', '');
  
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return formatted;
}

/**
 * Extracts just the 10-digit US phone number (without country code)
 * @param phoneNumber - Phone number to extract from
 * @returns 10-digit phone number
 */
export function extractUSPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 1 and is 11 digits, return the last 10
  if (digits.startsWith('1') && digits.length === 11) {
    return digits.substring(1);
  }
  
  // If it's 10 digits, return as is
  if (digits.length === 10) {
    return digits;
  }
  
  // If it's 11 digits and doesn't start with 1, return the last 10
  if (digits.length === 11) {
    return digits.substring(1);
  }
  
  // For any other case, return the last 10 digits
  return digits.slice(-10);
}

/**
 * Formats phone number for E.164 international format
 * @param phoneNumber - Phone number to format
 * @returns E.164 formatted phone number
 */
export function formatE164(phoneNumber: string): string {
  return formatUSPhoneNumber(phoneNumber);
}





