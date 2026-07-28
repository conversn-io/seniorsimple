'use client'

// Generic calculator — fully driven by kit.calculator (see @/lib/capture-kits/types).
// Reads field specs, runs the kit's compute function, renders result lines.
// The tool-archetype primary (email tool-gate vs quiz-bridge, Ruling 1) is
// chosen by the kit via kit.calculator.primary.
//
// Renders nothing when the kit lacks a calculator spec — safe to drop into any
// page that might match a kit without one.

import React, { useState, useEffect, useMemo } from 'react'
import { Calculator as CalcIcon, DollarSign } from 'lucide-react'
import CaptureMount from '../capture/CaptureMount'
import BucketQuiz from '@/components/quiz/BucketQuiz'
import { getKit } from '@/lib/capture-kits'
import type { Vertical, CalcField } from '@/lib/capture-kits/types'

function formatValue(n: number, format: 'currency' | 'number' | 'percent'): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)
  }
  if (format === 'percent') {
    return `${(n * 100).toFixed(1)}%`
  }
  return String(Math.round(n))
}

function defaultInputs(fields: CalcField[]): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const f of fields) {
    if (f.kind === 'number') out[f.id] = f.default ?? 0
    if (f.kind === 'select') out[f.id] = f.default ?? f.options[0]?.value ?? ''
  }
  return out
}

export interface CalculatorProps {
  /**
   * Which vertical's kit to load. String so this prop crosses the RSC
   * boundary safely (kit objects carry non-serializable compute functions).
   */
  vertical: Vertical
  /**
   * Optional slug override. Defaults to the first pageConfig whose variants
   * include 'tool-gate' — matches how the calculator is wired today
   * (one calculator page per kit). Callers may override for preview / test.
   */
  slug?: string
  /** Optional page title override; defaults to a vertical-derived label. */
  title?: string
  /** Optional subtitle override. */
  subtitle?: string
}

export default function Calculator({ vertical, slug, title, subtitle }: CalculatorProps) {
  const kit = getKit(vertical)
  if (!kit) return null
  const spec = kit.calculator
  if (!spec) return null

  const captureSlug =
    slug ??
    Object.values(kit.pageConfigs).find((c) => c.variants.includes('tool-gate'))?.slug ??
    kit.vertical

  const [inputs, setInputs] = useState<Record<string, string | number>>(() =>
    defaultInputs(spec.fields),
  )
  const [results, setResults] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    setResults(spec.compute(inputs))
  }, [inputs, spec])

  const handleChange = (id: string, value: string | number) => {
    setInputs((prev) => ({ ...prev, [id]: value }))
  }

  const totalAnnual = results?.totalAnnualCost
  const monthly = results?.monthlyPremiums
  const bucketRatio = totalAnnual && monthly ? { totalAnnualCost: totalAnnual, monthlyPremiums: monthly } : undefined

  // Kit-controlled default header copy — kept generic so any vertical calc renders.
  const headerTitle = title ?? `${kit.quiz?.buckets ? 'Cost' : 'Estimate'} Calculator`
  const headerSubtitle =
    subtitle ?? 'Estimate your costs and compare options.'

  const bridgePrefill = useMemo(() => {
    // Best-effort prefill for the bridge quiz — pass any keys the quiz might use.
    const p: Record<string, unknown> = {}
    if (inputs.age !== undefined) p.age = inputs.age
    if (inputs.income !== undefined) p.income = inputs.income
    if (inputs.prescriptions !== undefined) p.prescriptions = inputs.prescriptions
    return p
  }, [inputs])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
          <CalcIcon className="w-10 h-10 mr-3" />
          {headerTitle}
        </h1>
        <p className="text-xl text-white opacity-90">{headerSubtitle}</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <CalcIcon className="w-6 h-6 text-blue-600 mr-2" />
              Your Information
            </h2>
            <div className="space-y-4">
              {spec.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {field.kind === 'number' ? (
                    <input
                      type="number"
                      value={inputs[field.id] as number}
                      onChange={(e) => handleChange(field.id, parseFloat(e.target.value) || 0)}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <select
                      value={inputs[field.id] as string}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {field.helper && (
                    <p className="text-sm text-gray-500 mt-1">{field.helper}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              Your Estimate
            </h2>
            {results ? (
              <div className="space-y-6">
                {totalAnnual !== undefined && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold mb-2">Total Annual Cost</h3>
                    <p className="text-4xl font-bold">{formatValue(totalAnnual, 'currency')}</p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    {spec.resultLines.map((line) => {
                      const val = results[line.id]
                      if (val === undefined) return null
                      return (
                        <div key={line.id} className="flex justify-between">
                          <span>{line.label}:</span>
                          <span className="font-semibold">{formatValue(val, line.format)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CalcIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Enter your information to see estimates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool-archetype primary — kit chooses (Ruling 1). */}
      {spec.primary === 'gate' && (
        <>
          {results && (
            <CaptureMount
              vertical={vertical}
              slug={captureSlug}
              only={['tool-gate']}
              resultPayload={results}
            />
          )}
          <CaptureMount vertical={vertical} slug={captureSlug} only={['inline']} />
        </>
      )}

      {spec.primary === 'quiz-bridge' && results && kit.quiz && (
        <div className="mb-8">
          <BucketQuiz
            vertical={vertical}
            slug="calculator-bridge"
            variant="bridge"
            calculatorResults={bucketRatio}
            prefill={bridgePrefill}
          />
        </div>
      )}
    </div>
  )
}
