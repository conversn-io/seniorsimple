"use client";

import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { FAQ } from "./FAQ";

interface AgentAssignmentPageProps {
  answers: Record<string, any>;
  onRestart: () => void;
}

export const AgentAssignmentPage = ({ answers, onRestart }: AgentAssignmentPageProps) => {
  useEffect(() => {
    // Track page view for analytics
    console.log("🎯 Agent Assignment Page Loaded:", {
      timestamp: new Date().toISOString(),
      answers: Object.keys(answers),
      firstName: answers.personalInfo?.firstName || answers.firstName
    });
    
    // Submit agent assignment form when component mounts
    const submitAssignment = async () => {
      try {
        console.log("📋 Agent Assignment Form Data:", {
          answers,
          timestamp: new Date().toISOString(),
          sessionId: answers.sessionId || 'unknown'
        });
        console.log("✅ Agent assignment form submitted successfully on page load");
      } catch (error) {
        console.warn("❌ Failed to submit agent assignment form:", error);
      }
    };
    
    submitAssignment();
  }, [answers]);

  const firstName = answers.personalInfo?.firstName || answers.firstName || 'Keenan';

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Announcement Bar - Directly under header nav */}
      <div className="w-full bg-green-100 border-b border-green-300 text-green-900 text-sm py-3 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2f6d46]">
          Well done, {firstName}! Your Quote Is Being Generated
        </h1>
      </div>

      {/* Hero Section */}
      <section className="bg-white pt-8 pb-3">
        <div className="max-w-4xl mx-auto px-6" style={{ paddingLeft: 'calc(1.5rem + 2em)', paddingRight: 'calc(1.5rem + 2em)' }}>
          {/* Progress Steps - Matching quiz progress bar style */}
          <div className="mb-4">
            {/* Progress Bar - Set to 50% */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-[#36596A] h-4 rounded-full transition-all duration-500 ease-out shadow-sm" 
                style={{ width: '50%' }}
              />
            </div>
            
            {/* Progress Steps as Links */}
            <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-600">Complete Quiz</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#36596A] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <span className="text-[#36596A]">Connect with Advisor</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-gray-500">Get Annuity</span>
              </div>
            </div>
          </div>

          {/* Main Headline - Right below progress bar */}
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-slate-700 text-center">
            You'll be getting a call now from a licensed agent to go over your details
          </h2>
        </div>
      </section>

      {/* Agent Assignment */}
      <section className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-6" style={{ paddingLeft: 'calc(1.5rem + 2em)', paddingRight: 'calc(1.5rem + 2em)' }}>
          <div className="bg-slate-50 rounded-2xl p-8 mb-8">
            <div className="max-w-md mx-auto">
              {/* Agent Photo - Full crop, no circle - Reduced spacing by 50% */}
              <img 
                src="/images/team/agent-advisor.png" 
                alt="Senior Retirement Income Specialist"
                className="w-full max-w-sm mx-auto mb-3 object-cover rounded-lg"
              />
              
              {/* What Happens Next - Vertical Stack */}
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
                  What Happens Next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</div>
                    <p className="text-slate-600"><strong>Within 24 hours:</strong> Your specialist will call you to discuss your retirement goals</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</div>
                    <p className="text-slate-600"><strong>Custom Analysis:</strong> Receive personalized annuity recommendations based on your quiz</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</div>
                    <p className="text-slate-600"><strong>Your Decision:</strong> No pressure - take time to review and decide what's right for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Responses Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-left mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
              Your Quiz Responses Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {Object.entries(answers).map(([key, value]) => {
                if (key === 'phone' || key === 'email' || key === 'sessionId') return null;
                
                let label = key.charAt(0).toUpperCase() + key.slice(1);
                if (key === 'personalInfo') {
                  if (value?.firstName) {
                    return (
                      <div key={`${key}-firstName`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">First Name:</span>
                        <span className="text-slate-600 ml-2">{value.firstName}</span>
                      </div>
                    );
                  }
                  if (value?.lastName) {
                    return (
                      <div key={`${key}-lastName`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">Last Name:</span>
                        <span className="text-slate-600 ml-2">{value.lastName}</span>
                      </div>
                    );
                  }
                  return null;
                }
                if (key === 'addressInfo') {
                  if (value?.formatted || value?.fullAddress) {
                    return (
                      <div key={`${key}-address`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">Address:</span>
                        <span className="text-slate-600 ml-2">{value.formatted || value.fullAddress}</span>
                      </div>
                    );
                  }
                  if (value?.city) {
                    return (
                      <div key={`${key}-city`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">City:</span>
                        <span className="text-slate-600 ml-2">{value.city}</span>
                      </div>
                    );
                  }
                  if (value?.stateAbbr || value?.state) {
                    return (
                      <div key={`${key}-state`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">State:</span>
                        <span className="text-slate-600 ml-2">{value.stateAbbr || value.state}</span>
                      </div>
                    );
                  }
                  if (value?.zipCode) {
                    return (
                      <div key={`${key}-zipCode`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">ZIP Code:</span>
                        <span className="text-slate-600 ml-2">{value.zipCode}</span>
                      </div>
                    );
                  }
                  return null;
                }
                if (key === 'locationInfo') {
                  if (value?.zipCode) {
                    return (
                      <div key={`${key}-zipCode`} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">ZIP Code:</span>
                        <span className="text-slate-600 ml-2">{value.zipCode}</span>
                      </div>
                    );
                  }
                  return null;
                }
                if (key === 'investableAssets') label = 'Investable Assets';
                if (key === 'retirementSavings') label = 'Retirement Savings';
                if (key === 'retirementTimeline') label = 'Retirement Timeline';
                if (key === 'currentRetirementPlans') label = 'Current Retirement Plans';
                if (key === 'riskTolerance') label = 'Risk Tolerance';
                if (key === 'currentAge') label = 'Current Age';
                if (key === 'ageRange') label = 'Age Range';
                if (key === 'currentSavings') label = 'Current Savings';
                if (key === 'monthlyIncome') label = 'Monthly Income';
                if (key === 'savingsGoals') label = 'Savings Goals';
                if (key === 'allocationPercent') label = 'Allocation';
                
                // Handle array values (multi-select)
                if (Array.isArray(value)) {
                  return (
                    <div key={key} className="border-b border-slate-100 pb-2">
                      <span className="font-semibold text-slate-700">{label}:</span>
                      <span className="text-slate-600 ml-2">{value.join(', ')}</span>
                    </div>
                  );
                }
                
                // Handle object values (like allocation data)
                if (typeof value === 'object' && value !== null) {
                  if (key === 'allocationPercent' || key === 'fiaAllocation') {
                    return (
                      <div key={key} className="border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">Allocation:</span>
                        <span className="text-slate-600 ml-2">{value.percentage}% (${value.amount?.toLocaleString() || 'N/A'})</span>
                      </div>
                    );
                  }
                  // For other objects, skip (already handled above)
                  return null;
                }
                
                // Skip empty values
                if (!value) return null;
                
                return (
                  <div key={key} className="border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-700">{label}:</span>
                    <span className="text-slate-600 ml-2">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};
