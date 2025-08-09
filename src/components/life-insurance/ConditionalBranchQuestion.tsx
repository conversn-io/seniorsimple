import { Button } from "@/components/ui/button";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";

interface ConditionalBranchQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const ConditionalBranchQuestion = ({ question, onAnswer, selectedAnswer }: ConditionalBranchQuestionProps) => {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-gray-600 mb-8 text-lg">{question.subtitle}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {question.conditionalBranchConfig?.options.map((option) => (
          <Button
            key={option.value}
            onClick={() => onAnswer(question.id, option.value)}
            variant="outline"
            className="h-32 p-6 text-left transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:border-blue-300"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-4xl">{option.icon}</span>
              <span className="font-semibold text-lg">{option.label}</span>
              {option.description && (
                <span className="text-sm text-gray-600">{option.description}</span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};