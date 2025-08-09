import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { LifeInsuranceQuestionType } from "@/types/lifeInsurance";
import { useToast } from "@/hooks/use-toast";

interface DualInputQuestionProps {
  question: LifeInsuranceQuestionType;
  onAnswer: (questionId: string, answerValue: string) => void;
  selectedAnswer?: string;
}

export const DualInputQuestion = ({ question, onAnswer, selectedAnswer }: DualInputQuestionProps) => {
  const { toast } = useToast();
  const [dualInputValues, setDualInputValues] = useState({ feet: "", inches: "" });

  const handleSubmit = () => {
    const { feet, inches } = dualInputValues;
    
    if (!feet || !inches) {
      toast({
        title: "Validation Error",
        description: "Please select both feet and inches",
        variant: "destructive",
      });
      return;
    }
    
    const feetNum = parseInt(feet);
    const inchesNum = parseInt(inches);
    
    if (feetNum < 4 || feetNum > 7 || inchesNum < 0 || inchesNum > 11) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid height",
        variant: "destructive",
      });
      return;
    }
    
    onAnswer(question.id, JSON.stringify({ feet, inches }));
  };

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-gray-600 mb-8 text-lg">{question.subtitle}</p>
      )}
      
      <div className="max-w-md mx-auto mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.dualInputConfig?.input1.label}
            </label>
            <Select value={dualInputValues.feet} onValueChange={(value) => 
              setDualInputValues(prev => ({ ...prev, feet: value }))
            }>
              <SelectTrigger className="h-12 border-2 border-blue-300 focus:border-blue-500">
                <SelectValue placeholder="Feet" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {[4, 5, 6, 7].map((feet) => (
                  <SelectItem key={feet} value={feet.toString()}>
                    {feet} ft
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.dualInputConfig?.input2.label}
            </label>
            <Select value={dualInputValues.inches} onValueChange={(value) => 
              setDualInputValues(prev => ({ ...prev, inches: value }))
            }>
              <SelectTrigger className="h-12 border-2 border-blue-300 focus:border-blue-500">
                <SelectValue placeholder="Inches" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} in
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
        disabled={!dualInputValues.feet || !dualInputValues.inches}
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};