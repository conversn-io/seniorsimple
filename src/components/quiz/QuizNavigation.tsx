
import { QuizQuestionType } from "../QuizFunnel";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<string, string>;
  questions: QuizQuestionType[];
  onNext: () => void;
  onBack: () => void;
  onShowResults: () => void;
}

export const useQuizNavigation = ({
  currentQuestion,
  totalQuestions,
  answers,
  questions,
  onNext,
  onBack,
  onShowResults,
}: QuizNavigationProps) => {
  const currentQuestionData = questions[currentQuestion];

  const handleContinue = () => {
    // Validate answer exists for current question
    const currentAnswer = answers[currentQuestionData.id];
    if (!currentAnswer) return;

    // Proceed to next question or results immediately
    if (currentQuestion < totalQuestions - 1) {
      onNext();
    } else {
      onShowResults();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      onBack();
    }
  };

  const canGoBack = currentQuestion > 0;
  const canContinue = !!answers[currentQuestionData.id];
  const shouldAutoAdvance = currentQuestionData.type === "multiple-choice" || currentQuestionData.type === "gender";
  const showContinueButton = currentQuestionData.type === "slider" || currentQuestionData.type === "input";

  return {
    currentQuestionData,
    handleContinue,
    handleBack,
    canGoBack,
    canContinue,
    shouldAutoAdvance,
    showContinueButton,
  };
};
