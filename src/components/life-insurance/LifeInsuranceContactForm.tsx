
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { contactQuestions, ContactQuestion } from "./contactQuestions";

interface LifeInsuranceContactFormProps {
  answers: Record<string, string>;
  onSubmissionComplete: () => void;
  onBack: () => void;
}

const LifeInsuranceContactForm = ({ answers, onSubmissionComplete, onBack }: LifeInsuranceContactFormProps) => {
  const [currentContactQuestion, setCurrentContactQuestion] = useState(0);
  const [contactAnswers, setContactAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactProgress = ((currentContactQuestion + 1) / contactQuestions.length) * 100;

  const handleContactAnswer = (questionId: string, answerValue: string) => {
    const newContactAnswers = { ...contactAnswers, [questionId]: answerValue };
    setContactAnswers(newContactAnswers);
    setInputValue("");

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentContactQuestion < contactQuestions.length - 1) {
        setCurrentContactQuestion(currentContactQuestion + 1);
      } else {
        // Show consent form
        setCurrentContactQuestion(contactQuestions.length);
      }
    }, 500);
  };

  const handleContactBack = () => {
    if (currentContactQuestion > 0) {
      setCurrentContactQuestion(currentContactQuestion - 1);
      setInputValue(contactAnswers[contactQuestions[currentContactQuestion - 1]?.id] || "");
    } else {
      onBack();
    }
  };

  const handleInputSubmit = () => {
    const currentQuestion = contactQuestions[currentContactQuestion];
    if (inputValue.trim()) {
      handleContactAnswer(currentQuestion.id, inputValue);
    }
  };

  const handleSelectOption = (value: string) => {
    const currentQuestion = contactQuestions[currentContactQuestion];
    handleContactAnswer(currentQuestion.id, value);
  };

  const handleFinalSubmit = async () => {
    if (!consent) {
      toast.error("Please agree to the consent terms before submitting.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...contactAnswers,
        consent,
        quizAnswers: answers,
        submittedAt: new Date().toISOString(),
        quizType: "life-insurance"
      };
      
      console.log("Life Insurance Quiz submission:", submissionData);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmissionComplete();
      toast.success("Thank you! We'll contact you within 24 hours with your personalized life insurance quote.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show consent form
  if (currentContactQuestion >= contactQuestions.length) {
    return (
      <section className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContactBack}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Final Step
              </span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                  Almost done!
                </h2>
                
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg mb-8">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked === true)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="consent"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer text-left"
                  >
                    I agree to receive communications about life insurance options and understand that my information will be used to provide personalized quotes. I can unsubscribe at any time.
                  </label>
                </div>
                
                <Button 
                  onClick={handleFinalSubmit}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
                  disabled={isSubmitting || !consent}
                >
                  {isSubmitting ? (
                    "Getting Your Quote..."
                  ) : (
                    <>
                      Let's do this
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Show current contact question
  const currentQuestion = contactQuestions[currentContactQuestion];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContactBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {currentContactQuestion + 1} of {contactQuestions.length}
            </span>
          </div>
          <Progress value={contactProgress} className="h-2" />
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {currentQuestion.title}
              </h2>
              {currentQuestion.subtitle && (
                <p className="text-gray-600 mb-8 text-lg">
                  {currentQuestion.subtitle}
                </p>
              )}
              
              {currentQuestion.type === "input" && (
                <div className="max-w-md mx-auto mb-8">
                  <Input
                    type={currentQuestion.inputConfig?.type || "text"}
                    placeholder={currentQuestion.inputConfig?.placeholder || "Enter your answer"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-14 text-lg text-center bg-yellow-50 border-2 border-blue-300 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInputSubmit();
                      }
                    }}
                  />
                </div>
              )}

              {currentQuestion.type === "select" && (
                <div className="space-y-4 max-w-md mx-auto mb-8">
                  {currentQuestion.selectOptions?.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleSelectOption(option.value)}
                      variant="outline"
                      className="w-full h-auto p-4 text-left transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:border-blue-300"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion.type === "input" && (
                <Button 
                  onClick={handleInputSubmit} 
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                  disabled={!inputValue.trim()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LifeInsuranceContactForm;
