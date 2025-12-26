'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, Calendar } from 'lucide-react'

export default function RetirementRescueFollowUpPage() {
  useEffect(() => {
    document.title = "A Special Message From Retirement Rescue - SeniorSimple"
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', "Watch this special message from Retirement Rescue and schedule your discovery session to see if you qualify for retirement protection.")
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header Alert Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          ATTENTION: AMERICANS WITH MORE THAN $250K IN RETIREMENT SAVINGS
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#36596A] to-[#2a4a5a] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              A Special Message From Retirement Rescue
            </h1>
            <div className="w-32 h-1 bg-orange-300 mx-auto mb-8"></div>
          </div>

          {/* Video Embed */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1149255170?title=0&byline=0&portrait=0&autoplay=0"
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="A Special Message From Retirement Rescue"
              ></iframe>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/booking"
              className="inline-flex items-center space-x-3 bg-orange-300 text-[#36596A] px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Calendar className="w-6 h-6" />
              <span>Schedule Your Discovery Session</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Protect Your Retirement?
          </h2>
          <div className="w-24 h-1 bg-[#36596A] mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 mb-8">
            Schedule your complimentary discovery session to see if you qualify for Retirement Rescue™ protection. 
            Our licensed advisors will help you understand if this strategy is right for your situation.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center space-x-3 bg-[#36596A] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2a4a5a] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Calendar className="w-6 h-6" />
            <span>Schedule Your Discovery Session</span>
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-sm text-gray-600">
          <h3 className="font-bold text-[#36596A] mb-2 text-base">IMPORTANT DISCLAIMER</h3>
          <p className="mb-4">
            This content is for educational purposes only and does not constitute financial advice. Retirement Rescue strategies using indexed annuities are not suitable for everyone. A licensed advisor must conduct a suitability review to determine if these strategies are appropriate for your situation. Past performance does not guarantee future results.
          </p>
          <p className="text-xs text-gray-500">
            Insurance products are backed by the financial strength and claims-paying ability of the issuing insurance company. Withdrawals may be subject to surrender charges and tax implications. Please consult with a qualified professional before making any financial decisions.
          </p>
        </div>
      </section>
    </div>
  )
}

