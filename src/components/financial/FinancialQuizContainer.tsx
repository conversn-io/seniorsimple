
import { Card, CardContent } from "@/components/ui/card";
import QuizQuestion from "@/components/QuizQuestion";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizProgressSteps from "@/components/quiz/QuizProgressSteps";
import QuizProgressBar from "@/components/quiz/QuizProgressBar";

interface FinancialQuizContainerProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<string, string>;
  isTransitioning: boolean;
  navigation: any;
  onAnswer: (questionId: string, answerValue: string) => void;
}

const FinancialQuizContainer = ({
  currentQuestion,
  totalQuestions,
  answers,
  isTransitioning,
  navigation,
  onAnswer
}: FinancialQuizContainerProps) => {
  return (
    <section className="py-2 px-4 sm:px-6 lg:px-8 min-h-screen flex items-start pt-4">
      <div className="max-w-2xl mx-auto w-full">
        <QuizHeader
          title="Financial Wellness Assessment"
          subtitle="Personalized Financial Strategy"
          description="Get Your Complete Financial Health Report"
        />

        <QuizProgressSteps
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />

        <QuizProgressBar
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          onBack={navigation.handleBack}
          canGoBack={navigation.canGoBack}
        />

        <Card className={`shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-opacity duration-200 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}>
          <CardContent className="p-8">
            <QuizQuestion
              question={navigation.currentQuestionData}
              onAnswer={onAnswer}
              onContinue={navigation.handleContinue}
              selectedAnswer={answers[navigation.currentQuestionData.id]}
              showContinueButton={navigation.showContinueButton}
              canContinue={navigation.canContinue}
              isTransitioning={isTransitioning}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FinancialQuizContainer;
