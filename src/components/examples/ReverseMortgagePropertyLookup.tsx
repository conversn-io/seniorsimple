/**
 * SeniorSimple Reverse Mortgage Calculator Example
 *
 * Demonstrates property lookup + reverse mortgage estimation.
 */

'use client'

import { useState } from 'react'
import { AddressAutocomplete, AddressComponents } from '@/components/property/AddressAutocomplete'
import { PropertyLookupData } from '@/types/property'

interface ReverseMortgageCalculation {
  propertyValue: number
  ageBasedLimit: number
  grossProceeds: number
  existingMortgage: number
  netProceeds: number
  monthlyPaymentOption: number
  mustPayoffMortgage: boolean
}

export default function ReverseMortgagePropertyLookup() {
  const [propertyData, setPropertyData] = useState<PropertyLookupData | null>(null)
  const [loading, setLoading] = useState(false)
  const [age, setAge] = useState<number>(70)
  const [calculation, setCalculation] = useState<ReverseMortgageCalculation | null>(null)

  const calculateReverseMortgage = (data: PropertyLookupData, borrowerAge: number): ReverseMortgageCalculation => {
    // 2026 FHA HECM lending limit
    const FHA_LIMIT = 1149825

    // Use lesser of property value or FHA limit
    const adjustedValue = Math.min(data.property_value, FHA_LIMIT)

    // Principal Limit Factor based on age (simplified)
    let plf = 0.5
    if (borrowerAge >= 90) plf = 0.75
    else if (borrowerAge >= 85) plf = 0.7
    else if (borrowerAge >= 80) plf = 0.65
    else if (borrowerAge >= 75) plf = 0.6
    else if (borrowerAge >= 70) plf = 0.55
    else if (borrowerAge >= 65) plf = 0.5
    else if (borrowerAge >= 62) plf = 0.45

    const grossProceeds = Math.floor(adjustedValue * plf)
    const existingMortgage = data.mortgage_balance
    const netProceeds = Math.max(0, grossProceeds - existingMortgage)

    // Estimate monthly payment option (tenure payment)
    const monthlyPaymentOption = Math.floor(netProceeds / 240)

    return {
      propertyValue: data.property_value,
      ageBasedLimit: adjustedValue,
      grossProceeds,
      existingMortgage,
      netProceeds,
      monthlyPaymentOption,
      mustPayoffMortgage: existingMortgage > 0,
    }
  }

  const handleAddressSelect = async (address: AddressComponents) => {
    setLoading(true)
    setCalculation(null)

    try {
      const response = await fetch('/api/batchdata/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          place_id: address.place_id,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setPropertyData(result.data)
        const calc = calculateReverseMortgage(result.data, age)
        setCalculation(calc)
      } else {
        alert(result.error || 'Failed to lookup property')
      }
    } catch (err) {
      console.error('Property lookup error:', err)
      alert('An error occurred while looking up the property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Reverse Mortgage Calculator</h1>
        <p className="text-gray-600 mb-8">
          See how much you could access from your home equity with a reverse mortgage
        </p>

        <div className="mb-6">
          <label className="block mb-2 font-semibold">Your Age:</label>
          <input
            type="number"
            min="62"
            max="100"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value || '0', 10))}
            className="px-4 py-2 border rounded-lg w-32"
          />
          <p className="text-sm text-gray-500 mt-1">Must be 62 or older for reverse mortgage</p>
        </div>

        <div className="mb-8">
          <label className="block mb-2 font-semibold">Property Address:</label>
          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            placeholder="Enter your home address"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Analyzing your property...</p>
          </div>
        )}

        {calculation && propertyData && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h2 className="text-2xl font-bold mb-4">Your Property</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Property Value</p>
                  <p className="text-2xl font-bold">${calculation.propertyValue.toLocaleString()}</p>
                </div>
                {calculation.ageBasedLimit < calculation.propertyValue && (
                  <div>
                    <p className="text-sm text-gray-600">FHA Limit Applied</p>
                    <p className="text-2xl font-bold">${calculation.ageBasedLimit.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <h2 className="text-2xl font-bold mb-4">Available to You</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Gross Proceeds (Age {age})</p>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  ${calculation.grossProceeds.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Based on {(calculation.grossProceeds / calculation.ageBasedLimit * 100).toFixed(0)}%
                  Principal Limit Factor for age {age}
                </p>
              </div>

              {calculation.mustPayoffMortgage && (
                <div className="mb-4 pb-4 border-b border-green-200">
                  <p className="text-sm text-gray-600">Existing Mortgage Payoff</p>
                  <p className="text-xl font-semibold text-orange-600">
                    -${calculation.existingMortgage.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Required: Existing mortgages must be paid off with reverse mortgage proceeds
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Net Cash Available to You</p>
                <p className="text-4xl font-bold text-green-700">
                  ${calculation.netProceeds.toLocaleString()}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Or Monthly Payment Option</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${calculation.monthlyPaymentOption.toLocaleString()}/month
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated tenure payment (lifetime monthly income)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-yellow-900 mb-2">Important Disclaimer</p>
              <p className="text-yellow-800">
                This is an estimate only. Actual reverse mortgage proceeds depend on current interest rates,
                age of youngest borrower, appraisal value, and other factors. Contact a licensed reverse
                mortgage specialist for an accurate quote.
              </p>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg"
              onClick={() => {
                console.log('User ready to speak with specialist')
              }}
            >
              Speak with a Reverse Mortgage Specialist →
            </button>
          </div>
        )}

        {propertyData && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Property owner: {propertyData.owner?.fullName || 'Not available'}</p>
            <p className="mt-1">Data retrieved from county records and MLS sources</p>
          </div>
        )}
      </div>
    </div>
  )
}
