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
        className="p-2 text-gray-600 hover:text-[#36596A] transition-colors"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#36596A]">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 hover:text-[#36596A] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1">
                  {mobileMenuItems.map((item) => (
                    <div key={item.title} className="px-4">
                      <Link
                        href={item.href}
                        className="block py-3 text-lg font-medium text-[#36596A] hover:text-[#2a4a5a] transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                      <div className="ml-4 space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-2 text-sm text-gray-600 hover:text-[#36596A] transition-colors"
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
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Link
                    href="/contact"
                    className="block w-full bg-[#36596A] text-white py-2 px-4 rounded-lg text-center hover:bg-[#2a4a5a] transition-colors"
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
