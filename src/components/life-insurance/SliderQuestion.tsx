import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";

interface SliderQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const SliderQuestion = ({ question, onAnswer, selectedAnswer }: SliderQuestionProps) => {
  const [sliderValue, setSliderValue] = useState([parseInt(selectedAnswer || "2")]);

  const handleSubmit = () => {
    onAnswer(question.id, sliderValue[0].toString());
  };

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {question.title}
      </h2>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="mb-4">
          <p className="text-gray-600 mb-4">{question.sliderConfig?.label}</p>
          <div className="bg-blue-100 rounded-lg p-4 inline-block">
            <span className="text-3xl font-bold text-blue-600">{sliderValue[0]}</span>
          </div>
        </div>
        
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          max={question.sliderConfig?.max || 8}
          min={question.sliderConfig?.min || 1}
          step={question.sliderConfig?.step || 1}
          className="w-full"
        />
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{question.sliderConfig?.min || 1}</span>
          <span>{question.sliderConfig?.max || 8}</span>
        </div>
      </div>

      <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};