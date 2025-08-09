
import { Slider } from "@/components/ui/slider";
import { QuizQuestionType } from "../QuizFunnel";

interface QuizSliderInputProps {
  question: QuizQuestionType;
  selectedAnswer?: string;
  isDisabled: boolean;
  onChange: (value: number[]) => void;
}

const QuizSliderInput = ({ question, selectedAnswer, isDisabled, onChange }: QuizSliderInputProps) => {
  if (!question.sliderConfig) return null;

  const currentValue = parseInt(selectedAnswer || question.sliderConfig.min.toString());

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div 
          className="text-4xl font-bold text-blue-600 mb-2"
          role="status"
          aria-live="polite"
          aria-label={`Selected value: ${question.sliderConfig.unit || ""}${currentValue}`}
        >
          {question.sliderConfig.unit || ""}{currentValue}
        </div>
        <p className="text-gray-600">{question.sliderConfig.label}</p>
      </div>
      <div role="group" aria-labelledby="slider-label">
        <Slider
          value={[currentValue]}
          onValueChange={onChange}
          min={question.sliderConfig.min}
          max={question.sliderConfig.max}
          step={question.sliderConfig.step}
          className="w-full"
          disabled={isDisabled}
          aria-label={`${question.sliderConfig.label}, current value ${currentValue}`}
          aria-valuemin={question.sliderConfig.min}
          aria-valuemax={question.sliderConfig.max}
          aria-valuenow={currentValue}
          aria-valuetext={`${question.sliderConfig.unit || ""}${currentValue}`}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500" aria-hidden="true">
        <span>{question.sliderConfig.unit || ""}{question.sliderConfig.min}</span>
        <span>{question.sliderConfig.unit || ""}{question.sliderConfig.max}</span>
      </div>
    </div>
  );
};

export default QuizSliderInput;
