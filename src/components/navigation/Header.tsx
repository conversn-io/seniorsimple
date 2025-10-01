import Link from "next/link"
import Image from "next/image"
import { MegaMenu } from "./MegaMenu"
import { MobileMenu } from "./MobileMenu"

export function Header() {
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <MegaMenu />
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/contact"
              className="hidden sm:block bg-[#36596A] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a5a] transition-colors h-9"
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
