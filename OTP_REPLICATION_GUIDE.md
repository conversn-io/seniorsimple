# OTP Service Replication Guide

## 🎯 **Complete Setup Instructions**

This guide provides step-by-step instructions for replicating the OTP validation service in any new project.

## 📋 **Prerequisites**

- Node.js 18+ and npm
- Supabase account
- Twilio account
- Git repository

## 🚀 **Step-by-Step Replication**

### **Step 1: Copy Core Files**

Copy these files to your new project:

```
src/components/otp/
├── OTPVerification.tsx
├── PhoneInput.tsx
├── OTPInput.tsx
├── examples/
│   ├── SimpleOTPExample.tsx
│   ├── AdvancedOTPExample.tsx
│   └── index.ts
├── index.ts
└── README.md

src/hooks/
└── useOTP.ts

src/utils/
├── phone-utils.ts
└── otp-utils.ts

src/types/
└── otp-types.ts

src/lib/
└── your-db.ts (rename from callready-quiz-db.ts)
```

### **Step 2: Install Dependencies**

```bash
npm install @supabase/supabase-js
```

### **Step 3: Set Up Supabase Project**

1. **Create New Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down URL and API keys

2. **Create Database Tables**
   ```sql
   -- verified_leads table
   CREATE TABLE verified_leads (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     phone_number TEXT UNIQUE NOT NULL,
     email TEXT,
     first_name TEXT,
     last_name TEXT,
     source TEXT NOT NULL,
     status TEXT DEFAULT 'verified',
     quiz_answers JSONB,
     property_location TEXT,
     verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     contacted_at TIMESTAMP WITH TIME ZONE,
     converted_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- otp_verifications table
   CREATE TABLE otp_verifications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     phone_number TEXT NOT NULL,
     otp_code TEXT NOT NULL,
     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
     attempts INTEGER DEFAULT 0,
     verified BOOLEAN DEFAULT FALSE,
     verified_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- analytics_events table
   CREATE TABLE analytics_events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     event_name TEXT NOT NULL,
     event_category TEXT,
     event_label TEXT,
     event_value NUMERIC,
     user_id TEXT,
     session_id TEXT,
     page_url TEXT,
     referrer TEXT,
     user_agent TEXT,
     ip_address TEXT,
     properties JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Set Up Row Level Security (RLS)**
   ```sql
   -- Enable RLS
   ALTER TABLE verified_leads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

   -- Create policies (adjust as needed)
   CREATE POLICY "Allow service role full access" ON verified_leads
     FOR ALL USING (auth.role() = 'service_role');

   CREATE POLICY "Allow service role full access" ON otp_verifications
     FOR ALL USING (auth.role() = 'service_role');

   CREATE POLICY "Allow service role full access" ON analytics_events
     FOR ALL USING (auth.role() = 'service_role');
   ```

### **Step 4: Deploy Supabase Edge Functions**

1. **Create Functions Directory**
   ```bash
   mkdir -p supabase/functions/send-otp
   mkdir -p supabase/functions/verify-otp
   ```

2. **Create send-otp Function**
   ```typescript
   // supabase/functions/send-otp/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const { phoneNumber } = await req.json()
       
       if (!phoneNumber) {
         return new Response(
           JSON.stringify({ error: 'Phone number is required' }),
           { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Initialize Supabase client
       const supabaseUrl = Deno.env.get('SUPABASE_URL')!
       const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
       const supabase = createClient(supabaseUrl, supabaseServiceKey)

       // Get Twilio credentials
       const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
       const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
       const twilioVerifyServiceSid = Deno.env.get('VERIFY_SERVICE_SID')

       if (!twilioAccountSid || !twilioAuthToken || !twilioVerifyServiceSid) {
         return new Response(
           JSON.stringify({ error: 'Twilio credentials not configured' }),
           { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Send SMS via Twilio Verify Service
       const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`
       
       const twilioResponse = await fetch(twilioUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
           'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
           To: phoneNumber,
           Channel: 'sms'
         })
       })

       const twilioResult = await twilioResponse.json()

       if (!twilioResponse.ok) {
         return new Response(
           JSON.stringify({ 
             error: 'Failed to send verification code',
             details: twilioResult.message || 'Unknown Twilio error'
           }),
           { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       return new Response(
         JSON.stringify({ 
           sent: true, 
           message: 'Verification code sent successfully',
           verificationSid: twilioResult.sid
         }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )

     } catch (error) {
       return new Response(
         JSON.stringify({ 
           error: 'Internal server error',
           details: error.message || 'Unknown error'
         }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   })
   ```

3. **Create verify-otp Function**
   ```typescript
   // supabase/functions/verify-otp/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const { phoneNumber, otp } = await req.json()
       
       if (!phoneNumber || !otp) {
         return new Response(
           JSON.stringify({ error: 'Phone number and OTP code are required' }),
           { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Initialize Supabase client
       const supabaseUrl = Deno.env.get('SUPABASE_URL')!
       const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
       const supabase = createClient(supabaseUrl, supabaseServiceKey)

       // Get Twilio credentials
       const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
       const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
       const twilioVerifyServiceSid = Deno.env.get('VERIFY_SERVICE_SID')

       if (!twilioAccountSid || !twilioAuthToken || !twilioVerifyServiceSid) {
         return new Response(
           JSON.stringify({ error: 'Twilio credentials not configured' }),
           { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Verify with Twilio Verify Service
       const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/VerificationCheck`
       
       const twilioResponse = await fetch(twilioUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
           'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
           To: phoneNumber,
           Code: otp
         })
       })

       const twilioResult = await twilioResponse.json()

       if (!twilioResponse.ok) {
         return new Response(
           JSON.stringify({ 
             verified: false,
             error: 'Verification failed',
             details: twilioResult.message || 'Invalid verification code'
           }),
           { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       const isVerified = twilioResult.status === 'approved'

       return new Response(
         JSON.stringify({ 
           verified: isVerified,
           message: isVerified ? 'Verification successful' : 'Verification failed',
           status: twilioResult.status
         }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )

     } catch (error) {
       return new Response(
         JSON.stringify({ 
           verified: false,
           error: 'Internal server error',
           details: error.message || 'Unknown error'
         }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   })
   ```

4. **Deploy Functions**
   ```bash
   npx supabase functions deploy send-otp
   npx supabase functions deploy verify-otp
   ```

### **Step 5: Set Up Twilio**

1. **Create Twilio Account**
   - Go to [twilio.com](https://twilio.com)
   - Create account and verify phone number
   - Get Account SID and Auth Token

2. **Set Up Verify Service**
   - Go to Verify → Services
   - Create new service
   - Note down Service SID

3. **Add Secrets to Supabase**
   ```bash
   npx supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
   npx supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
   npx supabase secrets set VERIFY_SERVICE_SID=your_verify_service_sid
   npx supabase secrets set SUPABASE_URL=your_supabase_url
   npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### **Step 6: Configure Environment Variables**

1. **Client-side Variables (NEXT_PUBLIC_ prefix required)**
   ```env
   NEXT_PUBLIC_SUPABASE_QUIZ_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY=your_anon_key
   ```

2. **Server-side Variables (for API routes)**
   ```env
   SUPABASE_QUIZ_URL=your_supabase_url
   SUPABASE_QUIZ_ANON_KEY=your_anon_key
   SUPABASE_QUIZ_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Add to Vercel (if using Vercel)**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_QUIZ_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY production
   vercel env add SUPABASE_QUIZ_URL production
   vercel env add SUPABASE_QUIZ_ANON_KEY production
   vercel env add SUPABASE_QUIZ_SERVICE_ROLE_KEY production
   ```

### **Step 7: Update Database Client**

Update `src/lib/your-db.ts` (rename from callready-quiz-db.ts):

```typescript
import { createClient } from "@supabase/supabase-js"

// Your Database Configuration
const YOUR_DB_URL = process.env.SUPABASE_QUIZ_URL || "your_supabase_url"
const YOUR_DB_ANON_KEY = process.env.SUPABASE_QUIZ_ANON_KEY || "your_anon_key"
const YOUR_DB_SERVICE_KEY = process.env.SUPABASE_QUIZ_SERVICE_ROLE_KEY || "your_service_role_key"

// Use service role key for server-side operations (bypasses RLS)
export const yourDb = createClient(YOUR_DB_URL, YOUR_DB_SERVICE_KEY)

// Use anon key for client-side operations (respects RLS)
export const yourDbAnon = createClient(YOUR_DB_URL, YOUR_DB_ANON_KEY)

export interface YourDatabase {
  public: {
    Tables: {
      verified_leads: {
        Row: {
          id: string
          phone_number: string
          email: string | null
          first_name: string | null
          last_name: string | null
          source: string
          status: string
          quiz_answers: any
          property_location: string | null
          verified_at: string
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone_number: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          source: string
          status?: string
          quiz_answers?: any
          property_location?: string | null
          verified_at?: string
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          source?: string
          status?: string
          quiz_answers?: any
          property_location?: string | null
          verified_at?: string
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      otp_verifications: {
        Row: {
          id: string
          phone_number: string
          otp_code: string
          expires_at: string
          attempts: number
          verified: boolean
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone_number: string
          otp_code: string
          expires_at: string
          attempts?: number
          verified?: boolean
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          otp_code?: string
          expires_at?: string
          attempts?: number
          verified?: boolean
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          event_category: string | null
          event_label: string | null
          event_value: number | null
          user_id: string | null
          session_id: string | null
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          properties: any
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          event_category?: string | null
          event_label?: string | null
          event_value?: number | null
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          properties?: any
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          event_category?: string | null
          event_label?: string | null
          event_value?: number | null
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          properties?: any
          created_at?: string
        }
      }
    }
  }
}
```

### **Step 8: Test Integration**

1. **Create Test Page**
   ```tsx
   // src/app/otp-test/page.tsx
   'use client';

   import { OTPVerification } from '@/components/otp';

   export default function OTPTestPage() {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
         <div className="max-w-md w-full">
           <h1 className="text-2xl font-bold text-gray-900 mb-4">OTP Test</h1>
           <OTPVerification
             phoneNumber="+1234567890"
             onVerificationComplete={(phone) => {
               console.log('Verified:', phone);
               alert('Phone verified successfully!');
             }}
             debugMode={true}
           />
         </div>
       </div>
     );
   }
   ```

2. **Test the Integration**
   - Visit `/otp-test`
   - Enter a real phone number
   - Verify SMS delivery
   - Check console logs

### **Step 9: Deploy and Verify**

1. **Deploy to Production**
   ```bash
   # If using Vercel
   vercel --prod
   
   # If using other platforms, follow their deployment process
   ```

2. **Verify Everything Works**
   - [ ] SMS delivery works
   - [ ] OTP verification works
   - [ ] Database records are created
   - [ ] No console errors
   - [ ] Mobile optimization works

## 🔧 **Customization Options**

### **Styling**
```tsx
<OTPVerification
  phoneNumber="+1234567890"
  onVerificationComplete={handleComplete}
  className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
/>
```

### **Custom Webhooks**
```tsx
// Add to your API routes
const handleVerificationComplete = async (phone: string, data: any) => {
  // Send to your CRM
  await fetch('your-webhook-url', {
    method: 'POST',
    body: JSON.stringify({ phone, ...data })
  });
};
```

### **Custom Error Handling**
```tsx
<OTPVerification
  phoneNumber="+1234567890"
  onVerificationComplete={handleComplete}
  onVerificationFailed={(error) => {
    console.error('OTP failed:', error);
    // Custom error handling
  }}
/>
```

## 📚 **Documentation**

After setup, you'll have:
- [OTP Integration Guide](./OTP_INTEGRATION_GUIDE.md)
- [System Summary](./OTP_SYSTEM_SUMMARY.md)
- [Quick Reference](./OTP_QUICK_REFERENCE.md)
- [Shared Service Docs](./SHARED_OTP_SERVICE.md)

## 🎯 **Success Checklist**

- [ ] All files copied
- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Database tables created
- [ ] Edge Functions deployed
- [ ] Twilio Verify Service set up
- [ ] Environment variables configured
- [ ] Test page working
- [ ] SMS delivery verified
- [ ] Production deployment successful

## 🚨 **Troubleshooting**

### **Common Issues**

1. **SMS Not Received**
   - Check Twilio console
   - Verify phone number format
   - Check spam folder

2. **401 Errors**
   - Verify environment variables
   - Check Supabase secrets
   - Ensure Edge Functions are deployed

3. **Database Errors**
   - Check table structure
   - Verify RLS policies
   - Check service role key

4. **Component Not Rendering**
   - Check import paths
   - Verify dependencies
   - Check for TypeScript errors

### **Debug Mode**
```tsx
<OTPVerification
  debugMode={true}  // Enables detailed console logging
/>
```

## 🎉 **You're Ready!**

Once all steps are completed, you'll have a fully functional OTP verification system that can be integrated into any funnel or application. The system includes:

- ✅ Real Twilio SMS delivery
- ✅ Supabase backend integration
- ✅ Mobile-optimized components
- ✅ Comprehensive error handling
- ✅ TypeScript support
- ✅ Production-ready deployment

**Your OTP service is now ready for production use! 🚀**
