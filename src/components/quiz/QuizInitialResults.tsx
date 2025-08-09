
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface QuizInitialResultsProps {
  onStartContactForm: () => void;
}

const QuizInitialResults = ({ onStartContactForm }: QuizInitialResultsProps) => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Trophy className="h-16 w-16 text-blue-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Results Are Ready!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Based on your answers, we've identified personalized strategies for your retirement. 
                Enter your details below to receive your customized recommendations.
              </p>
              <Button 
                onClick={onStartContactForm}
                className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold px-8 py-3"
              >
                Get My Personalized Strategy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default QuizInitialResults;
