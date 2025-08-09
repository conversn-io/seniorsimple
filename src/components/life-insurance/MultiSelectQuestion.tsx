import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";
import { useToast } from "@/hooks/use-toast";

interface MultiSelectQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const MultiSelectQuestion = ({ question, onAnswer, selectedAnswer }: MultiSelectQuestionProps) => {
  const { toast } = useToast();
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>(() => {
    try {
      return selectedAnswer ? JSON.parse(selectedAnswer) : [];
    } catch {
      return [];
    }
  });

  const handleToggle = (answerValue: string) => {
    const newAnswers = multiSelectAnswers.includes(answerValue)
      ? multiSelectAnswers.filter(a => a !== answerValue)
      : [...multiSelectAnswers, answerValue];
    
    setMultiSelectAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const minSelections = question.multiSelectConfig?.minSelections || 1;
    const maxSelections = question.multiSelectConfig?.maxSelections || 5;
    
    if (multiSelectAnswers.length < minSelections) {
      toast({
        title: "Validation Error",
        description: `Please select at least ${minSelections} option${minSelections > 1 ? 's' : ''}`,
        variant: "destructive",
      });
      return;
    }
    
    if (multiSelectAnswers.length > maxSelections) {
      toast({
        title: "Validation Error",
        description: `Please select no more than ${maxSelections} options`,
        variant: "destructive",
      });
      return;
    }
    
    onAnswer(question.id, JSON.stringify(multiSelectAnswers));
  };

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-gray-600 mb-8 text-lg">{question.subtitle}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
        {question.answers?.map((answer) => (
          <Button
            key={answer.id}
            onClick={() => handleToggle(answer.value)}
            variant="outline"
            className={`h-auto p-6 text-left transition-all duration-300 hover:scale-105 ${
              multiSelectAnswers.includes(answer.value)
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-blue-600"
                : "hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-3xl">{answer.icon}</span>
              <span className="font-medium text-base break-words">{answer.text}</span>
              {answer.subtitle && (
                <span className="text-sm opacity-70 break-words">{answer.subtitle}</span>
              )}
            </div>
          </Button>
        ))}
      </div>
      
      {multiSelectAnswers.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Selected: {multiSelectAnswers.length} / {question.multiSelectConfig?.maxSelections || 5}
          </p>
        </div>
      )}
      
      <Button 
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        disabled={multiSelectAnswers.length === 0}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};