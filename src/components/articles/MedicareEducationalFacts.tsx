// §8-E: Educational body content — enrollment periods + late-enrollment
// penalties. Not a capture surface, not an ask.
//
// Extracted from MedicareCostCalculator so it renders on Medicare articles
// regardless of which archetype-mounted unit is active. Packet §2 explicitly
// kept this as body content ("KEEP as content (not asks) — that's
// educational body content, harmless; leave it"). Previously coupled to the
// calculator, which meant guide articles (archetype = 'guide', quiz-mounted)
// lost the panel after §8-B. This component fixes that.
//
// Mount pattern: article template gates on isMedicareArticle (§8-C) and
// renders below the archetype unit. Also mounts on /calculators/medicare-costs
// (that page owns its own mount since it's not routed through the article
// template).

import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function MedicareEducationalFacts() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mt-12 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <AlertTriangle className="w-8 h-8 text-yellow-600 mr-2" />
        Important Medicare Facts
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            Enrollment Periods
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li><strong>Initial Enrollment:</strong> 3 months before to 3 months after your 65th birthday</li>
            <li><strong>General Enrollment:</strong> January 1 - March 31 (coverage starts July 1)</li>
            <li><strong>Open Enrollment:</strong> October 15 - December 7 (coverage starts January 1)</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            Late Enrollment Penalties
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li><strong>Part B:</strong> 10% penalty for each 12-month period you delay enrollment</li>
            <li><strong>Part D:</strong> 1% penalty for each month you delay enrollment</li>
            <li><strong>Lifetime penalties:</strong> These penalties continue as long as you have Medicare</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
