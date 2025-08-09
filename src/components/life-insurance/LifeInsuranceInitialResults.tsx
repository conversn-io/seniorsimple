
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface LifeInsuranceInitialResultsProps {
  onStartContactForm: () => void;
}

const LifeInsuranceInitialResults = ({ onStartContactForm }: LifeInsuranceInitialResultsProps) => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-green-600 text-lg font-semibold mb-2">We found a match!</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to go with your quote?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Let's get your contact information to provide you with a personalized life insurance quote.
              </p>
              <Button 
                onClick={onStartContactForm}
                className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold px-8 py-3"
              >
                Get My Quote
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LifeInsuranceInitialResults;
