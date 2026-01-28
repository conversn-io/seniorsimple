'use client'

import { useState, useEffect } from 'react';
import { formatPhoneForInput, formatPhoneForGHL, extractUSPhoneNumber } from '@/utils/phone-utils';
import { buildApiUrl } from '@/lib/api-config';
import { getPhoneValidationState, validatePhoneFormat, validatePhoneAPI } from '@/utils/phone-validation';
import { getEmailValidationState, validateEmailFormat } from '@/utils/email-validation';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { AddressAutocomplete, AddressData } from './AddressAutocomplete';
import { trackAddressEntered } from '@/lib/temp-tracking';

interface QuizQuestionProps {
  question: {
    id: string;
    title: string;
    subtitle?: string;
    type: 'multiple-choice' | 'multi-select' | 'slider' | 'input' | 'personal-info' | 'location-info' | 'address-info' | 'phone-consent' | 'personal-info-with-benefits' | 'coverage-amount-buttons' | 'yes-no' | 'full-name' | 'phone-only' | 'date-of-birth-dropdowns' | 'zip-only' | 'beneficiary-contact';
    options?: string[] | Array<{ value: number | null; label: string; description?: string; popular?: boolean }>;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number | string;
    placeholder?: string;
    isQualifying?: boolean;
    benefits?: string[];
    headline?: string;
    subheadline?: string;
    reassuranceText?: string;
    ctaText?: string;
    phoneHelperText?: string;
    minYear?: number;
    maxYear?: number;
    maxlength?: number;
    prompt?: string;
    microcopy?: string;
    beneficiaryOptions?: string[];
    consentText?: string;
  };
  onAnswer: (answer: any) => void;
  currentAnswer?: any;
  isLoading?: boolean;
  funnelType?: string; // For address tracking (primary vs final-expense)
  stepNumber?: number; // For address tracking
  sessionId?: string; // For address tracking
  entryVariant?: 'start_button' | 'immediate_q1'; // For A/B test tap target sizing
}

interface ZipValidationResult {
  valid: boolean;
  zipCode: string;
  state: string;
  stateName: string;
  licensing: {
    requires_license: boolean;
    license_type: string;
    notes: string;
  };
  error?: string;
}

export const QuizQuestion = ({ question, onAnswer, currentAnswer, isLoading, funnelType = 'primary', stepNumber = 0, sessionId, entryVariant }: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(currentAnswer || question.defaultValue);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(currentAnswer || []);
  const [sliderValue, setSliderValue] = useState(question.defaultValue as number || question.min || 0);
  
  // Personal info fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  
  // Location info fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Address autocomplete fields
  const [addressData, setAddressData] = useState<AddressData | null>(() => {
    if (currentAnswer && typeof currentAnswer === 'object') {
      return currentAnswer as AddressData;
    }
    return null;
  });
  const [isAddressValid, setIsAddressValid] = useState(!!currentAnswer);
  
  // Zip validation state
  const [zipValidationResult, setZipValidationResult] = useState<ZipValidationResult | null>(null);
  const [isValidatingZip, setIsValidatingZip] = useState(false);
  const [zipError, setZipError] = useState('');

  // Phone validation state
  const [phoneValidationState, setPhoneValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');
  const [phoneError, setPhoneError] = useState('');

  // Email validation state
  const [emailValidationState, setEmailValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');
  const [emailError, setEmailError] = useState('');

  // Phone API validation state
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [phoneAPIValid, setPhoneAPIValid] = useState(false);

  // Full name fields (for full-name type)
  const [fullNameFirstName, setFullNameFirstName] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.firstName) {
      return currentAnswer.firstName;
    }
    return '';
  });
  const [fullNameLastName, setFullNameLastName] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.lastName) {
      return currentAnswer.lastName;
    }
    return '';
  });

  // ZIP-only field (simplified, no autocomplete dependency)
  const [zipOnly, setZipOnly] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'string') {
      return currentAnswer;
    }
    return '';
  });
  const [zipOnlyError, setZipOnlyError] = useState('');
  const [zipOnlyInteractionCount, setZipOnlyInteractionCount] = useState(0);

  // Beneficiary-contact fields
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<string>(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.beneficiaryRelationship) {
      return String(currentAnswer.beneficiaryRelationship);
    }
    return '';
  });
  const [beneficiaryFirstName, setBeneficiaryFirstName] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.firstName) {
      return currentAnswer.firstName;
    }
    return '';
  });
  const [beneficiaryLastName, setBeneficiaryLastName] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.lastName) {
      return currentAnswer.lastName;
    }
    return '';
  });
  const [beneficiaryEmail, setBeneficiaryEmail] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.email) {
      return currentAnswer.email;
    }
    return '';
  });
  const [beneficiaryPhone, setBeneficiaryPhone] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.phone) {
      return currentAnswer.phone;
    }
    return '';
  });
  const [beneficiaryPhoneValidationState, setBeneficiaryPhoneValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');
  const [beneficiaryEmailValidationState, setBeneficiaryEmailValidationState] = useState<'empty' | 'invalid' | 'valid'>('empty');

  // Date of birth fields (for date-of-birth-dropdowns type)
  const [dobMonth, setDobMonth] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.month) {
      return currentAnswer.month;
    }
    return '';
  });
  const [dobDay, setDobDay] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.day) {
      return currentAnswer.day;
    }
    return '';
  });
  const [dobYear, setDobYear] = useState(() => {
    if (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.year) {
      return currentAnswer.year;
    }
    return '';
  });

  // Initialize phone for phone-only type
  useEffect(() => {
    if (question.type === 'phone-only' && currentAnswer && typeof currentAnswer === 'string') {
      // Extract digits from formatted phone
      const digits = currentAnswer.replace(/\D/g, '').slice(-10);
      if (digits.length === 10) {
        setPhone(digits);
        const state = getPhoneValidationState(digits);
        setPhoneValidationState(state);
      }
    }
  }, [question.type, currentAnswer]);

  // Debounced zip validation
  useEffect(() => {
    if (question.type === 'location-info' && zipCode.length >= 5) {
      const timeoutId = setTimeout(() => {
        validateZipCode(zipCode);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [zipCode, question.type]);

  // Track address_entered when ZIP is validated (location-info type, primary funnel only)
  // Note: zipInteractionCount is only defined for zip-only type, so we use 1 as default for location-info
  useEffect(() => {
    if (question.type === 'location-info' && zipValidationResult?.valid && sessionId && funnelType === 'primary') {
      trackAddressEntered({
        hasZip: !!zipCode,
        hasState: !!zipValidationResult.state,
        funnelType: funnelType,
        stepNumber: stepNumber || 0,
        fieldInteractionCount: 1, // Location-info typically one interaction (ZIP validation)
        sessionId: sessionId
      }).catch(err => {
        console.warn('⚠️ Failed to track address entered (non-blocking):', err);
      });
    }
  }, [zipValidationResult?.valid, zipCode, zipValidationResult?.state, question.type, sessionId, funnelType, stepNumber]);

  // Debounced phone API validation (Level 3) - REQUIRED
  useEffect(() => {
    // Reset API validation state when phone changes
    setPhoneAPIValid(false);
    
    // Only trigger API validation if:
    // 1. Question type is personal-info, personal-info-with-benefits, or phone-only
    // 2. Phone format is valid (10 digits)
    // 3. No existing format/fake errors
    const isPhoneQuestionType = question.type === 'personal-info' || 
                                question.type === 'personal-info-with-benefits' ||
                                question.type === 'phone-only';
    if (isPhoneQuestionType && phoneValidationState === 'valid' && phone.length === 10 && !phoneError) {
      setIsValidatingPhone(true);
      const timeoutId = setTimeout(async () => {
        try {
          const apiResult = await validatePhoneAPI(phone);
          if (apiResult.valid) {
            setPhoneAPIValid(true);
            setPhoneError(''); // Clear any previous errors
          } else {
            setPhoneAPIValid(false);
            setPhoneError(apiResult.error || 'Invalid phone number');
            setPhoneValidationState('invalid');
          }
        } catch (error) {
          console.error('Phone API validation error:', error);
          setPhoneAPIValid(false);
          setPhoneError('Unable to verify phone number. Please try again.');
          setPhoneValidationState('invalid');
        } finally {
          setIsValidatingPhone(false);
        }
      }, 500); // 500ms debounce
      
      return () => {
        clearTimeout(timeoutId);
        setIsValidatingPhone(false);
      };
    } else if (phone.length === 0) {
      // Reset when phone is cleared
      setPhoneAPIValid(false);
    }
  }, [phone, phoneValidationState, phoneError, question.type]);

  // Beneficiary form phone validation (must be at top level, not in switch case)
  useEffect(() => {
    if (question.type === 'beneficiary-contact' && beneficiaryPhone) {
      const state = getPhoneValidationState(beneficiaryPhone);
      setBeneficiaryPhoneValidationState(state);
      if (state === 'invalid') {
        setPhoneError('Please enter a valid 10-digit US phone number.');
      } else {
        setPhoneError('');
      }
    }
  }, [beneficiaryPhone, question.type]);

  // Beneficiary form email validation (must be at top level, not in switch case)
  useEffect(() => {
    if (question.type === 'beneficiary-contact' && beneficiaryEmail) {
      const state = getEmailValidationState(beneficiaryEmail);
      setBeneficiaryEmailValidationState(state);
      if (state === 'invalid') {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    }
  }, [beneficiaryEmail, question.type]);

  const validateZipCode = async (zip: string) => {
    if (!zip || zip.length < 5) {
      setZipValidationResult(null);
      setZipError('');
      return;
    }

    setIsValidatingZip(true);
    setZipError('');

    try {
      const response = await fetch(buildApiUrl('/api/validate-zipcode'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zipCode: zip }),
      });

      const data = await response.json();

      if (response.ok && data?.valid) {
        setZipValidationResult(data);
        setZipError('');
        // Auto-populate state if available
        if (data.stateName) {
          setState(data.stateName);
        }
      } else {
        setZipValidationResult({ 
          valid: false, 
          zipCode: zip, 
          state: '', 
          stateName: '', 
          licensing: { requires_license: false, license_type: 'none', notes: '' },
          error: data?.error || 'Invalid zip code'
        });
        setZipError(data?.error || 'Invalid zip code');
      }
    } catch (err: any) {
      console.error('Zip validation error:', err);
      setZipError('Unable to validate zip code. Please try again.');
      setZipValidationResult(null);
    } finally {
      setIsValidatingZip(false);
    }
  };

  const handleMultipleChoice = (answer: string) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  const handleMultiSelect = (answer: string) => {
    // Handle "None of the above" exclusive logic
    if (answer === 'None of the above') {
      // If "None of the above" is selected, clear all other selections
      setSelectedAnswers(['None of the above']);
    } else {
      // If any other option is selected, remove "None of the above" if present
      const filteredAnswers = selectedAnswers.filter(a => a !== 'None of the above');
      const newAnswers = filteredAnswers.includes(answer)
        ? filteredAnswers.filter(a => a !== answer)
        : [...filteredAnswers, answer];
      setSelectedAnswers(newAnswers);
    }
    // Don't call onAnswer immediately for multi-select - wait for Continue button
  };

  const handleMultiSelectContinue = () => {
    onAnswer(selectedAnswers);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    onAnswer(value);
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Capture TrustedForm certificate URL using helper function (more reliable)
    const trustedFormCertUrl = getTrustedFormCertUrl() || '';
    
    console.log('📝 Form submit handler called:', {
      questionType: question.type,
      firstName: !!firstName,
      lastName: !!lastName,
      email: !!email,
      phone: !!phone,
      emailValid: emailValidationState === 'valid',
      phoneValid: phoneValidationState === 'valid',
      phoneAPIValid,
      isValidatingPhone,
      isLoading,
      trustedFormCertUrl: trustedFormCertUrl ? 'present' : 'missing'
    });
    
    // Prevent double submission
    if (isLoading) {
      console.log('⚠️ Submission prevented - already loading');
      return;
    }
    
    // For personal-info-with-benefits, consent is implied by clicking the button
    // For regular personal-info, require checkbox
    const requiresConsent = question.type === 'personal-info';
    const canSubmit = firstName && lastName && email && phone && (requiresConsent ? consentChecked : true);
    
    if (canSubmit) {
      // Extract 10 digits from phone input
      const digits = extractUSPhoneNumber(phone);
      
      // Validate we have 10 digits
      if (digits.length !== 10) {
        setPhoneError('Please enter a valid 10-digit US phone number.');
        return;
      }
      
      // Format phone with +1 for storage/submission
      const formattedPhoneNumber = formatPhoneForGHL(digits);
      
      console.log('✅ Calling onAnswer with form data');
      onAnswer({
        firstName,
        lastName,
        email,
        phone: formattedPhoneNumber,
        consent: requiresConsent ? consentChecked : true, // Implied consent for personal-info-with-benefits
        trustedFormCertUrl: trustedFormCertUrl || null // Include TrustedForm certificate URL
      });
    } else {
      console.error('❌ Form validation failed:', {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        phone: !!phone,
        requiresConsent,
        consentChecked
      });
    }
  };

  const handleLocationInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode && zipValidationResult?.valid) {
      onAnswer({
        zipCode,
        state: zipValidationResult.state,
        stateName: zipValidationResult.stateName,
        licensing: zipValidationResult.licensing
      });
    }
  };

  // Handler for coverage amount buttons
  const handleCoverageAmountSelect = (value: number | null) => {
    setSelectedAnswer(value);
    onAnswer(value);
  };

  // Handler for yes/no questions
  const handleYesNo = (answer: boolean) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  // Handler for full name submit
  const handleFullNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullNameFirstName && fullNameLastName) {
      onAnswer({
        firstName: fullNameFirstName,
        lastName: fullNameLastName
      });
    }
  };

  // Handler for phone-only submit
  const handlePhoneOnlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = extractUSPhoneNumber(phone);
    if (digits.length === 10 && phoneValidationState === 'valid' && phoneAPIValid) {
      const formattedPhoneNumber = formatPhoneForGHL(digits);
      onAnswer(formattedPhoneNumber);
    }
  };

  // Handler for date of birth change - checks if all fields are filled and submits
  const handleDOBChange = () => {
    if (dobMonth && dobDay && dobYear) {
      // Format as ISO date string: YYYY-MM-DD
      const month = dobMonth.padStart(2, '0');
      const day = dobDay.padStart(2, '0');
      const dateString = `${dobYear}-${month}-${day}`;
      onAnswer({
        month: dobMonth,
        day: dobDay,
        year: dobYear,
        dateString: dateString,
        iso: dateString
      });
    }
  };

  // Note: DOB no longer auto-submits - requires button click

  // Generate year options for DOB dropdown
  const generateYearOptions = () => {
    const years = [];
    const minYear = question.minYear || 1935;
    const maxYear = question.maxYear || 1976;
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year);
    }
    return years;
  };

  // Generate day options based on selected month/year
  const generateDayOptions = () => {
    const days = [];
    let maxDays = 31;
    if (dobMonth && dobYear) {
      const monthNum = parseInt(dobMonth);
      const yearNum = parseInt(dobYear);
      // Handle February
      if (monthNum === 2) {
        // Check for leap year
        const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
        maxDays = isLeapYear ? 29 : 28;
      } else if ([4, 6, 9, 11].includes(monthNum)) {
        maxDays = 30;
      }
    }
    for (let day = 1; day <= maxDays; day++) {
      days.push(day);
    }
    return days;
  };

  // Check if current day is valid for the selected month/year
  const isDayValidForMonthYear = (day: string, month: string, year: string): boolean => {
    if (!day || !month || !year) return true; // Valid if any is empty
    
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    let maxDays = 31;
    if (monthNum === 2) {
      const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
      maxDays = isLeapYear ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(monthNum)) {
      maxDays = 30;
    }
    
    return dayNum <= maxDays;
  };


  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        // Variant B (immediate_q1) uses aggressive tap targets on step 1
        const isVariantBStep1 = entryVariant === 'immediate_q1' && stepNumber === 1;
        const buttonMinHeight = isVariantBStep1 ? '72px' : '64px';
        const buttonSpacing = isVariantBStep1 ? '16px' : '12px';
        const buttonFontSize = isVariantBStep1 ? '17px' : '16px';
        const buttonBorderRadius = isVariantBStep1 ? '14px' : '12px';
        const buttonPadding = isVariantBStep1 ? '18px 20px' : '16px 20px';
        
        return (
          <div className="space-y-4" style={{ gap: buttonSpacing }}>
            {(question.options as string[])?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleMultipleChoice(option)}
                className={`quiz-button w-full text-left border-3 transition-all duration-200 transform active:scale-95 ${
                  selectedAnswer === option
                    ? 'border-[#36596A] bg-white text-[#36596A] shadow-lg'
                    : 'border-gray-200 bg-white hover:border-[#36596A] hover:shadow-lg text-gray-700'
                }`}
                disabled={isLoading}
                style={{ 
                  minHeight: buttonMinHeight,
                  padding: buttonPadding,
                  borderRadius: buttonBorderRadius,
                  fontSize: buttonFontSize,
                  fontWeight: 600,
                  marginBottom: index < (question.options as string[]).length - 1 ? buttonSpacing : 0
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold leading-relaxed" style={{ fontSize: buttonFontSize }}>{option}</span>
                  <div className="flex items-center gap-3">
                    {isVariantBStep1 && (
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    {selectedAnswer === option && (
                      <div className="w-6 h-6 bg-[#36596A] rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {(question.options as string[])?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMultiSelect(option)}
                  className={`quiz-button w-full p-6 text-left border-3 rounded-xl transition-all duration-200 transform active:scale-95 ${
                    selectedAnswers.includes(option)
                      ? 'border-[#36596A] bg-white text-[#36596A] shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#36596A] hover:shadow-lg text-gray-700'
                  }`}
                  disabled={isLoading}
                  style={{ minHeight: '64px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg leading-relaxed">{option}</span>
                    <div className={`w-6 h-6 border-3 rounded flex items-center justify-center flex-shrink-0 ${
                      selectedAnswers.includes(option)
                        ? 'border-[#36596A] bg-[#36596A]'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers.includes(option) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Continue button for multi-select */}
            <button
              onClick={handleMultiSelectContinue}
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={selectedAnswers.length === 0 || isLoading}
              style={{ minHeight: '64px' }}
            >
              Continue
            </button>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-[#36596A] mb-4">
                ${sliderValue.toLocaleString()}
              </div>
            </div>
            <div className="px-4">
              <input
                type="range"
                min={question.min}
                max={question.max}
                step={question.step}
                value={sliderValue}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #36596A 0%, #36596A ${((sliderValue - (question.min || 0)) / ((question.max || 100) - (question.min || 0))) * 100}%, #e5e7eb ${((sliderValue - (question.min || 0)) / ((question.max || 100) - (question.min || 0))) * 100}%, #e5e7eb 100%)`
                }}
                disabled={isLoading}
              />
              <div className="flex justify-between text-lg text-gray-600 mt-4">
                <span className="font-semibold">${question.min?.toLocaleString()}</span>
                <span className="font-semibold">${question.max?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );

      case 'personal-info':
        return (
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isLoading}
                style={{ minHeight: '56px' }}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isLoading}
                style={{ minHeight: '56px' }}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);
                    const state = getEmailValidationState(newEmail);
                    setEmailValidationState(state);
                    const validation = validateEmailFormat(newEmail);
                    setEmailError(validation.error || '');
                  }}
                  className={`
                    quiz-input w-full px-6 py-4 pr-12 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${emailValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${emailValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${emailValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  required
                  disabled={isLoading}
                  style={{ minHeight: '56px' }}
                />
                {emailValidationState === 'invalid' && email && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {emailValidationState === 'valid' && email && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {emailValidationState === 'invalid' && emailError && (
                <p className="text-red-600 text-sm mt-2">{emailError}</p>
              )}
              {emailValidationState === 'valid' && email && (
                <p className="text-green-600 text-sm mt-2">✓ Email address is valid</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-gray-500 text-lg font-medium">+1</span>
                </div>
                <input
                  type="tel"
                  value={formatPhoneForInput(phone)}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Remove all non-digit characters
                    const digits = inputValue.replace(/\D/g, '');
                    // Limit to 10 digits
                    const limitedDigits = digits.slice(0, 10);
                    setPhone(limitedDigits);
                    // Validate phone in real-time
                    const state = getPhoneValidationState(limitedDigits);
                    setPhoneValidationState(state);
                    const validation = validatePhoneFormat(limitedDigits);
                    setPhoneError(validation.error || '');
                  }}
                  className={`
                    quiz-input w-full pr-12 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${phoneValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${phoneValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${phoneValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  placeholder="(555) 123-4567"
                  required
                  disabled={isLoading}
                  autoComplete="tel-national"
                  style={{ 
                    minHeight: '56px',
                    paddingLeft: '100px'
                  }}
                />
                {isValidatingPhone && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!isValidatingPhone && phoneValidationState === 'invalid' && phone && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {!isValidatingPhone && phoneValidationState === 'valid' && phone && phoneAPIValid && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {phoneValidationState === 'valid' && phone && !isValidatingPhone && phoneAPIValid && (
                <p className="text-green-600 text-sm mt-2">✓ Phone number is valid</p>
              )}
              {phoneValidationState === 'empty' && (
                <p className="text-sm text-gray-500 mt-2">
                  We'll send a verification code to this number
                </p>
              )}
              {phoneError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <p className="text-red-600 text-sm">{phoneError}</p>
                </div>
              )}
            </div>
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-2 w-6 h-6 text-[#36596A] border-2 border-gray-300 rounded focus:ring-4 focus:ring-[#36596A]/20"
                disabled={isLoading}
              />
              <label htmlFor="consent" className="text-lg text-gray-600 leading-relaxed">
                I consent to receive SMS messages and phone calls from CallReady and its partners regarding my retirement planning inquiry. Message and data rates may apply. Reply STOP to opt out.
              </label>
            </div>

            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={
                !firstName || 
                !lastName || 
                !email || 
                !phone || 
                !consentChecked || 
                emailValidationState !== 'valid' ||
                phoneValidationState !== 'valid' ||
                !phoneAPIValid ||
                isValidatingPhone ||
                isLoading
              }
              style={{ minHeight: '64px' }}
            >
              Continue
            </button>
          </form>
        );

      case 'personal-info-with-benefits':
        const defaultBenefits = [
          'Free confidential consultation and estimated monthly income',
          'Personalized review of annuities you may qualify for',
          'Help planning your retirement for the future'
        ];
        const benefits = question.benefits || defaultBenefits;
        const ctaText = question.ctaText || 'Get Your Free Quote';
        const phoneHelper = question.phoneHelperText || "We'll send a verification code to this number";
        
        return (
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            
            {/* Benefits Section - Only show if benefits array is not empty */}
            {benefits && benefits.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-[#36596A] mb-4">What You'll Get:</h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Field order: first_name, last_name, phone_number, email */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isLoading}
                style={{ minHeight: '56px' }}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isLoading}
                style={{ minHeight: '56px' }}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-gray-500 text-lg font-medium">+1</span>
                </div>
                <input
                  type="tel"
                  value={formatPhoneForInput(phone)}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const digits = inputValue.replace(/\D/g, '');
                    const limitedDigits = digits.slice(0, 10);
                    setPhone(limitedDigits);
                    const state = getPhoneValidationState(limitedDigits);
                    setPhoneValidationState(state);
                    const validation = validatePhoneFormat(limitedDigits);
                    setPhoneError(validation.error || '');
                  }}
                  className={`
                    quiz-input w-full pr-12 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${phoneValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${phoneValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${phoneValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  placeholder="(555) 123-4567"
                  required
                  disabled={isLoading}
                  autoComplete="tel-national"
                  style={{ 
                    minHeight: '56px',
                    paddingLeft: '100px'
                  }}
                />
                {isValidatingPhone && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!isValidatingPhone && phoneValidationState === 'invalid' && phone && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {!isValidatingPhone && phoneValidationState === 'valid' && phone && phoneAPIValid && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {phoneValidationState === 'valid' && phone && !isValidatingPhone && phoneAPIValid && (
                <p className="text-green-600 text-sm mt-2">✓ Phone number is valid</p>
              )}
              {phoneValidationState === 'empty' && phoneHelper && (
                <p className="text-sm text-gray-500 mt-2">
                  {phoneHelper}
                </p>
              )}
              {phoneError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <p className="text-red-600 text-sm">{phoneError}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);
                    const state = getEmailValidationState(newEmail);
                    setEmailValidationState(state);
                    const validation = validateEmailFormat(newEmail);
                    setEmailError(validation.error || '');
                  }}
                  className={`
                    quiz-input w-full px-6 py-4 pr-12 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${emailValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${emailValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${emailValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  required
                  disabled={isLoading}
                  style={{ minHeight: '56px' }}
                />
                {emailValidationState === 'invalid' && email && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {emailValidationState === 'valid' && email && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {emailValidationState === 'invalid' && emailError && (
                <p className="text-red-600 text-sm mt-2">{emailError}</p>
              )}
              {emailValidationState === 'valid' && email && (
                <p className="text-green-600 text-sm mt-2">✓ Email address is valid</p>
              )}
            </div>

            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !firstName || 
                !lastName || 
                !email || 
                !phone || 
                emailValidationState !== 'valid' ||
                phoneValidationState !== 'valid' ||
                !phoneAPIValid ||
                isValidatingPhone ||
                isLoading
              }
              onClick={(e) => {
                console.log('🔘 Button clicked:', {
                  firstName: !!firstName,
                  lastName: !!lastName,
                  email: !!email,
                  phone: !!phone,
                  emailValid: emailValidationState === 'valid',
                  phoneValid: phoneValidationState === 'valid',
                  phoneAPIValid,
                  isValidatingPhone,
                  isLoading,
                  disabled: !firstName || !lastName || !email || !phone || emailValidationState !== 'valid' || phoneValidationState !== 'valid' || !phoneAPIValid || isValidatingPhone || isLoading
                });
              }}
              style={{ minHeight: '64px' }}
            >
              {isLoading ? 'Submitting...' : 'Get Your Free Quote'}
            </button>

            <div className="mt-4">
              <p className="text-xs text-gray-600 leading-relaxed text-center">
                By clicking "Get Your Free Quote", you provide your express written consent to receive communications from SeniorSimple.org and its marketing partners at the phone number and email address provided using automated technology, including calls, text messages and pre-recorded messages regarding insurance products or services that may be of interest. Consent is not required to purchase. Message and data rates may apply. You may opt out at any time. See our <a href="/privacy-policy" className="text-[#36596A] underline">privacy policy</a> and <a href="/terms-of-service" className="text-[#36596A] underline">terms and conditions</a>.
              </p>
            </div>
          </form>
        );

      case 'address-info':
        const handleAddressSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (addressData) {
            // Track address_entered when address is submitted (primary funnel only)
            if (sessionId && funnelType === 'primary') {
              trackAddressEntered({
                hasZip: !!addressData.zipCode,
                hasState: !!addressData.state,
                funnelType: funnelType,
                stepNumber: stepNumber,
                fieldInteractionCount: 1, // Address autocomplete typically one interaction
                sessionId: sessionId
              }).catch(err => {
                console.warn('⚠️ Failed to track address entered (non-blocking):', err);
              });
            }

            onAnswer({
              streetNumber: addressData.streetNumber,
              street: addressData.street,
              fullAddress: addressData.fullAddress,
              city: addressData.city,
              state: addressData.state,
              stateAbbr: addressData.stateAbbr,
              zipCode: addressData.zipCode,
              formatted: addressData.formatted
            });
          }
        };

        return (
          <form onSubmit={handleAddressSubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Get connected to an advisor in your area *
              </label>
              <AddressAutocomplete
                value={addressData?.formatted || ''}
                onChange={(data) => {
                  setAddressData(data);
                  setIsAddressValid(true);
                }}
                onValidationChange={setIsAddressValid}
                disabled={isLoading}
                isLoading={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={!addressData || !isAddressValid || isLoading}
              style={{ minHeight: '64px' }}
            >
              Continue
            </button>
          </form>
        );

      case 'location-info':
        return (
          <form onSubmit={handleLocationInfoSubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                ZIP Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 5);
                    setZipCode(value);
                  }}
                  className={`quiz-input w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all ${
                    zipError ? 'border-red-500' : zipValidationResult?.valid ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="12345"
                  required
                  disabled={isLoading}
                  style={{ minHeight: '56px' }}
                />
                {isValidatingZip && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#36596A]"></div>
                  </div>
                )}
                {zipValidationResult?.valid && !isValidatingZip && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Validation feedback */}
              {zipError && (
                <p className="text-red-500 text-lg mt-2 font-medium">{zipError}</p>
              )}
              
              {zipValidationResult?.valid && (
                <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-green-800 text-lg font-medium">
                    ✓ Valid zip code for {zipValidationResult.stateName}
                  </p>
                  {zipValidationResult.licensing.requires_license && (
                    <p className="text-green-700 text-base mt-2">
                      Note: {zipValidationResult.licensing.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={!zipCode || !zipValidationResult?.valid || isLoading}
              style={{ minHeight: '64px' }}
            >
              Continue
            </button>
          </form>
        );

      case 'phone-consent':
        // Handle phone-consent the same way as personal-info (phone + consent only)
        return (
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-gray-500 text-lg font-medium">+1</span>
                </div>
                <input
                  type="tel"
                  value={formatPhoneForInput(phone)}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Remove all non-digit characters
                    const digits = inputValue.replace(/\D/g, '');
                    // Limit to 10 digits
                    const limitedDigits = digits.slice(0, 10);
                    setPhone(limitedDigits);
                    // Validate phone in real-time
                    const state = getPhoneValidationState(limitedDigits);
                    setPhoneValidationState(state);
                    const validation = validatePhoneFormat(limitedDigits);
                    setPhoneError(validation.error || '');
                  }}
                  className={`
                    quiz-input w-full pr-12 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${phoneValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${phoneValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${phoneValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  placeholder="(555) 123-4567"
                  required
                  disabled={isLoading}
                  autoComplete="tel-national"
                  style={{ 
                    minHeight: '56px',
                    paddingLeft: '100px'
                  }}
                />
                {isValidatingPhone && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!isValidatingPhone && phoneValidationState === 'invalid' && phone && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {!isValidatingPhone && phoneValidationState === 'valid' && phone && phoneAPIValid && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {phoneValidationState === 'invalid' && phoneError && (
                <p className="text-red-600 text-sm mt-2">{phoneError}</p>
              )}
              {phoneValidationState === 'valid' && phone && !isValidatingPhone && (
                <p className="text-green-600 text-sm mt-2">✓ Phone number is valid</p>
              )}
              {phoneValidationState === 'empty' && (
                <p className="text-sm text-gray-500 mt-2">
                  We'll send a verification code to this number
                </p>
              )}
            </div>
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-2 w-6 h-6 text-[#36596A] border-2 border-gray-300 rounded focus:ring-4 focus:ring-[#36596A]/20"
                disabled={isLoading}
              />
              <label htmlFor="consent" className="text-lg text-gray-600 leading-relaxed">
                I consent to receive SMS messages and phone calls from CallReady and its partners regarding my retirement planning inquiry. Message and data rates may apply. Reply STOP to opt out.
              </label>
            </div>

            {phoneError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{phoneError}</p>
              </div>
            )}

            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={
                !phone || 
                !consentChecked || 
                phoneValidationState !== 'valid' ||
                isValidatingPhone ||
                isLoading
              }
              style={{ minHeight: '64px' }}
            >
              Continue
            </button>
          </form>
        );

      case 'coverage-amount-buttons':
        const coverageOptions = question.options as Array<{ value: number | null; label: string; description?: string; popular?: boolean }> | undefined;
        return (
          <div className="space-y-4">
            {coverageOptions?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleCoverageAmountSelect(option.value)}
                className={`quiz-button w-full p-6 text-left border-3 rounded-xl transition-all duration-200 transform active:scale-95 ${
                  selectedAnswer === option.value
                    ? 'border-[#36596A] bg-white text-[#36596A] shadow-lg'
                    : option.popular
                    ? 'border-green-300 bg-green-50 hover:border-[#36596A] hover:shadow-lg text-gray-700'
                    : 'border-gray-200 bg-white hover:border-[#36596A] hover:shadow-lg text-gray-700'
                }`}
                disabled={isLoading}
                style={{ minHeight: '80px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">💰</span>
                      <span className="font-bold text-xl text-gray-900">{option.label}</span>
                      {option.popular && (
                        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-600 ml-11">{option.description}</p>
                    )}
                  </div>
                  {selectedAnswer === option.value && (
                    <div className="w-6 h-6 bg-[#36596A] rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'yes-no':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleYesNo(false)}
              className={`quiz-button w-full p-8 text-center border-3 rounded-xl transition-all duration-200 transform active:scale-95 ${
                selectedAnswer === false
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg text-gray-700'
              }`}
              disabled={isLoading}
              style={{ minHeight: '80px' }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">✓</span>
                <span className="font-bold text-xl">No</span>
              </div>
            </button>
            <button
              onClick={() => handleYesNo(true)}
              className={`quiz-button w-full p-8 text-center border-3 rounded-xl transition-all duration-200 transform active:scale-95 ${
                selectedAnswer === true
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-lg text-gray-700'
              }`}
              disabled={isLoading}
              style={{ minHeight: '80px' }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">✗</span>
                <span className="font-bold text-xl">Yes</span>
              </div>
            </button>
            {question.reassuranceText && (
              <p className="text-sm text-gray-600 text-center mt-4 italic">
                {question.reassuranceText}
              </p>
            )}
          </div>
        );

      case 'full-name':
        return (
          <form onSubmit={handleFullNameSubmit} className="space-y-6">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                First Name *
              </label>
              <input
                type="text"
                value={fullNameFirstName}
                onChange={(e) => setFullNameFirstName(e.target.value)}
                className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isLoading}
                autoFocus
                autoComplete="given-name"
                style={{ minHeight: '56px' }}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Last Name *
              </label>
              <input
                type="text"
                value={fullNameLastName}
                onChange={(e) => setFullNameLastName(e.target.value)}
                className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                required
                disabled={isLoading}
                autoComplete="family-name"
                style={{ minHeight: '56px' }}
              />
            </div>
            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={!fullNameFirstName || !fullNameLastName || isLoading}
              style={{ minHeight: '64px' }}
            >
              Next →
            </button>
          </form>
        );

      case 'phone-only':
        return (
          <form onSubmit={handlePhoneOnlySubmit} className="space-y-6">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-gray-500 text-lg font-medium">+1</span>
                </div>
                <input
                  type="tel"
                  value={formatPhoneForInput(phone)}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const digits = inputValue.replace(/\D/g, '');
                    const limitedDigits = digits.slice(0, 10);
                    setPhone(limitedDigits);
                    const state = getPhoneValidationState(limitedDigits);
                    setPhoneValidationState(state);
                    const validation = validatePhoneFormat(limitedDigits);
                    setPhoneError(validation.error || '');
                  }}
                  className={`
                    quiz-input w-full pr-12 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all
                    ${phoneValidationState === 'empty' ? 'border-gray-300' : ''}
                    ${phoneValidationState === 'invalid' ? 'border-red-500 bg-red-50 focus:border-red-500' : ''}
                    ${phoneValidationState === 'valid' ? 'border-green-500 bg-green-50 focus:border-green-500' : ''}
                  `}
                  placeholder="(555) 123-4567"
                  required
                  disabled={isLoading}
                  autoComplete="tel-national"
                  style={{ 
                    minHeight: '56px',
                    paddingLeft: '100px'
                  }}
                />
                {isValidatingPhone && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!isValidatingPhone && phoneValidationState === 'invalid' && phone && (
                  <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
                {!isValidatingPhone && phoneValidationState === 'valid' && phone && phoneAPIValid && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {phoneValidationState === 'valid' && phone && !isValidatingPhone && phoneAPIValid && (
                <p className="text-green-600 text-sm mt-2">✓ Phone number is valid</p>
              )}
              {phoneError && (
                <p className="text-red-600 text-sm mt-2">{phoneError}</p>
              )}
            </div>
            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={
                !phone || 
                phoneValidationState !== 'valid' ||
                !phoneAPIValid ||
                isValidatingPhone ||
                isLoading
              }
              style={{ minHeight: '64px' }}
            >
              Get My Rates →
            </button>
          </form>
        );

      case 'date-of-birth-dropdowns':
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const days = generateDayOptions();
        const years = generateYearOptions();

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={dobMonth}
                  onChange={(e) => {
                    const newMonth = e.target.value;
                    setDobMonth(newMonth);
                    // Only reset day if it becomes invalid (e.g., day 31 in April)
                    if (dobDay && dobYear && !isDayValidForMonthYear(dobDay, newMonth, dobYear)) {
                      setDobDay('');
                    }
                  }}
                  className="quiz-input w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                  required
                  disabled={isLoading}
                  style={{ minHeight: '56px' }}
                >
                  <option value="">Select Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={String(index + 1).padStart(2, '0')}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Day
                </label>
                <select
                  value={dobDay}
                  onChange={(e) => {
                    setDobDay(e.target.value);
                  }}
                  className="quiz-input w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                  required
                  disabled={!dobMonth || isLoading}
                  style={{ minHeight: '56px' }}
                >
                  <option value="">Select Day</option>
                  {days.map((day) => (
                    <option key={day} value={String(day).padStart(2, '0')}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={dobYear}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    setDobYear(newYear);
                    // Only reset day if it becomes invalid (e.g., Feb 29 in non-leap year)
                    if (dobDay && dobMonth && !isDayValidForMonthYear(dobDay, dobMonth, newYear)) {
                      setDobDay('');
                    }
                  }}
                  className="quiz-input w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                  required
                  disabled={isLoading}
                  style={{ minHeight: '56px' }}
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year} (Age {new Date().getFullYear() - year})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {dobMonth && dobDay && dobYear && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-green-700 text-sm font-semibold">
                  ✓ Date of Birth: {months[parseInt(dobMonth) - 1]} {dobDay}, {dobYear}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (dobMonth && dobDay && dobYear) {
                  handleDOBChange();
                }
              }}
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!dobMonth || !dobDay || !dobYear || isLoading}
              style={{ minHeight: '64px' }}
            >
              Continue →
            </button>
          </div>
        );

      case 'zip-only':
        const validateZipOrPostalCode = (value: string): { valid: boolean; error?: string; isCanadian?: boolean } => {
          // US ZIP code: 5 digits
          const usZipRegex = /^[0-9]{5}$/;
          // Canadian postal code: A1A 1A1 or A1A1A1 (with or without space)
          const canadianPostalRegex = /^[A-Za-z][0-9][A-Za-z]\s?[0-9][A-Za-z][0-9]$/;
          
          const cleanValue = value.trim().toUpperCase();
          
          if (usZipRegex.test(cleanValue)) {
            return { valid: true, isCanadian: false };
          }
          
          if (canadianPostalRegex.test(cleanValue)) {
            // Format Canadian postal code with space: A1A 1A1
            const formatted = cleanValue.length === 6 
              ? `${cleanValue.substring(0, 3)} ${cleanValue.substring(3)}`
              : cleanValue;
            return { valid: true, isCanadian: true };
          }
          
          return { 
            valid: false, 
            error: 'Please enter a valid 5-digit US ZIP code or Canadian postal code (e.g., K1A 0B1)' 
          };
        };

        const handleZipOnlySubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          
          const validation = validateZipOrPostalCode(zipOnly);
          if (!validation.valid) {
            setZipOnlyError(validation.error || 'Invalid format');
            return;
          }
          
          // Format the value properly
          let formattedValue = zipOnly.trim().toUpperCase();
          if (validation.isCanadian && formattedValue.length === 6) {
            formattedValue = `${formattedValue.substring(0, 3)} ${formattedValue.substring(3)}`;
          }
          
          setZipOnlyError('');
          onAnswer(formattedValue);
        };

        const handleZipOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let value = e.target.value.toUpperCase();
          
          // Allow both US ZIP (numeric) and Canadian postal (alphanumeric)
          // Remove invalid characters but keep letters, numbers, and spaces
          value = value.replace(/[^A-Z0-9\s]/g, '');
          
          // Limit length: US ZIP = 5, Canadian = 7 (with space) or 6 (without)
          if (value.length > 7) {
            value = value.substring(0, 7);
          }
          
          setZipOnly(value);
          setZipOnlyError('');
          
          // Track interaction count for address_entered event
          if (value.length > 0) {
            setZipOnlyInteractionCount(prev => prev + 1);
          }
        };

        const handleZipOnlyBlur = async () => {
          // Track address_entered when user leaves the field (if valid)
          if (zipOnly && isZipValid() && sessionId) {
            const isCanadian = /^[A-Z]/.test(zipOnly);
            await trackAddressEntered({
              hasZip: true,
              hasState: false, // ZIP-only doesn't collect state
              funnelType: funnelType,
              stepNumber: stepNumber,
              fieldInteractionCount: zipOnlyInteractionCount,
              sessionId: sessionId
            });
          }
        };

        const isZipValid = () => {
          const validation = validateZipOrPostalCode(zipOnly);
          return validation.valid;
        };

        return (
          <form onSubmit={handleZipOnlySubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                ZIP Code / Postal Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={zipOnly}
                  onChange={handleZipOnlyChange}
                  onBlur={handleZipOnlyBlur}
                  className={`quiz-input w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all ${
                    zipOnlyError ? 'border-red-500 bg-red-50' : isZipValid() ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder={question.placeholder || 'Enter ZIP (12345) or Postal Code (K1A 0B1)'}
                  maxLength={7}
                  required
                  disabled={isLoading}
                  style={{ minHeight: '56px' }}
                />
                {isZipValid() && !zipOnlyError && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
                {zipOnlyError && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              
              {zipOnlyError && (
                <p className="text-red-500 text-sm mt-2">{zipOnlyError}</p>
              )}
              
              {isZipValid() && !zipOnlyError && (
                <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ {zipOnly.match(/^[A-Z]/) ? 'Postal code' : 'ZIP code'} entered
                  </p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isZipValid() || isLoading}
              style={{ minHeight: '64px' }}
            >
              Continue
            </button>
          </form>
        );

      case 'beneficiary-contact':
        const handleBeneficiaryContactSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          
          // Validate all fields
          if (!beneficiaryRelationship) {
            return;
          }
          
          const phoneDigits = extractUSPhoneNumber(beneficiaryPhone);
          if (phoneDigits.length !== 10) {
            setBeneficiaryPhoneValidationState('invalid');
            return;
          }
          
          if (beneficiaryEmailValidationState !== 'valid') {
            setBeneficiaryEmailValidationState('invalid');
            return;
          }
          
          onAnswer({
            beneficiaryRelationship,
            firstName: beneficiaryFirstName,
            lastName: beneficiaryLastName,
            email: beneficiaryEmail,
            phone: beneficiaryPhone
          });
        };

        return (
          <form onSubmit={handleBeneficiaryContactSubmit} className="space-y-8">
            {/* TrustedForm hidden input */}
            <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" value="" />
            {/* Beneficiary Relationship Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Who would receive the benefit?</h3>
                {question.subtitle && (
                  <p className="text-sm text-gray-600 mb-4">{question.subtitle}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.beneficiaryOptions?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBeneficiaryRelationship(option)}
                    className={`p-4 text-left border-2 rounded-xl transition-all ${
                      beneficiaryRelationship === option
                        ? 'border-[#36596A] bg-[#36596A] text-white'
                        : 'border-gray-300 hover:border-[#36596A] hover:bg-[#36596A]/5'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your contact information</h3>
                
                {/* Value Prop Box */}
                {question.benefits && question.benefits.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What you'll get</h4>
                    <ul className="space-y-2">
                      {question.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={beneficiaryFirstName}
                    onChange={(e) => setBeneficiaryFirstName(e.target.value)}
                    className="quiz-input w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                    required
                    disabled={isLoading}
                    style={{ minHeight: '56px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={beneficiaryLastName}
                    onChange={(e) => setBeneficiaryLastName(e.target.value)}
                    className="quiz-input w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                    required
                    disabled={isLoading}
                    style={{ minHeight: '56px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={beneficiaryEmail}
                    onChange={(e) => {
                      setBeneficiaryEmail(e.target.value);
                      const state = getEmailValidationState(e.target.value);
                      setBeneficiaryEmailValidationState(state);
                    }}
                    className={`quiz-input w-full px-4 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all ${
                      beneficiaryEmailValidationState === 'invalid' && beneficiaryEmail
                        ? 'border-red-500 bg-red-50'
                        : beneficiaryEmailValidationState === 'valid'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                    style={{ minHeight: '56px' }}
                  />
                  {beneficiaryEmailValidationState === 'valid' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  {beneficiaryEmailValidationState === 'invalid' && beneficiaryEmail && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {emailError && beneficiaryEmail && (
                  <p className="text-red-500 text-sm mt-2">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <span className="text-gray-500 text-lg font-medium">+1</span>
                  </div>
                  <input
                    type="tel"
                    value={formatPhoneForInput(beneficiaryPhone)}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const digits = inputValue.replace(/\D/g, '').slice(0, 10);
                      setBeneficiaryPhone(digits);
                      const state = getPhoneValidationState(digits);
                      setBeneficiaryPhoneValidationState(state);
                    }}
                    className={`quiz-input w-full pl-12 pr-4 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all ${
                      beneficiaryPhoneValidationState === 'invalid' && beneficiaryPhone
                        ? 'border-red-500 bg-red-50'
                        : beneficiaryPhoneValidationState === 'valid'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                    required
                    disabled={isLoading}
                    style={{ minHeight: '56px' }}
                  />
                  {beneficiaryPhoneValidationState === 'valid' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  {beneficiaryPhoneValidationState === 'invalid' && beneficiaryPhone && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {phoneError && beneficiaryPhone && (
                  <p className="text-red-500 text-sm mt-2">{phoneError}</p>
                )}
              </div>

              {/* Consent Text */}
              {question.consentText && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{question.consentText}</p>
                </div>
              )}

              <button
                type="submit"
                className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-[#2a4a5a] transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !beneficiaryRelationship ||
                  !beneficiaryFirstName ||
                  !beneficiaryLastName ||
                  !beneficiaryEmail ||
                  beneficiaryEmailValidationState !== 'valid' ||
                  !beneficiaryPhone ||
                  beneficiaryPhoneValidationState !== 'valid' ||
                  isLoading
                }
                style={{ minHeight: '64px' }}
              >
                Get Your Free Quote
              </button>
            </div>
          </form>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-8 pt-6">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{question.title}</h2>
        {question.subtitle && (
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">{question.subtitle}</p>
        )}
        {/* Show prompt if provided (for smoker question) */}
        {question.prompt && (
          <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-4 mb-2">{question.prompt}</p>
        )}
        {/* Show microcopy if provided (for smoker question) */}
        {question.microcopy && (
          <p className="text-sm text-gray-600 mt-2 mb-4">{question.microcopy}</p>
        )}
      </div>
      
      {renderQuestion()}
    </div>
  );
};