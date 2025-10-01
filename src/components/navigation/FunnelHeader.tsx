"use client"
import Link from "next/link"
import Image from "next/image"
import { Phone } from "lucide-react"
import { usePathname } from "next/navigation"

export function FunnelHeader() {
  const pathname = usePathname()
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/seniorsimplelogo-sq.png"
                alt="SeniorSimple"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-[#36596A]">
                SeniorSimple
              </span>
            </Link>
          </div>

          {/* Phone CTA Button */}
          {pathname !== '/quiz-submitted' && (
            <div className="flex items-center">
              <a
                href="tel:+18884409669"
                className="flex items-center bg-[#36596A] text-white px-6 py-3 rounded-lg hover:bg-[#2a4a5a] transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Call (888) 440-9669</span>
                <span className="sm:hidden">Call Now</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}






