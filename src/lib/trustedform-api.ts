/**
 * TrustedForm Certificate API Service
 * 
 * Validates and retains TrustedForm certificates using ActiveProspect API
 * API Key: 65ed94b988010fe6327e3121723d7053
 * 
 * Based on OpenAPI spec: https://cert.trustedform.com
 * Uses HTTP Basic Auth: username="API", password=apiKey
 */

const TRUSTEDFORM_API_KEY = process.env.TRUSTEDFORM_API_KEY || '65ed94b988010fe6327e3121723d7053';
const TRUSTEDFORM_API_BASE = 'https://cert.trustedform.com';

/**
 * Extract certificate ID from certificate URL
 * Example: https://cert.trustedform.com/abc123... -> abc123...
 */
function extractCertId(certUrl: string): string | null {
  if (!certUrl || typeof certUrl !== 'string') return null;
  
  // Remove protocol and domain
  const match = certUrl.match(/cert\.trustedform\.com\/([^\/\s]+)/);
  return match ? match[1] : null;
}

/**
 * Validate and retain a TrustedForm certificate
 * 
 * @param certUrl - Full certificate URL (e.g., https://cert.trustedform.com/abc123...)
 * @param email - Lead email address (for match_lead operation)
 * @param phone - Lead phone number (for match_lead operation, optional)
 * @returns Promise with validation/retention result
 */
export async function validateAndRetainCertificate(
  certUrl: string,
  email: string,
  phone?: string
): Promise<{
  success: boolean;
  outcome?: string;
  errors?: any;
  retained?: boolean;
  matched?: boolean;
}> {
  const certId = extractCertId(certUrl);
  
  if (!certId) {
    return {
      success: false,
      errors: { message: 'Invalid certificate URL format' }
    };
  }

  if (!email) {
    return {
      success: false,
      errors: { message: 'Email is required for certificate validation' }
    };
  }

  try {
    // Prepare request body for match_lead and retain operations
    const requestBody: any = {
      retain: {}, // Empty object triggers retain operation
    };

    // Add match_lead operation (required for retain)
    requestBody.match_lead = {
      email: email.toLowerCase().trim(), // Normalize email
    };

    // Add phone if provided
    if (phone) {
      // Normalize phone: remove whitespace, hyphens, brackets, parentheses
      const normalizedPhone = phone.replace(/[\s\-\(\)\[\]]/g, '');
      requestBody.match_lead.phone = normalizedPhone;
    }

    // Create Basic Auth header (works in both Node.js and Edge Runtime)
    const authString = btoa(`API:${TRUSTEDFORM_API_KEY}`);

    const response = await fetch(`${TRUSTEDFORM_API_BASE}/${certId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'Api-Version': '4.0', // Use v4.0 API
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ TrustedForm API Error:', {
        status: response.status,
        statusText: response.statusText,
        result
      });
      
      return {
        success: false,
        outcome: result.outcome || 'error',
        errors: result.errors || result
      };
    }

    // Check outcome
    const outcome = result.outcome || 'unknown';
    const retained = result.retain?.result === 'success';
    const matched = result.match_lead?.result === 'match' || result.match_lead?.result === 'no_match';

    console.log('✅ TrustedForm Certificate Validated:', {
      certId: certId.substring(0, 20) + '...',
      outcome,
      retained,
      matched,
      matchResult: result.match_lead?.result
    });

    return {
      success: outcome === 'success' || outcome === 'accepted',
      outcome,
      retained,
      matched
    };

  } catch (error) {
    console.error('❌ TrustedForm API Request Failed:', error);
    return {
      success: false,
      errors: { message: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Get certificate insights (metadata about the lead event)
 * Requires Professional plan or higher
 * 
 * @param certUrl - Full certificate URL
 * @param properties - Array of insight properties to retrieve (optional)
 * @returns Promise with insights data
 */
export async function getCertificateInsights(
  certUrl: string,
  properties?: string[]
): Promise<{
  success: boolean;
  insights?: any;
  errors?: any;
}> {
  const certId = extractCertId(certUrl);
  
  if (!certId) {
    return {
      success: false,
      errors: { message: 'Invalid certificate URL format' }
    };
  }

  try {
    const requestBody: any = {
      insights: {
        properties: properties || [
          'created_at',
          'expires_at',
          'page_url',
          'form_input_method',
          'form_submitted',
          'time_on_page'
        ]
      }
    };

    // Create Basic Auth header (works in both Node.js and Edge Runtime)
    const authString = btoa(`API:${TRUSTEDFORM_API_KEY}`);

    const response = await fetch(`${TRUSTEDFORM_API_BASE}/${certId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'Api-Version': '4.0',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: result.errors || result
      };
    }

    return {
      success: true,
      insights: result.insights
    };

  } catch (error) {
    console.error('❌ TrustedForm Insights Request Failed:', error);
    return {
      success: false,
      errors: { message: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}
