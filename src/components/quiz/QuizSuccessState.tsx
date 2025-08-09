
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RefreshCw } from "lucide-react";

interface QuizSuccessStateProps {
  onRestart: () => void;
}

const QuizSuccessState = ({ onRestart }: QuizSuccessStateProps) => {
  return (
    <section className="py-2 px-4 sm:px-6 lg:px-8 min-h-screen flex items-start pt-4">
      <div className="max-w-2xl mx-auto w-full text-center">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Your personalized retirement strategy is being prepared. 
              We'll contact you within 24 hours with your customized recommendations.
            </p>
            <Button onClick={onRestart} variant="outline" className="mr-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Take Quiz Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default QuizSuccessState;
