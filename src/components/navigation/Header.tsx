import Link from "next/link"
import Image from "next/image"
import { MegaMenu } from "./MegaMenu"
import { MobileMenu } from "./MobileMenu"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center touch-target p-2 -m-2 rounded-lg focus-visible-enhanced transition-all duration-300 hover:bg-gray-50">
              <Image
                src="/images/logos/seniorsimplelogo-sq.png"
                alt="SeniorSimple"
                width={44}
                height={44}
                className="h-11 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-[#36596A] senior-friendly-text">
                SeniorSimple
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <MegaMenu />
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/contact"
              className="hidden sm:flex btn-accessible bg-[#36596A] text-white hover:bg-[#2a4a5a] focus-visible:ring-2 focus-visible:ring-[#36596A] focus-visible:ring-offset-2"
            >
              Get Started
            </Link>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
