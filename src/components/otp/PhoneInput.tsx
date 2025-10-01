'use client'

import { useState, useEffect } from 'react';
import { formatUSPhoneNumber, isValidUSPhoneNumber } from '@/utils/phone-utils';
import { validatePhoneForOTP } from '@/utils/otp-utils';
import type { PhoneInputProps } from '@/types/otp-types';

export const PhoneInput = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter your phone number',
  disabled = false,
  error,
  className = ''
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when prop changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only digits, spaces, parentheses, hyphens, and plus
    const cleaned = inputValue.replace(/[^\d\s\(\)\-\+]/g, '');
    
    // Format the phone number
    const formatted = formatUSPhoneNumber(cleaned);
    
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const validation = validatePhoneForOTP(displayValue);
  const hasError = error || (!validation.isValid && displayValue && !isFocused);

  return (
    <div className={`phone-input ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <span className="text-gray-500 text-lg font-medium">+1</span>
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pr-4 py-3 text-lg border-2 rounded-lg
            focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A]
            transition-colors duration-200
            ${hasError 
              ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          style={{ paddingLeft: '100px' }}
          autoComplete="tel"
        />
      </div>
      
      {hasError && (
        <p className="mt-2 text-sm text-red-600">
          {error || validation.error}
        </p>
      )}
      
      {validation.isValid && displayValue && !isFocused && (
        <p className="mt-2 text-sm text-green-600">
          ✓ Valid phone number
        </p>
      )}
    </div>
  );
};




