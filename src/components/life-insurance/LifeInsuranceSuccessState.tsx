
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LifeInsuranceSuccessStateProps {
  onRestart: () => void;
  answers?: Record<string, string>;
}

const LifeInsuranceSuccessState = ({ onRestart, answers }: LifeInsuranceSuccessStateProps) => {
  const navigate = useNavigate();
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
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
              Your personalized life insurance quote is being prepared. 
              We'll contact you within 24 hours with your customized coverage options.
            </p>
            <div className="flex space-x-4 justify-center">
              <Button 
                onClick={() => navigate('/assessment/life-insurance/partners')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Partner Options
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button onClick={onRestart} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LifeInsuranceSuccessState;
