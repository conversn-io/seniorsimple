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
                src="/images/logos/senior-simple-logo-nav-icon.png"
                alt="SeniorSimple"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <span className="ml-2 text-xl font-bold text-[#36596A]">
                SeniorSimple
              </span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  )
}






