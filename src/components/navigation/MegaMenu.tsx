"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu"
import {
  Calculator,
  BookOpen,
  Video,
  Download,
  DollarSign,
  Shield,
  Heart,
  Home,
  FileText,
  TrendingUp,
} from "lucide-react"

// Menu data structure
const menuItems = [
  {
    title: "Retirement",
    href: "/retirement",
    description: "Plan your retirement with confidence",
    sections: [
      {
        title: "Calculators",
        items: [
          {
            name: "Retirement Savings Calculator",
            href: "/assessment/retirement-planning",
            icon: Calculator,
          },
          {
            name: "Social Security Calculator",
            href: "/calculators/social-security",
            icon: DollarSign,
          },
          {
            name: "Investment Growth Calculator",
            href: "/calculators/investment-growth",
            icon: TrendingUp,
          },
        ],
      },
      {
        title: "Guides & Resources",
        items: [
          {
            name: "Complete Retirement Guide",
            href: "/resources/ebook",
            icon: BookOpen,
          },
          {
            name: "Pre-Retirement Checklist",
            href: "/resources/pre-retirement-checklist",
            icon: FileText,
          },
          {
            name: "Video Series",
            href: "/videos",
            icon: Video,
          },
        ],
      },
    ],
  },
  {
    title: "Estate Planning",
    href: "/estate",
    description: "Protect your legacy and loved ones",
    sections: [
      {
        title: "Tools & Checklists",
        items: [
          {
            name: "Estate Planning Checklist",
            href: "/resources/estate-planning-checklist",
            icon: FileText,
          },
          {
            name: "Will & Trust Guide",
            href: "/resources/will-trust-guide",
            icon: Shield,
          },
          {
            name: "Beneficiary Planner",
            href: "/tools/beneficiary-planner",
            icon: Heart,
          },
        ],
      },
      {
        title: "Resources",
        items: [
          {
            name: "Estate Tax Guide",
            href: "/resources/estate-tax-guide",
            icon: BookOpen,
          },
          {
            name: "Power of Attorney Forms",
            href: "/resources/power-attorney",
            icon: Download,
          },
        ],
      },
    ],
  },
  {
    title: "Health & Medicare",
    href: "/health",
    description: "Navigate healthcare in retirement",
    sections: [
      {
        title: "Medicare Tools",
        items: [
          {
            name: "Medicare Cost Calculator",
            href: "/calculators/medicare-costs",
            icon: Calculator,
          },
          {
            name: "Medicare Enrollment Guide",
            href: "/resources/medicare-guide",
            icon: BookOpen,
          },
          {
            name: "Plan Comparison Tool",
            href: "/tools/medicare-comparison",
            icon: Shield,
          },
        ],
      },
      {
        title: "Health Resources",
        items: [
          {
            name: "Long-Term Care Guide",
            href: "/resources/long-term-care",
            icon: Heart,
          },
          {
            name: "Health Savings Account Guide",
            href: "/resources/hsa-guide",
            icon: DollarSign,
          },
        ],
      },
    ],
  },
  {
    title: "Housing",
    href: "/housing",
    description: "Your home in retirement",
    sections: [
      {
        title: "Housing Calculators",
        items: [
          {
            name: "Reverse Mortgage Calculator",
            href: "/calculators/reverse-mortgage",
            icon: Calculator,
          },
          {
            name: "Downsizing Calculator",
            href: "/calculators/downsizing",
            icon: Home,
          },
          {
            name: "Home Equity Calculator",
            href: "/calculators/home-equity",
            icon: TrendingUp,
          },
        ],
      },
      {
        title: "Housing Guides",
        items: [
          {
            name: "Aging in Place Guide",
            href: "/resources/aging-in-place",
            icon: BookOpen,
          },
          {
            name: "Senior Housing Options",
            href: "/resources/senior-housing",
            icon: Home,
          },
        ],
      },
    ],
  },
  {
    title: "Tax Planning",
    href: "/tax",
    description: "Optimize your tax strategy",
    sections: [
      {
        title: "Tax Tools",
        items: [
          {
            name: "Tax Impact Calculator",
            href: "/calculators/tax-impact",
            icon: Calculator,
          },
          {
            name: "Roth Conversion Calculator",
            href: "/calculators/roth-conversion",
            icon: DollarSign,
          },
          {
            name: "RMD Calculator",
            href: "/calculators/rmd",
            icon: TrendingUp,
          },
        ],
      },
      {
        title: "Tax Resources",
        items: [
          {
            name: "Tax Strategy Guide",
            href: "/resources/tax-strategy",
            icon: BookOpen,
          },
          {
            name: "IRA Withdrawal Guide",
            href: "/resources/ira-withdrawal",
            icon: FileText,
          },
        ],
      },
    ],
  },
  {
    title: "Insurance",
    href: "/insurance",
    description: "Protect what matters most",
    sections: [
      {
        title: "Insurance Tools",
        items: [
          {
            name: "Life Insurance Calculator",
            href: "/assessment/life-insurance",
            icon: Calculator,
          },
          {
            name: "Long-Term Care Calculator",
            href: "/calculators/ltc-insurance",
            icon: Shield,
          },
          {
            name: "Disability Insurance Calculator",
            href: "/calculators/disability",
            icon: Heart,
          },
        ],
      },
      {
        title: "Insurance Guides",
        items: [
          {
            name: "Life Insurance Guide",
            href: "/resources/life-insurance-guide",
            icon: BookOpen,
          },
          {
            name: "Long-Term Care Guide",
            href: "/resources/ltc-guide",
            icon: FileText,
          },
        ],
      },
    ],
  },
]

export function MegaMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <div className="relative group">
              <div className="flex items-center">
                <NavigationMenuTrigger className="h-8 px-4 py-2 text-sm text-gray-600 hover:text-[#36596A] transition-colors font-medium data-[state=open]:text-[#36596A]">
                  <Link href={item.href} className="hover:text-[#36596A]">
                    {item.title}
                  </Link>
                </NavigationMenuTrigger>
              </div>
              <NavigationMenuContent>
                <div className="w-[800px] p-6">
                  {/* Header Section */}
                  <div className="mb-6">
                    <Link
                      href={item.href}
                      className="text-xl font-bold text-[#36596A] hover:text-[#2a4a5a] transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                  </div>

                {/* Content Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {item.sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="font-semibold text-[#36596A] mb-3 text-sm uppercase tracking-wide">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.items.map((menuItem) => {
                          const IconComponent = menuItem.icon
                          return (
                            <li key={menuItem.name}>
                              <Link
                                href={menuItem.href}
                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#F5F5F0] transition-colors group h-8"
                              >
                                <IconComponent className="h-4 w-4 text-[#36596A]" />
                                <span className="text-sm text-gray-600 group-hover:text-[#36596A]">
                                  {menuItem.name}
                                </span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </div>
        </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
