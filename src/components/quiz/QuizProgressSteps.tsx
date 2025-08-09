
interface QuizProgressStepsProps {
  currentQuestion: number;
  totalQuestions: number;
}

const QuizProgressSteps = ({ currentQuestion, totalQuestions }: QuizProgressStepsProps) => {
  const steps = ["Profile", "Income", "Goals", "Results"];
  
  return (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-8">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              index <= Math.floor((currentQuestion / totalQuestions) * 4) 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-400"
            }`}>
              {index + 1}
            </div>
            <span className={`text-xs mt-1 ${
              index <= Math.floor((currentQuestion / totalQuestions) * 4)
                ? "text-blue-600 font-semibold"
                : "text-gray-400"
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizProgressSteps;
