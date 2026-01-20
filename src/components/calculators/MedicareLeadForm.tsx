'use client'

import { useState } from 'react'
import { Phone, Mail, User, MapPin, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MedicareLeadFormProps {
  calculatorResults?: {
    totalAnnualCost?: number
    monthlyPremiums?: number
    [key: string]: any
  }
  onSuccess?: () => void
}

export default function MedicareLeadForm({ calculatorResults, onSuccess }: MedicareLeadFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    preferredContact: 'phone' as 'phone' | 'email'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!formData.zipCode.trim()) {
      setError('Zip code is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get UTM params from session storage if available
      const utmStorage = sessionStorage.getItem('seniorsimple_utm')
      const utmParams = utmStorage ? JSON.parse(utmStorage) : {}

      const payload = {
        ...formData,
        calculatorResults,
        source: 'medicare_calculator',
        landingPage: window.location.href,
        ...utmParams
      }

      // Submit to API
      const response = await fetch('/api/leads/medicare-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Submission failed')
      }

      const result = await response.json()

      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'medicare_calculator_lead_submitted', {
          event_category: 'lead_generation',
          event_label: 'medicare_calculator',
          value: calculatorResults?.totalAnnualCost || 0
        })
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to thank you page
        router.push(`/thank-you?source=medicare-calculator&leadId=${result.leadId || ''}`)
      }
    } catch (err: any) {
      setError(err.message || 'There was an error submitting your information. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-[#36596A]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#36596A] mb-2">
          Get Your Personalized Medicare Plan Quote
        </h2>
        <p className="text-gray-600">
          Connect with a licensed Medicare advisor to discuss your options
        </p>
        {calculatorResults?.totalAnnualCost && (
          <p className="text-lg font-semibold text-[#36596A] mt-2">
            Your estimated annual cost: ${calculatorResults.totalAnnualCost.toLocaleString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Zip Code *
          </label>
          <input
            type="text"
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="12345"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Method *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="preferredContact"
                value="phone"
                checked={formData.preferredContact === 'phone'}
                onChange={(e) => handleChange('preferredContact', e.target.value)}
                className="mr-2"
              />
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="preferredContact"
                value="email"
                checked={formData.preferredContact === 'email'}
                onChange={(e) => handleChange('preferredContact', e.target.value)}
                className="mr-2"
              />
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#36596A] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2a4a5a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Get My Free Quote
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to be contacted by licensed Medicare advisors.
          Your information is secure and will never be sold.
        </p>
      </form>
    </div>
  )
}

