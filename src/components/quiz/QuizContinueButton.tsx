
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface QuizContinueButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  canContinue: boolean;
}

const QuizContinueButton = ({ 
  onClick, 
  isDisabled, 
  isLoading, 
  canContinue 
}: QuizContinueButtonProps) => {
  return (
    <div className="pt-4">
      <Button
        onClick={onClick}
        disabled={isDisabled || !canContinue}
        className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
        size="lg"
        aria-label={isLoading ? "Loading next question" : "Continue to next question"}
        role="button"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Loading...</span>
          </div>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
};

export default QuizContinueButton;
