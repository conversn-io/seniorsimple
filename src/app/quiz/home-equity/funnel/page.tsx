'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Phone, ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizAnswers {
  property_value?: string;
  current_mortgage?: string;
  credit_score?: string;
  monthly_income?: string;
  intended_use?: string;
  contact_info?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  phone_number?: string;
  zip_code?: string;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export default function HomeEquityFunnelPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const questions = [
    {
      id: 'property_value',
      title: 'What is your home\'s current value?',
      subtitle: 'This helps us calculate your available equity',
      type: 'multiple_choice',
      options: [
        { value: '0-100k', label: 'Under $100,000' },
        { value: '100k-200k', label: '$100,000 - $200,000' },
        { value: '200k-300k', label: '$200,000 - $300,000' },
        { value: '300k-500k', label: '$300,000 - $500,000' },
        { value: '500k-750k', label: '$500,000 - $750,000' },
        { value: '750k-1m', label: '$750,000 - $1,000,000' },
        { value: '1m-1.5m', label: '$1,000,000 - $1,500,000' },
        { value: 'over-1.5m', label: 'Over $1,500,000' }
      ]
    },
    {
      id: 'current_mortgage',
      title: 'How much do you still owe on your mortgage?',
      subtitle: 'We need this to calculate your available equity',
      type: 'multiple_choice',
      options: [
        { value: 'under-100k', label: 'Under $100,000' },
        { value: '100k-200k', label: '$100,000 - $200,000' },
        { value: '200k-300k', label: '$200,000 - $300,000' },
        { value: '300k-500k', label: '$300,000 - $500,000' },
        { value: 'over-500k', label: 'Over $500,000' },
        { value: 'no-mortgage', label: 'No mortgage (paid off)' }
      ]
    },
    {
      id: 'credit_score',
      title: 'What is your credit score range?',
      subtitle: 'This helps us find the best rates for you',
      type: 'multiple_choice',
      options: [
        { value: '300-579', label: '300-579 (Poor)' },
        { value: '580-669', label: '580-669 (Fair)' },
        { value: '670-739', label: '670-739 (Good)' },
        { value: '740-799', label: '740-799 (Very Good)' },
        { value: '800-850', label: '800-850 (Excellent)' },
        { value: 'not-sure', label: 'Not sure' }
      ]
    },
    {
      id: 'monthly_income',
      title: 'What is your monthly household income?',
      subtitle: 'This helps us determine your loan capacity',
      type: 'multiple_choice',
      options: [
        { value: 'under-3k', label: 'Under $3,000' },
        { value: '3k-5k', label: '$3,000 - $5,000' },
        { value: '5k-8k', label: '$5,000 - $8,000' },
        { value: '8k-12k', label: '$8,000 - $12,000' },
        { value: '12k-20k', label: '$12,000 - $20,000' },
        { value: 'over-20k', label: 'Over $20,000' }
      ]
    },
    {
      id: 'intended_use',
      title: 'What do you plan to use the funds for?',
      subtitle: 'This helps us recommend the best loan type',
      type: 'multiple_choice',
      options: [
        { value: 'home-improvement', label: 'Home improvements' },
        { value: 'debt-consolidation', label: 'Debt consolidation' },
        { value: 'investment', label: 'Investment opportunities' },
        { value: 'education', label: 'Education expenses' },
        { value: 'emergency-fund', label: 'Emergency fund' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'contact_info',
      title: 'Let\'s get your contact information',
      subtitle: 'We\'ll use this to send you personalized results',
      type: 'contact'
    },
    {
      id: 'location_info',
      title: 'What\'s your ZIP code?',
      subtitle: 'We need this to check lending availability in your area',
      type: 'zip_input'
    },
    {
      id: 'phone_verification',
      title: 'Verify your phone number',
      subtitle: 'We\'ll text you your personalized home equity options',
      type: 'phone_input'
    }
  ];

  const currentQuestion = questions[currentStep];

  const getPropertyValue = (value?: string) => {
    const ranges: Record<string, number> = {
      '0-100k': 75000,
      '100k-200k': 150000,
      '200k-300k': 250000,
      '300k-500k': 400000,
      '500k-750k': 625000,
      '750k-1m': 875000,
      '1m-1.5m': 1250000,
      'over-1.5m': 1750000
    };
    return ranges[value || ''] || 0;
  };

  const getCurrentMortgage = (value?: string) => {
    const ranges: Record<string, number> = {
      'under-100k': 75000,
      '100k-200k': 150000,
      '200k-300k': 250000,
      '300k-500k': 400000,
      'over-500k': 600000,
      'no-mortgage': 0
    };
    return ranges[value || ''] || 0;
  };

  const calculateAvailableEquity = () => {
    const propertyValue = getPropertyValue(answers.property_value);
    const currentMortgage = getCurrentMortgage(answers.current_mortgage);
    return Math.max(0, propertyValue - currentMortgage);
  };

  const handleAnswer = async (value: string) => {
    if (currentQuestion?.type === 'multiple_choice') {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleContactSubmit = async () => {
    // Validate contact info
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email) {
      alert('Please fill in all contact fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Save contact info to answers
    setAnswers(prev => ({
      ...prev,
      contact_info: contactInfo
    }));

    // Capture email for retargeting
    try {
      const response = await fetch('/api/leads/capture-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contactInfo.email,
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          quizAnswers: answers,
          sessionId,
          funnelType: 'rateroots_home_equity_quiz',
          zipCode: zipCode,
          licensingInfo: null
        }),
      });

      if (!response.ok) {
        console.error('Failed to capture email for retargeting');
      }
    } catch (error) {
      console.error('Error capturing email:', error);
    }

    // Proceed to next step
    setCurrentStep(prev => prev + 1);
  };

  const handleZipSubmit = () => {
    if (!zipCode || zipCode.length !== 5) {
      alert('Please enter a valid 5-digit ZIP code');
      return;
    }

    setAnswers(prev => ({
      ...prev,
      zip_code: zipCode
    }));

    setCurrentStep(prev => prev + 1);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    setAnswers(prev => ({
      ...prev,
      phone_number: phoneNumber
    }));

    // Here you would integrate with phone verification service
    // For now, we'll just show the confirmation
    setShowConfirmation(true);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
              <p className="text-lg text-gray-700 mb-6">
                We'll be texting you now with your personalized home equity options.
              </p>
            </div>

            {/* Key Information Display */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Home Equity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <p className="text-gray-600">Location:</p>
                  <p className="font-semibold text-gray-900">{zipCode}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">Home Value:</p>
                  <p className="font-semibold text-gray-900">${getPropertyValue(answers.property_value)?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">Current Mortgage:</p>
                  <p className="font-semibold text-gray-900">${getCurrentMortgage(answers.current_mortgage)?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">Available Equity:</p>
                  <p className="font-semibold text-green-600">${calculateAvailableEquity()?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">What's Next?</h4>
              <p className="text-blue-700 mb-4">
                We'll be texting you now with your personalized home equity options and next steps.
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Phone className="h-5 w-5" />
                <span className="font-medium">Check your phone for our message!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentQuestion?.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {currentQuestion?.subtitle}
            </p>

            {/* Multiple Choice Questions */}
            {currentQuestion?.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Contact Form */}
            {currentQuestion?.type === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={contactInfo.firstName}
                    onChange={(e) => setContactInfo(prev => ({...prev, firstName: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={contactInfo.lastName}
                    onChange={(e) => setContactInfo(prev => ({...prev, lastName: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="text-sm text-gray-600">
                  <p>We'll use this information to send you personalized home equity options.</p>
                </div>
                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}

            {/* ZIP Code Input */}
            {currentQuestion?.type === 'zip_input' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-medium"
                  maxLength={5}
                />
                <button
                  onClick={handleZipSubmit}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}

            {/* Phone Input */}
            {currentQuestion?.type === 'phone_input' && (
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-medium"
                  maxLength={10}
                />
                <div className="text-sm text-gray-600 text-center">
                  <p>We'll send you a text with your personalized results</p>
                </div>
                <button
                  onClick={handlePhoneSubmit}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  Get My Results
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}