'use client'

// Note: This is a client component, so it's already dynamically rendered
// No need for dynamic/revalidate exports which are server-only

import { useEffect, useState } from 'react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'
import { CheckCircle } from 'lucide-react'
import Script from 'next/script'

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
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    initializeTracking()
    trackPageView('Quiz Submitted', '/quiz-submitted')
    
    // Get quiz answers from sessionStorage (only on client)
    const loadQuizAnswers = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 QUIZ-SUBMITTED PAGE: Checking for quiz_answers');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Try multiple times with increasing delays to catch data that might be stored asynchronously
      let attemptCount = 0;
      const maxAttempts = 5;
      const attemptDelays = [0, 100, 300, 500, 1000]; // Try immediately, then with delays

      const tryLoadAnswers = (delay: number) => {
        setTimeout(() => {
          attemptCount++;
          
          // Try sessionStorage first (primary source)
          let storedAnswers = sessionStorage.getItem('quiz_answers');
          
          // If not in sessionStorage, try localStorage as fallback (persists across redirects)
          if (!storedAnswers) {
            storedAnswers = localStorage.getItem('quiz_answers');
            if (storedAnswers) {
              console.log('📦 Found quiz_answers in localStorage (sessionStorage was empty)');
              // Restore to sessionStorage for consistency
              try {
                sessionStorage.setItem('quiz_answers', storedAnswers);
              } catch (e) {
                console.warn('⚠️ Could not restore to sessionStorage:', e);
              }
            }
          }
          
          console.log(`📋 Attempt ${attemptCount}/${maxAttempts} (delay: ${delay}ms):`, {
            found: !!storedAnswers,
            length: storedAnswers?.length || 0,
            source: storedAnswers ? (sessionStorage.getItem('quiz_answers') ? 'sessionStorage' : 'localStorage') : 'none'
          });

          if (storedAnswers) {
            try {
              const answers = JSON.parse(storedAnswers);
              console.log('✅ quiz_answers successfully parsed:', {
                hasPersonalInfo: !!answers.personalInfo,
                hasRetirementSavings: !!answers.retirementSavings,
                keys: Object.keys(answers)
              });
              setQuizAnswers(answers);
              setIsLoading(false);
              return; // Success, stop trying
            } catch (error) {
              console.error('❌ Error parsing quiz answers:', error);
              if (attemptCount >= maxAttempts) {
                setIsLoading(false);
              }
            }
          } else {
            // If not found and we haven't exhausted attempts, try again
            if (attemptCount < maxAttempts) {
              const nextDelay = attemptDelays[attemptCount] || 1000;
              tryLoadAnswers(nextDelay);
            } else {
              console.warn('⚠️ quiz_answers not found after all attempts');
              console.log('📋 All sessionStorage keys:', Object.keys(sessionStorage));
              console.log('📋 All localStorage keys:', Object.keys(localStorage));
              setIsLoading(false);
            }
          }
        }, delay);
      };

      // Start trying immediately
      tryLoadAnswers(0);
    };

    loadQuizAnswers();
  }, [])

  // Timeout fallback: if loading takes too long, show content anyway
  useEffect(() => {
    if (isLoading && isClient) {
      const timeout = setTimeout(() => {
        console.warn('⏱️ Loading timeout - showing content anyway');
        setIsLoading(false);
      }, 3000); // 3 second max loading time
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading, isClient]);

  // Show loading state only during initial client-side mount or while actively loading
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  // If we have quiz answers, show personalized message with videos
  // If no answers found (e.g. cross-domain redirect), still show the enhanced page with defaults
  const displayAnswers = quizAnswers || {};
  return <PersonalizedQuizSubmitted quizAnswers={displayAnswers} />
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
            You're one step closer to achieving your retirement goals.
          </h2>
        </div>

        {/* Main Thank You Video - Large Container */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-[#36596A] mb-4 text-center">
            Watch This Important Video
          </h3>
          <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
            <iframe
              src="https://player.vimeo.com/video/1144021770?badge=0&autopause=0&player_id=0&app_id=58479"
              frameBorder={0}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title="Retirement Rescue Thank You"
            />
          </div>
        </div>

        {/* Almost Done Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-[#36596A] mb-4">
            <strong>Almost Done</strong>: Follow The Steps to Confirm Your Call
          </h3>
          <p className="text-gray-600 mb-6">
            {typeof window !== 'undefined' && sessionStorage.getItem('landing_page') === '/quiz-book' 
              ? 'You\'ve booked your call! Now follow these steps to confirm your appointment.'
              : 'We\'ll be reaching out to you soon. Here\'s what to expect next.'}
          </p>
          
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

        {/* FAQ Videos Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-[#36596A] mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-8">
            {/* FAQ 1 - Will I be pressured or sold to? */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Will I be pressured or sold to?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021752?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ 1 - Will I be pressured or sold to?"
                />
              </div>
            </div>

            {/* RR-FAQ-What Actually Happens On the Call? */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                What Actually Happens On the Call?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021752?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="RR-FAQ-What Actually Happens On the Call?"
                />
              </div>
            </div>

            {/* FAQ_Different_Advice */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Different Advice
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021738?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_Different_Advice"
                />
              </div>
            </div>

            {/* FAQ_Free_Call */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Free Call
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021733?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_Free_Call"
                />
              </div>
            </div>

            {/* FAQ_Legacy */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Legacy
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144022764?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_Legacy"
                />
              </div>
            </div>

            {/* FAQ_Is_Annuity */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Is Annuity
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021726?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_Is_Annuity"
                />
              </div>
            </div>

            {/* FAQ_IUL */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                IUL
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021718?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_IUL"
                />
              </div>
            </div>

            {/* FAQ_Lockup_Concern */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Lockup Concern
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021708?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_Lockup_Concern"
                />
              </div>
            </div>

            {/* FAQ_Safety_Concern */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Safety Concern
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://player.vimeo.com/video/1144021702?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder={0}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="FAQ_Safety_Concern"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vimeo Player Script - Load once for all videos */}
      <Script src="https://player.vimeo.com/api/player.js" strategy="afterInteractive" />
    </div>
  )
}
