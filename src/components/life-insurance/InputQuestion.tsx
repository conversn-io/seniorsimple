import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";
import { useToast } from "@/hooks/use-toast";
import { validateQuestionAnswer } from "@/utils/lifeInsuranceValidation";

interface InputQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const InputQuestion = ({ question, onAnswer, selectedAnswer }: InputQuestionProps) => {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");

  // Reset input value when question changes to prevent cross-question pollution
  useEffect(() => {
    // Only use selectedAnswer if it exists and matches this specific question
    setInputValue(selectedAnswer || "");
  }, [question.id, selectedAnswer]);

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      toast({
        title: "Validation Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }
    
    // Validate based on input type and question ID
    let validationType = question.inputConfig?.type || 'text';
    if (question.id === 'zipCode') validationType = 'zipCode';
    
    const validation = validateQuestionAnswer(validationType, trimmedValue);
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }
    
    onAnswer(question.id, trimmedValue);
  };

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-gray-600 mb-8 text-lg">
          {question.subtitle}
        </p>
      )}
      
      <div className="max-w-md mx-auto mb-8">
        {question.inputConfig?.label && (
          <p className="text-gray-600 mb-4">{question.inputConfig.label}</p>
        )}
        <Input
          type={question.inputConfig?.type || "text"}
          placeholder={question.inputConfig?.placeholder || "Enter your answer"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-14 text-lg text-center border-2 border-blue-300 focus:border-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
      </div>

      <Button 
        onClick={handleSubmit} 
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        disabled={!inputValue.trim()}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};