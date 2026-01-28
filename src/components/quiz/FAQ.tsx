"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const annuityFaqData = [
  {
    question: "What is an annuity?",
    answer: "An annuity is a financial product that provides guaranteed income payments, typically for retirement. It's designed to help protect against outliving your savings by providing a steady stream of income for life."
  },
  {
    question: "How do I know if an annuity is right for me?",
    answer: "Annuities are typically suitable for people who want guaranteed income, are concerned about market volatility, or want to supplement their retirement income. Our specialist will help determine if an annuity fits your specific financial goals."
  },
  {
    question: "What types of annuities are available?",
    answer: "There are several types including fixed annuities (guaranteed interest), variable annuities (market-based), and indexed annuities (market participation with downside protection). Each has different features and benefits."
  },
  {
    question: "Are there any fees or charges?",
    answer: "Annuities may have various fees depending on the type and features. Our specialist will explain all costs, fees, and charges associated with any recommended products so you can make an informed decision."
  },
  {
    question: "How long does the consultation take?",
    answer: "The initial consultation typically takes 15-30 minutes. This allows us to understand your goals and provide personalized recommendations. Follow-up calls may be scheduled if needed."
  },
  {
    question: "Is there any obligation to purchase?",
    answer: "Absolutely not. The consultation is completely free with no obligation to purchase anything. We're here to provide information and help you understand your options so you can make the best decision for your situation."
  }
];

const finalExpenseFaqData = [
  {
    question: "What is final expense insurance?",
    answer: "Final expense insurance is a type of whole life insurance designed to cover funeral costs, medical bills, and other end-of-life expenses. It's typically easier to qualify for than traditional life insurance and provides peace of mind for your loved ones."
  },
  {
    question: "How much coverage do I need?",
    answer: "Coverage amounts typically range from $5,000 to $50,000, depending on your needs. Our specialist will help you determine the right amount based on your funeral preferences, outstanding debts, and what you want to leave for your family."
  },
  {
    question: "Do I need a medical exam?",
    answer: "Most final expense policies don't require a medical exam. You'll typically answer a few health questions over the phone, making it easier and faster to get coverage compared to traditional life insurance."
  },
  {
    question: "How much does final expense insurance cost?",
    answer: "Premiums vary based on your age, health, and coverage amount. Most policies are affordable, with monthly premiums typically ranging from $30 to $150. Our specialist will provide quotes from multiple carriers to help you find the best rate."
  },
  {
    question: "How long does the consultation take?",
    answer: "The initial consultation typically takes 15-30 minutes. This allows us to understand your needs and provide personalized quotes from multiple carriers. Follow-up calls may be scheduled if needed."
  },
  {
    question: "Is there any obligation to purchase?",
    answer: "Absolutely not. The consultation is completely free with no obligation to purchase anything. We're here to provide information and help you understand your options so you can make the best decision for your situation."
  }
];

const reverseMortgageFaqData = [
  {
    question: "What is a reverse mortgage (HECM)?",
    answer: "A Home Equity Conversion Mortgage (HECM) is an FHA-insured reverse mortgage that allows homeowners 62 and older to convert part of their home equity into tax-free cash. You can receive funds as a lump sum, monthly payments, line of credit, or combination - all while staying in your home."
  },
  {
    question: "Do I still own my home?",
    answer: "Yes, you remain the owner of your home. You keep the title and can live in the home as long as you maintain it as your primary residence, pay property taxes and insurance, and keep the home in good condition."
  },
  {
    question: "What are the requirements?",
    answer: "To qualify, you must be 62 or older, own your home (or have significant equity), live in the home as your primary residence, and be able to pay property taxes and insurance. The home must meet FHA property standards."
  },
  {
    question: "How much can I receive?",
    answer: "The amount depends on your age, home value, current interest rates, and FHA lending limits. Generally, older borrowers with higher home values can access more equity. Our specialist will calculate your specific amount based on current HECM factors."
  },
  {
    question: "What happens to my existing mortgage?",
    answer: "If you have an existing mortgage, it must be paid off with the reverse mortgage proceeds. Any remaining funds after paying off the mortgage are available to you. Our specialist will explain how this works in your specific situation."
  },
  {
    question: "When do I have to repay the loan?",
    answer: "The loan becomes due when you sell the home, move out permanently, or pass away. At that time, you or your heirs can repay the loan and keep any remaining equity, or sell the home to repay the loan. The loan amount can never exceed the home's value."
  },
  {
    question: "How long does the consultation take?",
    answer: "The initial consultation typically takes 15-30 minutes. Your licensed specialist will review your property details, explain your options, and answer all your questions. Follow-up calls may be scheduled if needed."
  },
  {
    question: "Is there any obligation?",
    answer: "Absolutely not. The consultation is completely free with no obligation. We're here to provide information and help you understand your reverse mortgage options so you can make an informed decision."
  }
];

interface FAQProps {
  funnelType?: string;
}

export const FAQ = ({ funnelType }: FAQProps = {} as FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Determine which FAQ data to use based on funnel type
  const isFinalExpense = funnelType === 'final-expense-quote' || 
    (typeof window !== 'undefined' && window.location.pathname.includes('final-expense'));
  const isReverseMortgage = funnelType === 'reverse-mortgage-calculator' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('reverse-mortgage'));
  const faqData = isReverseMortgage 
    ? reverseMortgageFaqData 
    : isFinalExpense 
    ? finalExpenseFaqData 
    : annuityFaqData;

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Have more questions? Our specialist is here to help.
          </p>
          <a 
            href="tel:+18585046544" 
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Call +1 (858) 504-6544
          </a>
        </div>
      </div>
    </section>
  );
};

