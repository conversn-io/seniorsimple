
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface QuizValidationErrorProps {
  error: string;
  questionId: string;
}

const QuizValidationError = ({ error, questionId }: QuizValidationErrorProps) => {
  return (
    <Alert 
      variant="destructive" 
      className="max-w-md mx-auto"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription id={`${questionId}-error`}>
        {error}
      </AlertDescription>
    </Alert>
  );
};

export default QuizValidationError;
