import { Button } from "@/components/ui/button";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";

interface GenderQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const GenderQuestion = ({ question, onAnswer, selectedAnswer }: GenderQuestionProps) => {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
        {question.answers?.map((answer) => (
          <Button
            key={answer.id}
            onClick={() => onAnswer(question.id, answer.value)}
            variant={selectedAnswer === answer.value ? "default" : "outline"}
            className={`h-32 text-left p-4 transition-all duration-300 hover:scale-105 ${
              selectedAnswer === answer.value 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
                : "hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-4xl">{answer.icon}</span>
              <span className="font-medium text-lg">
                {answer.text}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};