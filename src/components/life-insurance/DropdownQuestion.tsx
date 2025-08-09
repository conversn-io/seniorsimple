import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";
import { useToast } from "@/hooks/use-toast";

interface DropdownQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const DropdownQuestion = ({ question, onAnswer, selectedAnswer }: DropdownQuestionProps) => {
  const { toast } = useToast();
  const [dropdownValue, setDropdownValue] = useState(selectedAnswer || "");

  const handleSubmit = () => {
    if (!dropdownValue) {
      toast({
        title: "Validation Error",
        description: "Please select an option",
        variant: "destructive",
      });
      return;
    }
    onAnswer(question.id, dropdownValue);
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
        <Select value={dropdownValue} onValueChange={setDropdownValue}>
          <SelectTrigger className="h-14 text-lg bg-white border-2 border-blue-300 focus:border-blue-500">
            <SelectValue placeholder={question.dropdownConfig?.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent className="bg-white z-50 max-h-64 overflow-y-auto">
            {question.dropdownConfig?.options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-base py-3">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        disabled={!dropdownValue}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};