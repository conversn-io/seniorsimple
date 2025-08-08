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
    <div className="bg-white p-8 rounded-lg shadow-sm border">
      <h3 className="text-2xl font-serif font-semibold mb-4 text-[#36596A]">
        Stay Informed
      </h3>
      <p className="text-gray-600 mb-6">
        Get the latest retirement insights and expert advice delivered to your inbox.
      </p>
      
      <form onSubmit={handleNewsletterSignup} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-transparent"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#36596A] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2a4a5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </button>
      </form>

      {newsletterStatus.message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          newsletterStatus.success 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {newsletterStatus.message}
        </div>
      )}
    </div>
  )
}
