// Educational body content — enrollment periods, penalties, factual reference
// material specific to a vertical. Not a capture surface, not an ask.
//
// Kit-driven: reads kit.educationalContent (optional). Kits without any
// declared educational content render nothing — safe to drop into any tree.

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { getKit } from '@/lib/capture-kits'
import type { Vertical } from '@/lib/capture-kits/types'

export interface EducationalFactsProps {
  vertical: Vertical
}

export default function EducationalFacts({ vertical }: EducationalFactsProps) {
  const kit = getKit(vertical)
  const content = kit?.educationalContent
  if (!content) return null
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mt-12 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <AlertTriangle className="w-8 h-8 text-yellow-600 mr-2" />
        {content.headline}
      </h2>
      <div className={`grid gap-6 ${content.sections.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {content.sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              {section.title}
            </h3>
            <ul className="space-y-2 text-gray-600">
              {section.items.map((item, i) => {
                const colonIdx = item.indexOf(':')
                if (colonIdx > 0 && colonIdx < 40) {
                  return (
                    <li key={i}>
                      <strong>{item.slice(0, colonIdx + 1)}</strong>
                      {item.slice(colonIdx + 1)}
                    </li>
                  )
                }
                return <li key={i}>{item}</li>
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
