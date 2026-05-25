/**
 * Property Lookup Type Definitions
 */

export interface AddressComponents {
  formatted_address: string
  street: string
  city: string
  state: string
  zip: string
  place_id?: string
}

export interface PropertyLookupData {
  property_value: number
  mortgage_balance: number
  /**
   * Loan-to-value ratio as a decimal (0–1).
   * - null when LTV is genuinely unknown (no lien data and no BatchData valuation.ltv)
   * - 0 when the home is paid off
   * - >0 otherwise (preferred source: BatchData's valuation.ltv; fallback: mortgage_balance / property_value)
   */
  ltv_ratio: number | null
  /** Diagnostic: where ltv_ratio came from */
  ltv_source?: 'batchdata_valuation' | 'computed_from_lien' | 'paid_off' | 'unknown'
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

export interface PropertyLookupResponse {
  success: boolean
  data?: PropertyLookupData
  error?: string
  cached?: boolean
  timestamp?: string
  note?: string
}

export interface PropertyLookupRequest {
  address: string
  city: string
  state: string
  zip: string
  place_id?: string
  sessionId?: string
}
