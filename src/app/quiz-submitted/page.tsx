'use client'

// Note: This is a client component, so it's already dynamically rendered
// No need for dynamic/revalidate exports which are server-only

import { useEffect, useState } from 'react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking'
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
  const [videoListenersReady, setVideoListenersReady] = useState(false);

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

  // Attach Vimeo player event listeners for engagement logging
  useEffect(() => {
    if (!isClient) return
    if (videoListenersReady) return

    const setupPlayers = () => {
      try {
        // @ts-ignore
        const Vimeo = (window as any).Vimeo
        if (!Vimeo || !Vimeo.Player) {
          console.warn('⚠️ Vimeo Player API not available yet')
          return false
        }

        const iframes = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe.vimeo-track'))
        if (!iframes.length) return false

        iframes.forEach((iframe, idx) => {
          const player = new Vimeo.Player(iframe)
          const label = iframe.title || `vimeo-video-${idx}`

          player.on('play', () => console.log(`▶️ Play: ${label}`))
          player.on('pause', () => console.log(`⏸️ Pause: ${label}`))
          player.on('ended', () => console.log(`🏁 Ended: ${label}`))
          player.on('timeupdate', (data: any) => {
            const t = Math.floor(data.seconds || 0)
            if (t % 10 === 0) {
              console.log(`⏱️ Progress ${label}: ${t}s`)
            }
          })
        })

        return true
      } catch (e) {
        console.warn('⚠️ Could not attach Vimeo listeners', e)
        return false
      }
    }

    const ok = setupPlayers()
    if (ok) {
      setVideoListenersReady(true)
      return
    }

    const retry = setTimeout(() => {
      if (setupPlayers()) setVideoListenersReady(true)
    }, 1000)

    return () => clearTimeout(retry)
  }, [isClient, videoListenersReady])

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
  const [appointmentData, setAppointmentData] = useState<{
    appointmentId?: string;
    startTime?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    // Load appointment data from storage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('appointment_data') || localStorage.getItem('appointment_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setAppointmentData(data);
          
          // Track booking-confirmed GA4 event when appointment data exists
          if (data.startTime || data.appointmentId) {
            trackGA4Event('booking-confirmed', {
              appointment_id: data.appointmentId || 'unknown',
              appointment_time: data.startTime || 'unknown',
              email: data.email || quizAnswers?.personalInfo?.email || 'unknown',
              phone: data.phone || quizAnswers?.personalInfo?.phone || 'unknown',
              name: data.name || `${quizAnswers?.personalInfo?.firstName || ''} ${quizAnswers?.personalInfo?.lastName || ''}`.trim() || 'unknown',
              confirmation_page: 'quiz-submitted'
            });
          }
        } catch (error) {
          console.warn('Failed to parse appointment data:', error);
        }
      }
    }
  }, [quizAnswers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAppointmentTime = (timeString?: string) => {
    if (!timeString) return null;
    
    try {
      // Try parsing ISO 8601 format or other common formats
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString; // Return as-is if can't parse
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      }).format(date);
    } catch (error) {
      return timeString; // Return as-is if parsing fails
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Success notification bar */}
      <div className="w-full bg-green-100 border-b border-green-300 text-green-900 text-sm py-3 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2f6d46]">
          Congratulations, {firstName} - Here are Your Next Steps
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Appointment Confirmation Message */}
        {appointmentData?.startTime && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-[#36596A]">
                Your Appointment is Confirmed!
              </h2>
            </div>
            <p className="text-lg text-gray-700">
              Scheduled for: <span className="font-semibold text-[#2f6d46]">{formatAppointmentTime(appointmentData.startTime)}</span>
            </p>
            {appointmentData.appointmentId && (
              <p className="text-sm text-gray-500 mt-2">
                Confirmation ID: {appointmentData.appointmentId}
              </p>
            )}
          </div>
        )}

        {/* Main Thank You Video - Large Container */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-2xl font-semibold text-[#36596A] mb-4 text-center">
            Watch This Important Video
          </h3>
          <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
            <iframe
              className="vimeo-track"
              src="https://player.vimeo.com/video/1144021770?badge=0&autopause=0&player_id=0&app_id=58479"
              frameBorder={0}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title="Retirement Rescue Thank You"
            />
          </div>
          <div className="flex justify-center mt-4">
            <div className="animate-bounce text-[#36596A]" aria-hidden="true">
              ↓
            </div>
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
                </div>
              </div>
            </div>

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
                  className="vimeo-track"
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
                  className="vimeo-track"
                  src="https://player.vimeo.com/video/1144021743?badge=0&autopause=0&player_id=0&app_id=58479"
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
                How is this different from traditional advice
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
                Is there a catch?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
                Will this help me leave a legacy for my family?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
                Is this one of those annuity things?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
                Is this life insurance disguised as a retirement plan?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
                Will I still have access to my money?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
                Is this actually safe?
              </h4>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  className="vimeo-track"
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
