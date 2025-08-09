
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

interface QuizProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  onBack: () => void;
  canGoBack: boolean;
}

const QuizProgressBar = ({ 
  currentQuestion, 
  totalQuestions, 
  onBack, 
  canGoBack 
}: QuizProgressBarProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="mb-8" role="navigation" aria-label="Quiz progress">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={!canGoBack}
          className="p-2"
          aria-label="Go back to previous question"
          role="button"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span 
          className="text-sm text-gray-600"
          role="status"
          aria-live="polite"
          aria-label={`Question ${currentQuestion + 1} of ${totalQuestions}`}
        >
          {currentQuestion + 1} of {totalQuestions}
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2" 
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={`Quiz progress: ${Math.round(progress)}% complete`}
      />
    </div>
  );
};

export default QuizProgressBar;
