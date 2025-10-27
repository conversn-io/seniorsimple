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
  PiggyBank,
  Target,
  Users,
  Building,
} from "lucide-react"

// SmartAsset-inspired menu structure with proper information architecture
const menuItems = [
  {
    title: "Retirement",
    href: "/retirement",
    description: "Your complete retirement planning hub",
    sections: [
      {
        title: "Income Planning",
        items: [
          {
            name: "Tax-Free Retirement Income Guide",
            href: "/content/tax-free-retirement-income-complete-guide",
            icon: DollarSign,
            description: "Maximize tax-free income strategies"
          },
          {
            name: "Annuities Explained Guide",
            href: "/content/annuities-explained-secure-your-retirement-income-with-confidence",
            icon: Shield,
            description: "Secure guaranteed income for life"
          },
          {
            name: "Fixed Annuity Safety Guide",
            href: "/content/can-i-lose-money-in-a-fixed-annuity",
            icon: Shield,
            description: "Understanding annuity safety"
          },
          {
            name: "Social Security Spousal Benefits",
            href: "/content/social-security-spousal-benefits-guide",
            icon: Users,
            description: "Maximize spousal benefits"
          },
        ],
      },
      {
        title: "Savings & Investments",
        items: [
          {
            name: "Best Retirement Accounts Over 70",
            href: "/content/best-retirement-accounts-for-seniors-over-70",
            icon: PiggyBank,
            description: "Optimize accounts for seniors"
          },
          {
            name: "Retirement Rescue™ Quiz",
            href: "/quiz",
            icon: Target,
            description: "Get personalized retirement strategy"
          },
          {
            name: "Retirement Rescue™ Assessment",
            href: "/content/retirement-planning-assessment",
            icon: Calculator,
            description: "Evaluate your retirement readiness"
          },
          {
            name: "Investment Growth Calculator",
            href: "/content/investment-growth-calculator",
            icon: TrendingUp,
            description: "Project investment growth"
          },
          {
            name: "Social Security Calculator",
            href: "/content/social-security-optimization-calculator",
            icon: DollarSign,
            description: "Optimize claiming strategy"
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
        title: "Housing Strategies",
        items: [
          {
            name: "Reverse Mortgage vs Home Equity Loan",
            href: "/content/reverse-mortgage-vs-home-equity-loan-for-seniors-a-comprehensive-guide",
            icon: BookOpen,
            description: "Choose the right home equity option"
          },
          {
            name: "California Housing Crisis Guide",
            href: "/content/navigating-california-s-housing-crisis-challenges-and-opportunities-for-buyers",
            icon: Home,
            description: "Navigate California's market"
          },
          {
            name: "Aging in Place Guide",
            href: "/content/aging-in-place-guide",
            icon: Home,
            description: "Stay in your home safely"
          },
        ],
      },
      {
        title: "Housing Tools",
        items: [
          {
            name: "Reverse Mortgage Calculator",
            href: "/content/reverse-mortgage-strategy-guide",
            icon: Calculator,
            description: "Calculate reverse mortgage benefits"
          },
          {
            name: "Downsizing Calculator",
            href: "/content/downsizing-strategy-guide",
            icon: Home,
            description: "Evaluate downsizing options"
          },
          {
            name: "Home Equity Calculator",
            href: "/content/home-equity-strategy-guide",
            icon: TrendingUp,
            description: "Calculate available equity"
          },
        ],
      },
    ],
  },
  {
    title: "Healthcare",
    href: "/health",
    description: "Navigate healthcare in retirement",
    sections: [
      {
        title: "Medicare & Health Plans",
        items: [
          {
            name: "Medicare Enrollment Guide",
            href: "/content/medicare-planning-guide",
            icon: BookOpen,
            description: "Complete Medicare enrollment guide"
          },
          {
            name: "Healthcare Budgeting Guide",
            href: "/content/how-to-budget-for-healthcare-costs-in-retirement-essential-planning-tips",
            icon: DollarSign,
            description: "Plan for healthcare costs"
          },
          {
            name: "Long-Term Care Guide",
            href: "/content/long-term-care-planning-guide",
            icon: Heart,
            description: "Plan for long-term care needs"
          },
        ],
      },
      {
        title: "Health Tools",
        items: [
          {
            name: "Medicare Cost Calculator",
            href: "/content/medicare-cost-calculator",
            icon: Calculator,
            description: "Calculate Medicare costs"
          },
          {
            name: "Medicare Comparison Tool",
            href: "/content/medicare-comparison-tool",
            icon: Shield,
            description: "Compare Medicare plans"
          },
          {
            name: "HSA Strategy Guide",
            href: "/content/hsa-strategy-guide",
            icon: DollarSign,
            description: "Maximize HSA benefits"
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
        title: "Essential Planning",
        items: [
          {
            name: "Estate Planning Checklist",
            href: "/content/estate-planning-checklist",
            icon: FileText,
            description: "Complete estate planning checklist"
          },
          {
            name: "Will & Trust Guide",
            href: "/content/will-trust-guide",
            icon: Shield,
            description: "Create wills and trusts"
          },
          {
            name: "Estate Tax Guide",
            href: "/content/estate-tax-guide",
            icon: BookOpen,
            description: "Minimize estate taxes"
          },
        ],
      },
      {
        title: "Planning Tools",
        items: [
          {
            name: "Beneficiary Planner Tool",
            href: "/content/beneficiary-planner-tool",
            icon: Heart,
            description: "Plan beneficiary designations"
          },
          {
            name: "Power of Attorney Guide",
            href: "/content/power-of-attorney-guide",
            icon: Download,
            description: "Essential legal documents"
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
        title: "Tax Strategies",
        items: [
          {
            name: "Tax Planning Guide",
            href: "/content/tax-planning-guide",
            icon: BookOpen,
            description: "Advanced tax planning strategies"
          },
          {
            name: "IRA Withdrawal Guide",
            href: "/content/ira-withdrawal-guide",
            icon: FileText,
            description: "Optimize IRA withdrawals"
          },
        ],
      },
      {
        title: "Tax Tools",
        items: [
          {
            name: "Tax Impact Calculator",
            href: "/content/tax-impact-calculator",
            icon: Calculator,
            description: "Calculate tax implications"
          },
          {
            name: "Roth Conversion Calculator",
            href: "/content/roth-conversion-strategy-guide",
            icon: DollarSign,
            description: "Evaluate Roth conversions"
          },
          {
            name: "RMD Calculator",
            href: "/content/rmd-calculator",
            icon: TrendingUp,
            description: "Calculate required distributions"
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
        title: "Insurance Coverage",
        items: [
          {
            name: "Life Insurance Guide",
            href: "/content/life-insurance-strategy-guide",
            icon: BookOpen,
            description: "Choose the right life insurance"
          },
          {
            name: "Long-Term Care Guide",
            href: "/content/long-term-care-planning-strategy-guide",
            icon: FileText,
            description: "Long-term care insurance options"
          },
        ],
      },
      {
        title: "Insurance Tools",
        items: [
          {
            name: "Life Insurance Assessment",
            href: "/content/life-insurance-assessment",
            icon: Calculator,
            description: "Calculate life insurance needs"
          },
          {
            name: "Long-Term Care Calculator",
            href: "/content/long-term-care-planning-strategy-guide",
            icon: Shield,
            description: "Evaluate LTC insurance needs"
          },
          {
            name: "Disability Insurance Calculator",
            href: "/content/disability-calculator",
            icon: Heart,
            description: "Calculate disability coverage"
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
                <div className="w-[900px] p-6">
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
                        <h3 className="font-semibold text-[#36596A] mb-4 text-sm uppercase tracking-wide">
                          {section.title}
                        </h3>
                        <ul className="space-y-3">
                          {section.items.map((menuItem) => {
                            const IconComponent = menuItem.icon
                            return (
                              <li key={menuItem.name}>
                                <Link
                                  href={menuItem.href}
                                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[#F5F5F0] transition-colors group"
                                >
                                  <IconComponent className="h-5 w-5 text-[#36596A] mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-gray-900 group-hover:text-[#36596A] block">
                                      {menuItem.name}
                                    </span>
                                    {menuItem.description && (
                                      <span className="text-xs text-gray-500 mt-1 block">
                                        {menuItem.description}
                                      </span>
                                    )}
                                  </div>
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