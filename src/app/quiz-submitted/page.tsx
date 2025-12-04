'use client'

import { useEffect, useState } from 'react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'
import { FAQ } from '@/components/quiz/FAQ'
import { CheckCircle, Mail, Clock, FileText } from 'lucide-react'

interface QuizAnswers {
  firstName?: string;
  lastName?: string;
  ageRange?: string;
  retirementTimeline?: string;
  retirementTiming?: string;
  riskTolerance?: string;
  retirementSavings?: number;
  allocationPercent?: any;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  phone?: string;
  locationInfo?: {
    zipCode?: string;
    state?: string;
    stateName?: string;
  };
  [key: string]: any;
}

export default function QuizSubmittedPage() {
  useFunnelLayout() // Sets header and footer to 'funnel'
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);

  useEffect(() => {
    initializeTracking()
    trackPageView('Quiz Submitted', '/quiz-submitted')
    
    // Get quiz answers from sessionStorage
    const storedAnswers = sessionStorage.getItem('quiz_answers');
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers);
        setQuizAnswers(answers);
        console.log('📋 Quiz Answers Retrieved:', answers);
      } catch (error) {
        console.error('❌ Error parsing quiz answers:', error);
      }
    }
  }, [])

  // If we have quiz answers, show personalized message
  if (quizAnswers) {
    return <PersonalizedQuizSubmitted quizAnswers={quizAnswers} />
  }

  // Fallback to basic thank you
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-serif font-semibold text-[#36596A] mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600">
            We'll be in touch soon.
          </p>
        </div>
      </div>
    </div>
  )
}

function PersonalizedQuizSubmitted({ quizAnswers }: { quizAnswers: QuizAnswers }) {
  const firstName = quizAnswers.personalInfo?.firstName || quizAnswers.firstName || 'there';
  const retirementSavings = quizAnswers.retirementSavings;
  const ageRange = quizAnswers.ageRange;
  const retirementTimeline = quizAnswers.retirementTimeline || quizAnswers.retirementTiming;
  const riskTolerance = quizAnswers.riskTolerance;
  const zipCode = quizAnswers.locationInfo?.zipCode;
  const state = quizAnswers.locationInfo?.stateName || quizAnswers.locationInfo?.state;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - Updated per requirements */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <h1 className="text-3xl font-serif font-semibold text-[#36596A] mb-4">
            Congratulations, {firstName} - Here are Your Next Steps
          </h1>
          <h2 className="text-xl font-medium text-gray-700 mb-6">
            Thanks for booking a call! You're one step closer to achieving your retirement goals.
          </h2>
        </div>

        {/* Video Embed Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-[#36596A] mb-4 text-center">
            Watch This Important Video
          </h3>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Video embed will be added here</p>
            {/* TODO: Add video embed when URL is provided */}
            {/* <iframe 
              src="VIDEO_URL_HERE"
              className="w-full h-full rounded-lg"
              allowFullScreen
            /> */}
          </div>
        </div>

        {/* Almost Done Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-[#36596A] mb-4">
            <strong>Almost Done</strong>: Follow The Steps to Confirm Your Call
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#36596A] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 1: Press "I know the sender" button in the event email we just sent you!
                </h4>
                <div className="bg-gray-100 rounded-lg p-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Check your email inbox for a calendar confirmation. Click the "I know the sender" button to confirm your appointment.
                  </p>
                  {/* TODO: Add email screenshot image when provided */}
                </div>
              </div>
            </div>

            {/* Step 2 - Only for Business Loans (not applicable here, but structure ready) */}
            {/* <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#36596A] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 2: Upload your bank statements
                </h4>
                <p className="text-gray-600">
                  (For Business loans or Bank Statement Loans)
                </p>
              </div>
            </div> */}

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#36596A] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 2: Confirm your information is accurate
                </h4>
                <div className="bg-[#F5F5F0] rounded-lg p-6 mt-2">
                  <h5 className="font-semibold text-[#36596A] mb-4">Your Retirement Profile</h5>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {ageRange && (
                      <div>
                        <span className="font-medium text-gray-700">Age Range:</span>
                        <span className="ml-2 text-gray-600">{ageRange}</span>
                      </div>
                    )}
                    {retirementTimeline && (
                      <div>
                        <span className="font-medium text-gray-700">Retirement Timeline:</span>
                        <span className="ml-2 text-gray-600">{retirementTimeline}</span>
                      </div>
                    )}
                    {riskTolerance && (
                      <div>
                        <span className="font-medium text-gray-700">Risk Tolerance:</span>
                        <span className="ml-2 text-gray-600">{riskTolerance}</span>
                      </div>
                    )}
                    {retirementSavings && (
                      <div>
                        <span className="font-medium text-gray-700">Retirement Savings:</span>
                        <span className="ml-2 text-gray-600">{formatCurrency(retirementSavings)}</span>
                      </div>
                    )}
                    {zipCode && (
                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="ml-2 text-gray-600">{zipCode}{state ? `, ${state}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#36596A] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 3: Pre-Call Checklist
                </h4>
                <div className="space-y-3 mt-2">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#36596A] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Communication:</p>
                      <p className="text-gray-600 text-sm">
                        Check your e-mail for calendar invites. Be sure to respond to text messages sent directly by the team!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#36596A] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Punctuality:</p>
                      <p className="text-gray-600 text-sm">
                        We'll be on time for the call, make sure you are as well.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#36596A] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Information:</p>
                      <p className="text-gray-600 text-sm">
                        Come armed with whatever questions you have. We want you to be able to make an informed decision, regardless if you work with us or not.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <FAQ />
        </div>
      </div>
    </div>
  )
}
