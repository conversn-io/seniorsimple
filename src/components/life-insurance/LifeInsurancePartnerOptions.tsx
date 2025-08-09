import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronDown, ChevronUp, ExternalLink, Phone } from "lucide-react";
import { mockInsuranceProviders, mockFAQs } from "@/data/mockPartners";
import { InsuranceProvider } from "@/types/lifeInsurance";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LifeInsurancePartnerOptionsProps {
  answers?: Record<string, string>;
}

const LifeInsurancePartnerOptions = ({ answers: propAnswers }: LifeInsurancePartnerOptionsProps) => {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const location = useLocation();
  
  // Get answers from props or location state
  const answers = propAnswers || location.state?.answers || {};
  const preference = location.state?.preference;
  const isCallNow = preference === "call-now";

  const userAge = answers?.['birth-date'] ? 
    new Date().getFullYear() - new Date(answers['birth-date']).getFullYear() : 35;
  const userGender = answers?.gender || "male";

  const toggleProvider = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
  };

  const ProviderCard = ({ provider }: { provider: InsuranceProvider }) => {
    const isExpanded = expandedProvider === provider.id;

    return (
      <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{provider.logo}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium ml-1">{provider.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({provider.ratingSource})</span>
                </div>
              </div>
            </div>
            {provider.highlight && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {provider.highlight}
              </Badge>
            )}
          </div>

          <div className="space-y-3 mb-4">
            {provider.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-green-500 text-sm">✓</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleProvider(provider.id)}
              className="flex items-center space-x-1"
            >
              <span>Why We Picked It</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              {isCallNow ? (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Agent Now
                </>
              ) : (
                <>
                  {provider.cta}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-in fade-in-0 slide-in-from-top-1">
              <p className="text-sm text-gray-700 leading-relaxed">{provider.whyPicked}</p>
              {provider.features.length > 3 && (
                <div className="mt-3 space-y-2">
                  {provider.features.slice(3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500 text-sm">✓</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {isCallNow ? "Ready to Connect You! 📞" : "Great News! 🎉"}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Based on your profile ({userAge}-year-old {userGender}), here are the best life insurance options for you:
            </p>
            {isCallNow && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 max-w-md mx-auto mt-4">
                <p className="text-blue-800 font-medium">
                  Click "Call Agent Now" on any provider below to speak with a licensed agent immediately!
                </p>
              </div>
            )}
            <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md mx-auto mt-6">
              <p className="text-sm text-gray-600 mb-1">Estimated monthly premium:</p>
              <p className="text-2xl font-bold text-blue-600">$45 - $85</p>
              <p className="text-xs text-gray-500">*Based on $500,000 coverage</p>
            </div>
          </div>

          {/* Partner Options */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Compare Top-Rated Providers
            </h2>
            {mockInsuranceProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {mockFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                {isCallNow 
                  ? "Click on any 'Call Agent Now' button above to speak with a licensed agent immediately. They'll help you complete your application over the phone."
                  : "Click on any 'Get Quote' button above to begin your application process. Most quotes take less than 10 minutes to complete."
                }
              </p>
              <p className="text-sm text-gray-500">
                🔒 Your information is secure and will only be shared with your selected providers
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LifeInsurancePartnerOptions;