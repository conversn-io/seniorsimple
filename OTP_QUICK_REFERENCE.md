# OTP Service Quick Reference

## 🚀 **Quick Start**

### **Basic Usage**
```tsx
import { OTPVerification } from '@/components/otp';

<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={(phone) => console.log('Verified:', phone)}
/>
```

### **Advanced Usage**
```tsx
import { useOTP } from '@/hooks/useOTP';

const { state, sendOTP, verifyOTP } = useOTP({
  phoneNumber: '+18587524266',
  onVerificationComplete: (phone) => handleSuccess(phone)
});
```

## 📱 **Common Integration Patterns**

### **Quiz Funnel**
```tsx
<OTPVerification
  phoneNumber={quizData.phone}
  onVerificationComplete={(phone) => {
    setQuizData(prev => ({ ...prev, phone, verified: true }));
    setCurrentStep('results');
  }}
  showPhoneNumber={true}
  className="quiz-otp"
/>
```

### **Lead Capture**
```tsx
<OTPVerification
  phoneNumber={leadData.phone}
  onVerificationComplete={(phone) => {
    sendToCRM({ ...leadData, phone, verified: true });
  }}
  showPhoneInput={true}
  autoSendOTP={true}
/>
```

### **Contact Form**
```tsx
<OTPVerification
  phoneNumber={formData.phone}
  onVerificationComplete={(phone) => {
    setFormData(prev => ({ ...prev, phone, verified: true }));
  }}
  showPhoneInput={true}
/>
```

## 🎨 **Styling Examples**

### **Default (Mobile Optimized)**
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
/>
```

### **Custom Styling**
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
/>
```

### **Tailwind Integration**
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className="w-full max-w-sm mx-auto p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
/>
```

## 🔧 **Configuration Options**

### **Essential Props**
```tsx
<OTPVerification
  phoneNumber="+18587524266"           // Required: Phone number
  onVerificationComplete={handleComplete} // Required: Success callback
  showPhoneInput={true}                // Optional: Show phone input
  showPhoneNumber={true}               // Optional: Display phone number
  autoSendOTP={false}                  // Optional: Auto-send on mount
  className="custom-class"             // Optional: Custom styling
  debugMode={true}                     // Optional: Enable debug logs
/>
```

### **Hook Configuration**
```tsx
const { state, sendOTP, verifyOTP, resendOTP } = useOTP({
  phoneNumber: '+18587524266',
  maxAttempts: 3,                      // Optional: Max attempts
  resendCooldown: 60,                 // Optional: Cooldown seconds
  onVerificationComplete: handleSuccess,
  onVerificationFailed: handleError,
  debugMode: true                      // Optional: Debug logging
});
```

## 🧪 **Testing**

### **Test Page**
Visit `/otp-test` for interactive testing

### **Debug Mode**
```tsx
<OTPVerification
  debugMode={true}  // Enables console logging
/>
```

### **Console Logs**
```
📤 Send OTP Edge Function Called
📱 Send OTP Request
🔐 Twilio Credentials Check
📱 Twilio SMS Response
✅ SMS Sent Successfully via Twilio
```

## 🔒 **Environment Variables**

### **Required (Client-side)**
```env
NEXT_PUBLIC_SUPABASE_QUIZ_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY=your_anon_key
```

### **Required (Supabase Secrets)**
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
VERIFY_SERVICE_SID=your_verify_service_sid
```

## 🚨 **Troubleshooting**

### **SMS Not Received**
1. Check Twilio console for delivery status
2. Verify phone number format (+1XXXXXXXXXX)
3. Check spam/junk folders
4. Try different phone number

### **401 Errors**
1. Verify environment variables are set
2. Check Supabase secrets configuration
3. Ensure Edge Functions are deployed
4. Test with debug mode enabled

### **Component Not Rendering**
1. Check import path: `@/components/otp`
2. Verify dependencies are installed
3. Check for TypeScript errors
4. Ensure proper React version

### **Styling Issues**
1. Verify CSS classes are applied
2. Check Tailwind configuration
3. Ensure responsive design classes
4. Test on different screen sizes

## 📊 **State Management**

### **useOTP Hook State**
```tsx
const { state } = useOTP({...});

// Available state properties:
state.phoneNumber        // Current phone number
state.otp               // Current OTP code
state.isSending         // Sending OTP status
state.isVerifying       // Verifying OTP status
state.isResending       // Resending OTP status
state.attempts          // Number of attempts
state.error             // Current error message
state.canResend         // Can resend OTP
state.canVerify         // Can verify OTP
```

### **Event Handlers**
```tsx
const handleVerificationComplete = (phone: string) => {
  // Phone successfully verified
  console.log('Verified phone:', phone);
  // Update state, redirect, etc.
};

const handleVerificationFailed = (error: string) => {
  // Verification failed
  console.error('Verification failed:', error);
  // Show error message, retry, etc.
};
```

## 🎯 **Best Practices**

### **1. Error Handling**
```tsx
<OTPVerification
  onVerificationFailed={(error) => {
    if (error.includes('expired')) {
      showNotification('Code expired. Please request a new one.');
    } else {
      showNotification('Verification failed. Please try again.');
    }
  }}
/>
```

### **2. Loading States**
```tsx
{state.isSending && <div>Sending OTP...</div>}
{state.isVerifying && <div>Verifying code...</div>}
```

### **3. Mobile Optimization**
```tsx
<OTPVerification
  className="w-full max-w-sm mx-auto p-4 touch-optimized"
/>
```

### **4. Accessibility**
```tsx
<OTPInput
  aria-label="Enter verification code"
  autoComplete="one-time-code"
/>
```

## 📚 **Documentation Links**

- [Full Integration Guide](./OTP_INTEGRATION_GUIDE.md)
- [System Summary](./OTP_SYSTEM_SUMMARY.md)
- [Shared Service Docs](./SHARED_OTP_SERVICE.md)
- [Component README](./src/components/otp/README.md)
- [Test Page](./src/app/otp-test/page.tsx)

## 🎉 **Production Status**

✅ **FULLY OPERATIONAL**
- Real Twilio SMS delivery
- Supabase Edge Functions deployed
- Environment variables configured
- Mobile-optimized components
- Comprehensive error handling
- TypeScript support
- Production-ready

**Ready for use in any funnel! 🚀**




