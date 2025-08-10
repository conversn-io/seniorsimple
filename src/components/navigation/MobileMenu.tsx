"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const mobileMenuItems = [
  {
    title: "Retirement",
    href: "/retirement",
    items: [
      { name: "Retirement Savings Calculator", href: "/assessment/retirement-planning" },
      { name: "Social Security Calculator", href: "/calculators/social-security" },
      { name: "Investment Growth Calculator", href: "/calculators/investment-growth" },
      { name: "Complete Retirement Guide", href: "/resources/ebook" },
    ]
  },
  {
    title: "Estate Planning",
    href: "/estate",
    items: [
      { name: "Estate Planning Checklist", href: "/resources/estate-planning-checklist" },
      { name: "Will & Trust Guide", href: "/resources/will-trust-guide" },
      { name: "Beneficiary Planner", href: "/tools/beneficiary-planner" },
    ]
  },
  {
    title: "Health & Medicare",
    href: "/health",
    items: [
      { name: "Medicare Cost Calculator", href: "/calculators/medicare-costs" },
      { name: "Medicare Enrollment Guide", href: "/resources/medicare-guide" },
      { name: "Long-Term Care Guide", href: "/resources/long-term-care" },
    ]
  },
  {
    title: "Housing",
    href: "/housing",
    items: [
      { name: "Reverse Mortgage Calculator", href: "/calculators/reverse-mortgage" },
      { name: "Downsizing Calculator", href: "/calculators/downsizing" },
      { name: "Aging in Place Guide", href: "/resources/aging-in-place" },
    ]
  },
  {
    title: "Tax Planning",
    href: "/tax",
    items: [
      { name: "Tax Impact Calculator", href: "/calculators/tax-impact" },
      { name: "Roth Conversion Calculator", href: "/calculators/roth-conversion" },
      { name: "Tax Strategy Guide", href: "/resources/tax-strategy" },
    ]
  },
  {
    title: "Insurance",
    href: "/insurance",
    items: [
      { name: "Life Insurance Calculator", href: "/assessment/life-insurance" },
      { name: "Long-Term Care Calculator", href: "/calculators/ltc-insurance" },
      { name: "Life Insurance Guide", href: "/resources/life-insurance-guide" },
    ]
  },
]

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target p-3 text-gray-600 hover:text-[#36596A] transition-colors focus-visible-enhanced rounded-lg hover:bg-gray-50"
        aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300" 
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div 
            className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#36596A] senior-friendly-text">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="touch-target p-3 text-gray-600 hover:text-[#36596A] transition-colors focus-visible-enhanced rounded-lg hover:bg-gray-50"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Menu items */}
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2">
                  {mobileMenuItems.map((item) => (
                    <div key={item.title} className="px-6">
                      <Link
                        href={item.href}
                        className="block py-4 text-xl font-medium text-[#36596A] hover:text-[#2a4a5a] transition-colors touch-target focus-visible-enhanced rounded-lg senior-friendly-text hover:bg-gray-50 px-2 -mx-2"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                      <div className="ml-6 space-y-1 mt-2">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-3 text-base text-gray-600 hover:text-[#36596A] transition-colors touch-target focus-visible-enhanced rounded-lg senior-friendly-text hover:bg-gray-50 px-2 -mx-2"
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <Link
                    href="/contact"
                    className="btn-accessible w-full bg-[#36596A] text-white hover:bg-[#2a4a5a] focus-visible:ring-2 focus-visible:ring-[#36596A] focus-visible:ring-offset-2 text-lg py-4 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
