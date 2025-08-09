import { Button } from "@/components/ui/button";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";

interface MultipleChoiceQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const MultipleChoiceQuestion = ({ question, onAnswer, selectedAnswer }: MultipleChoiceQuestionProps) => {
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
      
      <div className="space-y-4 max-w-2xl mx-auto">
        {question.answers?.map((answer) => (
          <Button
            key={answer.id}
            onClick={() => onAnswer(question.id, answer.value)}
            variant="outline"
            className={`w-full h-auto p-6 text-left transition-all duration-300 hover:scale-105 ${
              selectedAnswer === answer.value 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-blue-600" 
                : "hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{answer.icon}</span>
              <div className="text-left">
                <div className="font-semibold text-lg">{answer.text}</div>
                {answer.subtitle && (
                  <div className="text-sm opacity-70">{answer.subtitle}</div>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};