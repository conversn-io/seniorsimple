/**
 * BatchData Property Lookup API Route
 *
 * Migration package integration for SeniorSimple.
 * Production-tested on RateRoots platform (January 2026).
 */

import { NextRequest, NextResponse } from 'next/server'

// Edge runtime for faster response times
export const runtime = 'edge'

// Logging helper for debugging
const log = (message: string, data?: unknown) => {
  const suffix = typeof data !== 'undefined' ? JSON.stringify(data, null, 2) : ''
  console.log(`🏠 BatchData API: ${message}`, suffix)
}

interface PropertyLookupData {
  property_value: number
  mortgage_balance: number
  ltv_ratio: number
  address: string
  city: string
  state: string
  zip: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  year_built: number
  last_sale_date: string
  last_sale_price: number
  estimated_monthly_payment: number
  equity_available: number
  loan_amount_available: number
  open_lien_summary?: {
    totalOpenLienBalance?: number
    totalOpenLienCount?: number
    mortgages?: Array<{
      lenderName?: string
      loanAmount?: number
      currentEstimatedBalance?: number
      loanType?: string
      interestRate?: number
      dueDate?: string
    }>
  } | null
  owner?: {
    fullName?: string
    names?: Array<{
      first?: string
      middle?: string
      last?: string
      full?: string
    }>
  }
}

// Simple in-memory cache (edge runtime per region instance)
const cache = new Map<string, { data: PropertyLookupData; ts: number }>()

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const numeric = Number(value.replace(/,/g, ''))
    if (Number.isFinite(numeric)) {
      return numeric
    }
  }
  return fallback
}

const toString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)

export async function POST(request: NextRequest) {
  log('🚀 Property lookup request received')

  try {
    const payload = (await request.json()) as Partial<{
      address: string
      city: string
      state: string
      zip: string
      place_id: string
    }>

    const { address, city, state, zip, place_id } = payload

    if (!address || !city || !state || !zip) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: address, city, state, zip',
        },
        { status: 400 }
      )
    }

    log('📊 Request parameters', { address, city, state, zip, place_id })

    const batchDataKey = process.env.BATCHDATA_LOOKUP_ONLY_KEY

    if (!batchDataKey) {
      log('⚠️ No API key configured')
      return NextResponse.json(
        {
          success: false,
          error: 'BatchData API key not configured',
        },
        { status: 500 }
      )
    }

    // Construct the full address for lookup
    const fullAddress = `${address}, ${city}, ${state} ${zip}`

    log('🔍 Looking up property', { fullAddress })

    // Cache key
    const key = `bd:${fullAddress.toLowerCase()}`
    const hit = cache.get(key)
    if (hit && Date.now() - hit.ts < 24 * 60 * 60 * 1000) {
      log('⚡ Cache hit for address', { fullAddress })
      return NextResponse.json({ success: true, data: hit.data, cached: true })
    }

    // Call BatchData API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const batchDataResponse = await fetch(
      'https://api.batchdata.com/api/v1/property/lookup/all-attributes',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${batchDataKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          requests: [
            {
              address: {
                street: address,
                city: city,
                state: state,
                zip: zip,
              },
            },
          ],
        }),
      }
    )
    clearTimeout(timeout)

    if (!batchDataResponse.ok) {
      const errorText = await batchDataResponse.text()
      log('❌ External API error', {
        status: batchDataResponse.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to retrieve property data. Please verify the address and try again.',
          data: null,
        },
        { status: 500 }
      )
    }

    const batchData = await batchDataResponse.json()
    log('✅ Property data retrieved')

    // Extract property from results
    const property = batchData.results?.properties?.[0]
    if (!property) {
      log('❌ No property found in response')
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found. Please verify the address is correct.',
          data: null,
        },
        { status: 404 }
      )
    }

    const propertyData = property

    // Extract valuation and lien data
    const valuation = propertyData.valuation
    const openLien = propertyData.openLien
    const mortgages = openLien?.mortgages
    const listing = propertyData.listing
    const propertyOwnerProfile = propertyData.propertyOwnerProfile

    // Try multiple sources for property value (BatchData API structure varies)
    let propertyValue = toNumber(valuation?.estimatedValue)
    if (!propertyValue || propertyValue < 50000) {
      propertyValue = toNumber(valuation?.value)
    }
    if (!propertyValue || propertyValue < 50000) {
      propertyValue = toNumber(listing?.salePrice)
    }
    if (!propertyValue || propertyValue < 50000) {
      propertyValue = toNumber(propertyOwnerProfile?.averageAssessedValue)
    }
    if (!propertyValue || propertyValue < 50000) {
      // Last resort: use average purchase price (usually lower than assessed value)
      propertyValue = toNumber(propertyOwnerProfile?.averagePurchasePrice)
    }

    const mortgageBalance = toNumber(openLien?.totalOpenLienBalance)

    // Calculate equity
    let equityAvailable = toNumber(valuation?.equityCurrentEstimatedBalance)
    if (!equityAvailable && propertyValue && mortgageBalance) {
      equityAvailable = propertyValue - mortgageBalance
    }

    // Calculate loan amount available (customize for your use case)
    let loanAmountAvailable = 0
    if (propertyValue) {
      const MAX_CLTV = 0.85 // 85% Combined Loan-to-Value
      loanAmountAvailable = Math.max(0, Math.floor(propertyValue * MAX_CLTV - mortgageBalance))
    }

    // Log valuation data for debugging
    log('🏦 Lien data found', {
      hasOpenLien: !!openLien,
      mortgageCount: mortgages?.length || 0,
    })

    log('❌ BatchData API: Invalid or missing property value', {
      propertyValue,
      hasValuation: !!valuation,
      valuationData: valuation,
      hasListing: !!listing,
      listingSalePrice: listing?.salePrice,
      hasPropertyOwnerProfile: !!propertyOwnerProfile,
      averageAssessedValue: propertyOwnerProfile?.averageAssessedValue,
    })

    // Validate property value
    if (!propertyValue || propertyValue < 50000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to retrieve property valuation data.',
          data: null,
        },
        { status: 404 }
      )
    }

    const responseData: PropertyLookupData = {
      property_value: propertyValue,
      mortgage_balance: mortgageBalance || 0,
      ltv_ratio: mortgageBalance > 0 && propertyValue > 0 ? mortgageBalance / propertyValue : 0.7,
      address: `${property.address?.street}, ${property.address?.city}, ${property.address?.state} ${property.address?.zip}`,
      city: property.address?.city || city,
      state: property.address?.state || state,
      zip: property.address?.zip || zip,
      property_type: toString(propertyData.property_type, 'Single Family'),
      bedrooms: toNumber(propertyData.listing?.bedroomCount),
      bathrooms: toNumber(propertyData.listing?.bathroomCount),
      square_feet: toNumber(propertyData.square_feet),
      year_built: toNumber(propertyData.listing?.yearBuilt),
      last_sale_date: toString(propertyData.deedHistory?.[0]?.saleDate),
      last_sale_price: toNumber(propertyData.deedHistory?.[0]?.salePrice),
      estimated_monthly_payment: toNumber(mortgages?.[0]?.estimatedPaymentAmount),
      equity_available: equityAvailable,
      loan_amount_available: loanAmountAvailable,
      open_lien_summary:
        openLien && mortgages?.length
          ? {
              totalOpenLienCount: openLien.totalOpenLienCount ?? mortgages.length,
              totalOpenLienBalance: openLien.totalOpenLienBalance,
              mortgages: mortgages.map((m: any) => ({
                lenderName: toString(m.lenderName),
                loanAmount: toNumber(m.loanAmount),
                currentEstimatedBalance: toNumber(m.currentEstimatedBalance),
                loanType: toString(m.loanType),
                interestRate: toNumber(m.currentEstimatedInterestRate ?? m.interestRate),
                dueDate: toString(m.dueDate),
              })),
            }
          : undefined,
      owner: property.owner
        ? {
            fullName: property.owner.fullName,
            names: property.owner.names?.map((n: any) => ({
              first: n.first,
              last: n.last,
              full: n.full,
            })),
          }
        : undefined,
    }

    // Store in cache
    cache.set(key, { data: responseData, ts: Date.now() })

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    log('💥 Error occurred', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while looking up the property.',
        data: null,
      },
      { status: 500 }
    )
  }
}
