import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";
import { useToast } from "@/hooks/use-toast";
import { validateDate } from "@/utils/lifeInsuranceValidation";

interface DatePickerQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const DatePickerQuestion = ({ question, onAnswer, selectedAnswer }: DatePickerQuestionProps) => {
  const { toast } = useToast();
  const [dateValue, setDateValue] = useState(selectedAnswer || "");

  const handleSubmit = () => {
    if (!dateValue) {
      toast({
        title: "Validation Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateDate(dateValue)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid birth date",
        variant: "destructive",
      });
      return;
    }
    
    onAnswer(question.id, dateValue);
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
        {question.datePickerConfig?.label && (
          <p className="text-gray-600 mb-4">{question.datePickerConfig.label}</p>
        )}
        <div className="relative">
          <Input
            type="date"
            placeholder={question.datePickerConfig?.placeholder}
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="h-14 text-lg border-2 border-blue-300 focus:border-blue-500"
            max={new Date().toISOString().split('T')[0]}
            min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
          />
          <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        disabled={!dateValue}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};