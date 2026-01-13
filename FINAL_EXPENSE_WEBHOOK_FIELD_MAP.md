# Final Expense Quote Webhook Field Map

## Webhook URL
```
https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6
```

## Flat Payload Structure

All fields are sent at the root level (no nested objects) for easy mapping in GoHighLevel.

### Contact Information Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `firstName` | string | Yes | Lead's first name | `"John"` |
| `lastName` | string | Yes | Lead's last name | `"Doe"` |
| `email` | string | Yes | Lead's email address | `"john.doe@example.com"` |
| `phone` | string | Yes | Phone number in E.164 format | `"+15551234567"` |
| `phoneLast4` | string | No | Last 4 digits of phone number | `"4567"` |

### Address Information Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `address` | string | Yes | Street address (number + street) | `"123 Main Street"` |
| `city` | string | Yes | City name | `"Phoenix"` |
| `state` | string | Yes | State abbreviation (2 letters) | `"AZ"` |
| `stateName` | string | No | Full state name | `"Arizona"` |
| `zipCode` | string | Yes | ZIP/Postal code | `"85001"` |

### Final Expense Specific Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `coverageAmount` | number | Yes | Desired coverage amount in USD | `15000` |
| `ageRange` | string | Yes | Age range selection | `"60-69"` |
| `healthStatus` | string | Yes | Health status description | `"Good - Managed conditions, no recent hospitalizations"` |
| `tobaccoUse` | string | Yes | Tobacco use status | `"No, never"` |
| `coveragePurpose` | string | No | Comma-separated list of coverage purposes | `"Funeral & Burial Costs,Leave Money to Family"` |

### System & Tracking Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `funnelType` | string | Yes | Always `"final-expense-quote"` | `"final-expense-quote"` |
| `source` | string | Yes | Lead source identifier | `"SeniorSimple Final Expense Quiz"` |
| `ipAddress` | string | No | Lead's IP address | `"192.168.1.1"` |
| `sessionId` | string | Yes | Unique session identifier | `"sess_1705312200000_abc123"` |
| `leadScore` | number | No | Lead quality score (0-100) | `85` |
| `originallyCreated` | string | Yes | ISO 8601 timestamp of lead creation | `"2024-01-15T10:30:00.000Z"` |
| `timestamp` | string | Yes | ISO 8601 timestamp of webhook send | `"2024-01-15T10:30:00.000Z"` |

### UTM Parameters (Flat)

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `utmSource` | string | No | UTM source parameter | `"facebook"` |
| `utmMedium` | string | No | UTM medium parameter | `"cpc"` |
| `utmCampaign` | string | No | UTM campaign parameter | `"final_expense_2024"` |
| `utmTerm` | string | No | UTM term parameter | `""` |
| `utmContent` | string | No | UTM content parameter | `""` |

### Additional Context Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `landingPage` | string | No | Initial landing page URL path | `"/free-burial-life-insurance-guide"` |
| `referrer` | string | No | HTTP referrer URL | `"https://www.facebook.com"` |

## Sample Payload

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+15551234567",
  "phoneLast4": "4567",
  "address": "123 Main Street",
  "city": "Phoenix",
  "state": "AZ",
  "stateName": "Arizona",
  "zipCode": "85001",
  "coverageAmount": 15000,
  "ageRange": "60-69",
  "healthStatus": "Good - Managed conditions, no recent hospitalizations",
  "tobaccoUse": "No, never",
  "coveragePurpose": "Funeral & Burial Costs,Leave Money to Family",
  "ipAddress": "192.168.1.1",
  "source": "SeniorSimple Final Expense Quiz",
  "funnelType": "final-expense-quote",
  "originallyCreated": "2024-01-15T10:30:00.000Z",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "utmSource": "facebook",
  "utmMedium": "cpc",
  "utmCampaign": "final_expense_2024",
  "utmTerm": "",
  "utmContent": "",
  "sessionId": "test_1705312200000",
  "leadScore": 85,
  "landingPage": "/free-burial-life-insurance-guide",
  "referrer": "https://www.facebook.com"
}
```

## Field Value Options

### Age Range Options
- `"50-55"`
- `"56-60"`
- `"61-65"`
- `"66-70"`
- `"71-75"`
- `"76-80"`
- `"81-85"`

### Health Status Options
- `"Excellent - No major health issues"`
- `"Good - Minor health conditions, well managed"`
- `"Fair - Some health conditions, taking medications"`
- `"Poor - Multiple health conditions or serious illness"`

### Tobacco Use Options
- `"No, I don't use any tobacco products"`
- `"Yes, I use tobacco products"`

### Coverage Purpose Options (Multi-select, comma-separated)
- `"Funeral and burial expenses"`
- `"Cremation costs"`
- `"Medical bills and final expenses"`
- `"Outstanding debts"`
- `"Leave something for loved ones"`
- `"Other"`

## GoHighLevel Field Mapping Recommendations

### Contact Fields
- `firstName` → Contact First Name
- `lastName` → Contact Last Name
- `email` → Contact Email
- `phone` → Contact Phone
- `phoneLast4` → Custom Field (for verification)

### Address Fields
- `address` → Contact Address Line 1
- `city` → Contact City
- `state` → Contact State
- `zipCode` → Contact ZIP Code

### Custom Fields (Create in GHL)
- `coverageAmount` → Custom Field: "Coverage Amount"
- `ageRange` → Custom Field: "Age Range"
- `healthStatus` → Custom Field: "Health Status"
- `tobaccoUse` → Custom Field: "Tobacco Use"
- `coveragePurpose` → Custom Field: "Coverage Purpose"
- `funnelType` → Custom Field: "Funnel Type"
- `source` → Custom Field: "Lead Source"
- `sessionId` → Custom Field: "Session ID"
- `leadScore` → Custom Field: "Lead Score"
- `utmSource` → Custom Field: "UTM Source"
- `utmMedium` → Custom Field: "UTM Medium"
- `utmCampaign` → Custom Field: "UTM Campaign"
- `landingPage` → Custom Field: "Landing Page"
- `referrer` → Custom Field: "Referrer"

## Notes

1. **Flat Structure**: All fields are at the root level - no nested objects like `quizAnswers` or `utmParams`
2. **Phone Format**: Phone numbers are sent in E.164 format (`+1XXXXXXXXXX`)
3. **Coverage Amount**: Integer value in USD (e.g., `15000` = $15,000)
4. **Timestamps**: ISO 8601 format with timezone (`2024-01-15T10:30:00.000Z`)
5. **Multi-select Values**: Comma-separated string (e.g., `"Option1,Option2"`)
6. **Empty Values**: Use empty string `""` for optional fields that don't have values

