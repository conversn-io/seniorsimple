
import { Input } from "@/components/ui/input";
import { QuizQuestionType } from "../QuizFunnel";

interface QuizTextInputProps {
  question: QuizQuestionType;
  value: string;
  isDisabled: boolean;
  hasError: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const QuizTextInput = ({ 
  question, 
  value, 
  isDisabled, 
  hasError, 
  onChange, 
  onBlur,
  onKeyDown 
}: QuizTextInputProps) => {
  if (!question.inputConfig) return null;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div role="group" aria-labelledby="input-label">
        <Input
          id={`question-${question.id}`}
          type={question.inputConfig.type}
          placeholder={question.inputConfig.placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          disabled={isDisabled}
          className={`h-12 text-center text-lg ${
            hasError ? 'border-red-500 focus:border-red-500' : ''
          }`}
          aria-label={question.title}
          aria-describedby={`${question.id}-example ${hasError ? `${question.id}-error` : ''}`}
          aria-invalid={hasError}
          aria-required="true"
        />
      </div>
      {question.inputConfig.label && (
        <p 
          id={`${question.id}-example`}
          className="text-gray-600 text-sm"
        >
          Example: {question.inputConfig.label}
        </p>
      )}
    </div>
  );
};

export default QuizTextInput;
