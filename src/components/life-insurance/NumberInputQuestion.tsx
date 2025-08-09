import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";
import { useToast } from "@/hooks/use-toast";
import { validateNumber } from "@/utils/lifeInsuranceValidation";

interface NumberInputQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const NumberInputQuestion = ({ question, onAnswer, selectedAnswer }: NumberInputQuestionProps) => {
  const { toast } = useToast();
  const [numberInputValue, setNumberInputValue] = useState(selectedAnswer || "");

  const handleSubmit = () => {
    const value = numberInputValue.trim();
    const min = question.numberInputConfig?.min || 50;
    const max = question.numberInputConfig?.max || 600;
    
    if (!value) {
      toast({
        title: "Validation Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateNumber(value, min, max)) {
      toast({
        title: "Validation Error",
        description: `Please enter a number between ${min} and ${max}`,
        variant: "destructive",
      });
      return;
    }
    
    onAnswer(question.id, value);
  };

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-gray-600 mb-8 text-lg">{question.subtitle}</p>
      )}
      
      <div className="max-w-md mx-auto mb-8">
        {question.numberInputConfig?.label && (
          <p className="text-gray-600 mb-4">{question.numberInputConfig.label}</p>
        )}
        <div className="relative">
          <Input
            type="number"
            placeholder={question.numberInputConfig?.placeholder}
            value={numberInputValue}
            onChange={(e) => setNumberInputValue(e.target.value)}
            min={question.numberInputConfig?.min}
            max={question.numberInputConfig?.max}
            className="h-14 text-lg text-center border-2 border-blue-300 focus:border-blue-500 pr-12"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          {question.numberInputConfig?.unit && (
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              {question.numberInputConfig.unit}
            </span>
          )}
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        disabled={!numberInputValue.trim()}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};