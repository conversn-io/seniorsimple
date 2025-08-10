'use client'

import { useState } from 'react'
import { signUpForNewsletter } from '../lib/newsletter'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<{ success?: boolean; message?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setNewsletterStatus({})
    
    try {
      const result = await signUpForNewsletter(email, 'seniorsimple-homepage')
      setNewsletterStatus(result)
      
      if (result.success) {
        setEmail('')
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      setNewsletterStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card-enhanced generous-spacing">
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-6 text-[#36596A] senior-friendly-text">
        Stay Informed
      </h3>
      <p className="text-gray-600 mb-8 senior-friendly-text">
        Get the latest retirement insights and expert advice delivered to your inbox.
      </p>
      
      <form onSubmit={handleNewsletterSignup} className="space-y-6">
        <div>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A] focus:ring-opacity-20 focus:border-[#36596A] transition-all duration-300 senior-friendly-text touch-target"
            required
            aria-describedby={newsletterStatus.message ? "newsletter-status" : undefined}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-accessible w-full bg-[#36596A] text-white hover:bg-[#2a4a5a] focus-visible:ring-2 focus-visible:ring-[#36596A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none text-lg py-4"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          ) : (
            'Subscribe to Newsletter'
          )}
        </button>
      </form>

      {newsletterStatus.message && (
        <div 
          id="newsletter-status"
          className={`mt-6 p-4 rounded-xl text-base senior-friendly-text ${
            newsletterStatus.success 
              ? 'bg-green-50 text-green-800 border-2 border-green-200' 
              : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}
          role="alert"
          aria-live="polite"
        >
          {newsletterStatus.message}
        </div>
      )}
    </div>
  )
}
