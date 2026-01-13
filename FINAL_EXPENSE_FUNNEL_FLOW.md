# Final Expense Funnel Flow Sequence

## Overview
This document describes the complete multi-page funnel sequence for the Final Expense Life Insurance lead generation funnel hosted on `mortgagesimple.org`.

## Funnel Flow Sequence

### **Page 1: Landing Page** 
**URL:** `https://mortgagesimple.org/burial-life-insurance`  
**Title:** Free Burial Life Insurance Guide  
**Purpose:** Initial entry point - captures interest with guide offer

**Key Elements:**
- Hero section with headline about protecting family
- Primary CTA: "Get The FREE Burial Life Insurance Guide"
- Secondary CTA: "Click Here To Request Your Free Guide"
- Footer with copyright and privacy policy

**User Action:** Click CTA button → Proceeds to Page 2

---

### **Page 2: Guide Confirmation Survey**
**URL:** `https://mortgagesimple.org/insurance-guide-confirmation`  
**Title:** Burial Insurance Guide Confirmation Survey  
**Purpose:** First data capture step - collects initial contact information

**Key Elements:**
- Form fields (likely email, name, phone)
- Survey/confirmation step
- Multiple form sections visible

**User Action:** Complete form → Proceeds to Page 3

---

### **Page 3: Custom Quote Confirmation**
**URL:** `https://mortgagesimple.org/custom-quote-confirmation`  
**Title:** Insurance Survey Confirmation  
**Purpose:** Second data capture step - collects additional qualifying information

**Key Elements:**
- Form fields for custom quote request
- Survey confirmation step
- Additional qualification questions

**User Action:** Complete form → Proceeds to Page 4

---

### **Page 4: Appointment Confirmation**
**URL:** `https://mortgagesimple.org/appointmentconfirmation`  
**Title:** Insurance Survey Confirmation  
**Purpose:** Confirms appointment booking and provides next steps

**Key Elements:**
- Appointment confirmation message
- Link: "Click here to read our free burial insurance guide"
- Thank you/confirmation content

**User Action:** Click guide link → Proceeds to Page 7 (Guide) OR continues to Page 5

---

### **Page 5: New Quote Request**
**URL:** `https://mortgagesimple.org/new-burial-life-insurance-quote`  
**Title:** Burial Insurance Guide Confirmation Survey  
**Purpose:** Additional quote request or re-engagement step

**Key Elements:**
- Form fields for new quote request
- Survey/confirmation step
- Multiple form sections

**User Action:** Complete form → Proceeds to Page 6

---

### **Page 6: Appointment Follow-Up**
**URL:** `https://mortgagesimple.org/appointment-follow-up`  
**Title:** Insurance Appointment  
**Purpose:** Follow-up appointment scheduling or confirmation

**Key Elements:**
- Appointment follow-up form
- Scheduling interface
- Additional data capture

**User Action:** Complete follow-up → May loop back or proceed to Guide

---

### **Page 7: Final Guide Content**
**URL:** `https://mortgagesimple.org/burial-insurance-guide`  
**Title:** Free Final Expense Life Insurance Guide  
**Purpose:** Long-form educational content - the actual guide

**Key Elements:**
- Navigation: Home, About, Contact
- Hero headline: "Ready to protect your family? Click Here To Request Your Custom Final Expense Life Insurance Quote Today"
- Primary CTA: "GET MY FREE CUSTOM FINAL EXPENSE LIFE INSURANCE QUOTE"
- Video content (with enable sound button)
- Comprehensive educational content about:
  - What is Final Expense Life Insurance
  - Why people choose it
  - How it works
  - Coverage amounts
  - Costs and factors
  - Who should consider it
  - How to apply

**User Action:** Read guide → Click CTA → May loop back to earlier steps or complete conversion

---

## Funnel Flow Diagram

```
┌─────────────────────────────────────┐
│  Page 1: Landing Page               │
│  /burial-life-insurance              │
│  [Get FREE Guide CTA]                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Page 2: Guide Confirmation         │
│  /insurance-guide-confirmation      │
│  [Form: Email, Name, Phone]          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Page 3: Custom Quote Confirmation  │
│  /custom-quote-confirmation         │
│  [Form: Additional Qualifying Info] │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Page 4: Appointment Confirmation   │
│  /appointmentconfirmation            │
│  [Confirmation + Guide Link]         │
└──────────────┬──────────────────────┘
               │
               ├──────────────────────┐
               │                      │
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  Page 5: New Quote       │  │  Page 7: Guide Content    │
│  /new-burial-life-       │  │  /burial-insurance-guide  │
│  insurance-quote         │  │  [Long-form Educational]  │
│  [Form: Re-engagement]   │  │  [CTA: Get Quote]         │
└──────────────┬───────────┘  └──────────────────────────┘
               │                      │
               ▼                      │
┌─────────────────────────────────────┐ │
│  Page 6: Appointment Follow-Up     │ │
│  /appointment-follow-up             │ │
│  [Form: Follow-up Scheduling]       │ │
└─────────────────────────────────────┘ │
                                        │
                                        │ (Loop back)
                                        │
                                        └──────────────┐
                                                      │
                                                      ▼
                                            [Conversion/Lead Delivery]
```

## Key Observations

1. **Multi-Step Data Capture:** The funnel uses progressive profiling across multiple pages (Pages 2, 3, 5, 6) to collect information incrementally rather than asking for everything at once.

2. **Guide as Value Exchange:** The actual educational guide (Page 7) is positioned as the reward for completing the initial steps, creating a value exchange dynamic.

3. **Multiple Entry Points:** Users can access the guide directly from Page 4 (appointment confirmation) or through the main flow.

4. **Re-Engagement Loops:** Pages 5 and 6 appear to be re-engagement steps that can loop users back into the funnel or capture additional information.

5. **Appointment Booking Integration:** The funnel includes appointment confirmation and follow-up steps, suggesting integration with a calendar booking system.

6. **Educational Content Strategy:** The final guide page uses long-form educational content to build trust and provide value before the final CTA.

## Implementation Notes for SeniorSimple

When implementing this funnel structure for SeniorSimple's final expense funnel:

1. **Page Structure:** Create dedicated routes for each step
2. **Form Progression:** Implement progressive profiling to collect data incrementally
3. **Session Tracking:** Maintain session data across all pages
4. **Guide Content:** Position the educational guide as the value exchange
5. **Appointment Integration:** Connect to calendar booking system
6. **Re-Engagement:** Implement follow-up sequences for users who don't convert immediately

