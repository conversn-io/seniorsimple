
import { QuizQuestionType } from "../QuizFunnel";
import QuizOptionButton from "./QuizOptionButton";
import QuizSliderInput from "./QuizSliderInput";
import QuizTextInput from "./QuizTextInput";

interface QuizQuestionContentProps {
  question: QuizQuestionType;
  selectedAnswer?: string;
  inputValue: string;
  isTransitioning: boolean;
  validationError: string;
  onAnswerClick: (answerValue: string) => void;
  onOptionKeyDown: (e: React.KeyboardEvent, answerValue: string) => void;
  onSliderChange: (value: number[]) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur: () => void;
  onInputKeyDown: (e: React.KeyboardEvent) => void;
}

const QuizQuestionContent = ({
  question,
  selectedAnswer,
  inputValue,
  isTransitioning,
  validationError,
  onAnswerClick,
  onOptionKeyDown,
  onSliderChange,
  onInputChange,
  onInputBlur,
  onInputKeyDown
}: QuizQuestionContentProps) => {
  // Multiple Choice and Gender Questions
  if (question.type === "multiple-choice" || question.type === "gender") {
    return (
      <fieldset 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto"
        role="radiogroup"
        aria-labelledby={`question-${question.id}-title`}
        aria-describedby={question.subtitle ? `question-${question.id}-subtitle` : undefined}
      >
        <legend className="sr-only">{question.title}</legend>
        {question.answers?.map((answer) => (
          <QuizOptionButton
            key={answer.id}
            id={`option-${answer.id}`}
            text={answer.text}
            icon={answer.icon}
            subtitle={answer.subtitle}
            isSelected={selectedAnswer === answer.value}
            isDisabled={isTransitioning}
            onClick={() => onAnswerClick(answer.value)}
            onKeyDown={(e) => onOptionKeyDown(e, answer.value)}
          />
        ))}
      </fieldset>
    );
  }

  // Slider Questions
  if (question.type === "slider") {
    return (
      <QuizSliderInput
        question={question}
        selectedAnswer={selectedAnswer}
        isDisabled={isTransitioning}
        onChange={onSliderChange}
      />
    );
  }

  // Input Questions
  if (question.type === "input") {
    return (
      <QuizTextInput
        question={question}
        value={inputValue}
        isDisabled={isTransitioning}
        hasError={!!validationError}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
      />
    );
  }

  return null;
};

export default QuizQuestionContent;
