# OTP System Integration Guide

## 🎯 Overview

This guide shows how to integrate the reusable OTP system into any funnel or application. The system is designed to be drop-in ready with minimal configuration and includes **real Twilio SMS integration** for production use.

## ✅ **Production Ready**

The OTP system now includes:
- **Real Twilio SMS delivery** (no more test mode)
- **Supabase Edge Functions** for reliable backend processing
- **Comprehensive error handling** and user feedback
- **Mobile-optimized** components for paid traffic
- **TypeScript support** for type safety

## 🚀 Quick Integration

### 1. Import the Component
```tsx
import { OTPVerification } from '@/components/otp';
```

### 2. Add to Your Component
```tsx
function MyFunnel() {
  const handleVerificationComplete = (phoneNumber: string) => {
    // Handle successful verification
    console.log('Phone verified:', phoneNumber);
    // Redirect to next step, update state, etc.
  };

  return (
    <OTPVerification
      phoneNumber=""
      onVerificationComplete={handleVerificationComplete}
      showPhoneInput={true}
      autoSendOTP={false}
    />
  );
}
```

## 📱 Funnel Integration Examples

### Quiz Funnel
```tsx
// src/components/quiz/QuizStep.tsx
import { OTPVerification } from '@/components/otp';

export function QuizOTPStep({ onComplete, onBack }) {
  return (
    <div className="quiz-step">
      <h2>Verify Your Phone Number</h2>
      <OTPVerification
        phoneNumber=""
        onVerificationComplete={onComplete}
        showPhoneInput={true}
        autoSendOTP={true}
        className="quiz-otp"
      />
      <button onClick={onBack} className="back-button">
        ← Back
      </button>
    </div>
  );
}
```

### Contact Form
```tsx
// src/components/forms/ContactForm.tsx
import { useOTP } from '@/hooks/useOTP';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const { state, phoneNumber, setPhoneNumber, sendOTP, verifyOTP } = useOTP({
    phoneNumber: formData.phone,
    onVerificationComplete: (phone) => {
      setFormData(prev => ({ ...prev, phone }));
      // Mark phone as verified
    }
  });

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
      />
      <input
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone"
      />
      <button onClick={sendOTP} disabled={!state.canResend}>
        Send OTP
      </button>
      {/* OTP input and verify button */}
    </form>
  );
}
```

### Landing Page
```tsx
// src/components/landing/LeadCapture.tsx
import { OTPVerification } from '@/components/otp';

export function LeadCapture() {
  const [step, setStep] = useState<'form' | 'otp' | 'complete'>('form');
  const [leadData, setLeadData] = useState({});

  const handleOTPComplete = (phone: string) => {
    setLeadData(prev => ({ ...prev, phone, verified: true }));
    setStep('complete');
  };

  if (step === 'otp') {
    return (
      <div className="lead-capture">
        <h2>Verify Your Phone Number</h2>
        <OTPVerification
          phoneNumber={leadData.phone}
          onVerificationComplete={handleOTPComplete}
          showPhoneNumber={true}
        />
      </div>
    );
  }

  // ... other steps
}
```

## 🎨 Styling Integration

### Custom Styling
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className="my-custom-otp max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
/>
```

### Tailwind Integration
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className="w-full max-w-sm mx-auto p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
/>
```

### CSS Module Integration
```tsx
import styles from './OTP.module.css';

<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className={styles.otpContainer}
/>
```

## 🔧 Advanced Configuration

### Custom Resend Logic
```tsx
const handleCustomResend = async (phoneNumber: string): Promise<boolean> => {
  try {
    // Custom resend logic
    const response = await fetch('/api/custom-resend', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber })
    });
    return response.ok;
  } catch (error) {
    console.error('Resend failed:', error);
    return false;
  }
};

<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  onResendOTP={handleCustomResend}
/>
```

### Error Handling
```tsx
const handleVerificationFailed = (error: string) => {
  console.error('OTP verification failed:', error);
  
  // Custom error handling
  if (error.includes('expired')) {
    showNotification('Code expired. Please request a new one.');
  } else if (error.includes('invalid')) {
    showNotification('Invalid code. Please try again.');
  } else {
    showNotification('Verification failed. Please try again.');
  }
};

<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  onVerificationFailed={handleVerificationFailed}
/>
```

### Debug Mode
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  debugMode={process.env.NODE_ENV === 'development'}
/>
```

## 🧪 Testing Integration

### Unit Tests
```tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { OTPVerification } from '@/components/otp';

test('OTP verification flow', async () => {
  const mockOnComplete = jest.fn();
  
  render(
    <OTPVerification
      phoneNumber="+18587524266"
      onVerificationComplete={mockOnComplete}
    />
  );
  
  // Test the flow
  fireEvent.click(screen.getByText('Send OTP'));
  await waitFor(() => {
    expect(mockOnComplete).toHaveBeenCalled();
  });
});
```

### Integration Tests
```tsx
import { useOTP } from '@/hooks/useOTP';

test('useOTP hook integration', () => {
  const { result } = renderHook(() => useOTP({
    phoneNumber: '+18587524266',
    onVerificationComplete: jest.fn()
  }));
  
  expect(result.current.isValidPhone).toBe(true);
});
```

## 🚀 Deployment Checklist

### Prerequisites
- [ ] Supabase project with Edge Functions deployed
- [ ] Twilio account with Verify Service configured
- [ ] Environment variables set
- [ ] OTP system components imported

### Environment Variables
```env
# Client-side (accessible in browser)
NEXT_PUBLIC_SUPABASE_QUIZ_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY=your_anon_key

# Server-side (for API routes)
SUPABASE_QUIZ_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
SUPABASE_QUIZ_ANON_KEY=your_anon_key
SUPABASE_QUIZ_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Secrets (Edge Functions)
```bash
# Set in Supabase dashboard or via CLI
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
VERIFY_SERVICE_SID=your_verify_service_sid
SUPABASE_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### ✅ **Verified Configuration**
The system has been tested and verified with:
- **Real Twilio SMS delivery** to phone numbers
- **Supabase Edge Functions** properly configured
- **Environment variables** correctly set
- **Production deployment** working

### Testing
- [ ] Test phone number formatting
- [ ] Test OTP sending
- [ ] Test OTP verification
- [ ] Test error handling
- [ ] Test resend functionality

## 📱 Mobile Optimization

### Responsive Design
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className="w-full max-w-sm mx-auto p-4 sm:p-6"
/>
```

### Touch Optimization
```tsx
<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleComplete}
  className="touch-optimized"
/>
```

## 🔄 State Management Integration

### Redux Integration
```tsx
import { useDispatch } from 'react-redux';
import { setVerifiedPhone } from '@/store/otpSlice';

const dispatch = useDispatch();

const handleVerificationComplete = (phone: string) => {
  dispatch(setVerifiedPhone(phone));
};

<OTPVerification
  phoneNumber="+18587524266"
  onVerificationComplete={handleVerificationComplete}
/>
```

### Zustand Integration
```tsx
import { useOTPStore } from '@/store/otpStore';

const { setVerifiedPhone } = useOTPStore();

const handleVerificationComplete = (phone: string) => {
  setVerifiedPhone(phone);
};
```

## 🎯 Best Practices

### 1. Error Handling
Always provide user-friendly error messages and fallback options.

### 2. Loading States
Show loading indicators during OTP sending and verification.

### 3. Accessibility
Ensure proper ARIA labels and keyboard navigation.

### 4. Performance
Use the hook for complex state management, component for simple cases.

### 5. Security
Never log sensitive information in production.

## 📚 Additional Resources

- [Full Documentation](./src/components/otp/README.md)
- [TypeScript Types](./src/types/otp-types.ts)
- [Utility Functions](./src/utils/otp-utils.ts)
- [Examples](./src/components/otp/examples/)
- [Test Page](./src/app/otp-test/page.tsx)

## 🤝 Support

For questions or issues:
1. Check the documentation
2. Review the examples
3. Test with the test page
4. Check the console for debug logs
