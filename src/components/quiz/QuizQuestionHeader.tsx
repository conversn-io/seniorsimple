
interface QuizQuestionHeaderProps {
  questionId: string;
  title: string;
  subtitle?: string;
  isTransitioning?: boolean;
}

const QuizQuestionHeader = ({ 
  questionId, 
  title, 
  subtitle, 
  isTransitioning = false 
}: QuizQuestionHeaderProps) => {
  return (
    <header className={`transition-all duration-300 ${isTransitioning ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
      <h2 
        id={`question-${questionId}-title`}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
      >
        {title}
      </h2>
      {subtitle && (
        <p 
          id={`question-${questionId}-subtitle`}
          className="text-gray-600 mb-8 text-lg"
        >
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default QuizQuestionHeader;
