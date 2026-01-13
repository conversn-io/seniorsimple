# Final Expense Quiz Update Plan

## Overview
Update the Final Expense Quiz to match the 4-page progressive profiling model from FEX-Quiz.md.

## Current Structure vs New Structure

### Current (7 questions, single flow)
1. Age Range
2. Health Status
3. Tobacco Use
4. Coverage Amount
5. Coverage Purpose
6. Address Info
7. Personal Info (full)

### New (4-page model, 13 questions total)

**PAGE 1: SOFT ENTRY (Coverage & Age)**
- Q1: Coverage Amount (slider)
- Q2: Age Range

**PAGE 2: HEALTH PRE-QUALIFICATION**
- Q3: Tobacco/Nicotine Use
- Q4-6: Health Screening (multi-select with "None" option)
  - Includes reassurance microcopy

**PAGE 3: LOCATION & CONTACT**
- Q7: Address Info
- Q8: Contact Info (First Name, Email, Phone only)

**PAGE 4: FINAL QUALIFIERS**
- Q9: Date of Birth
- Q10: Decision Maker (Yes/No)
- Q11: Last Name
- Q12: Personal Info Final (with TCPA compliance)

## New Question Types Needed

1. **`contact-info-partial`**: First name, email, phone only (no last name, no consent checkbox)
2. **`date-of-birth`**: Date picker for DOB
3. **`decision-maker`**: Yes/No question type
4. **`personal-info-final`**: Full personal info with TCPA compliance disclaimer

## Implementation Steps

1. ✅ Update FINAL_EXPENSE_QUIZ_QUESTIONS array with new structure
2. ⏳ Add new question types to QuizQuestion.tsx:
   - `contact-info-partial`
   - `date-of-birth`
   - `decision-maker`
   - `personal-info-final`
3. ⏳ Add page-level headlines and progress indicators
4. ⏳ Add health screening multi-select with reassurance text
5. ⏳ Add TCPA compliance disclaimer
6. ⏳ Update quiz logic to handle new question flow
7. ⏳ Update webhook payload to include new fields (DOB, decisionMaker)

## Field Mapping

### New Fields to Add to Webhook
- `dateOfBirth`: ISO date string (YYYY-MM-DD)
- `decisionMaker`: boolean (true/false)
- `healthScreening`: array of selected conditions

### Updated Field Names
- Keep existing: `ageRange`, `tobaccoUse`, `coverageAmount`
- Remove: `healthStatus` (replaced by `healthScreening`)
- Keep: `coveragePurpose` (may be removed if not in spec)

## Progress Indicators

Each page should show:
- **Page 1**: "Step 1 of 4: Preferences"
- **Page 2**: "Step 2 of 4: Eligibility"
- **Page 3**: "Step 3 of 4: Contact Information"
- **Page 4**: "Step 4 of 4: Final Verification"

## Headlines

- **Page 1**: "See How Much You Can Save on Final Expense Insurance"
- **Page 2**: "Let's Check Your Eligibility"
- **Page 3**: (No specific headline in spec)
- **Page 4**: "Final Step: Verify Your Identity"

