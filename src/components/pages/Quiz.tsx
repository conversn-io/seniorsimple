
import { useState } from "react";
import Footer from "../Footer";
import QuizErrorBoundary from "../quiz/QuizErrorBoundary";

const Quiz = () => {
  const handleQuizReset = () => {
    // Force a page refresh to fully reset the quiz state
    window.location.reload();
  };

  return (
    <QuizErrorBoundary onReset={handleQuizReset}>
      <div className="min-h-screen bg-[#F5F5F0]">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-[#36596A] mb-4">
              Retirement Planning Quiz
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover personalized retirement strategies based on your unique situation.
            </p>
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-600">Quiz coming soon...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </QuizErrorBoundary>
  );
};

export default Quiz;
