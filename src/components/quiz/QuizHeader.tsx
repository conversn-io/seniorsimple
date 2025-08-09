
interface QuizHeaderProps {
  title: string;
  subtitle: string;
  description: string;
}

const QuizHeader = ({ title, subtitle, description }: QuizHeaderProps) => {
  return (
    <header className="text-center mb-8" role="banner">
      <div className="flex justify-center mb-6">
        <div 
          className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center"
          role="img"
          aria-label="Quiz target icon"
        >
          <span className="text-2xl" aria-hidden="true">🎯</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-blue-600 font-semibold" role="heading" aria-level={2}>
        {subtitle}
      </p>
      <p className="text-gray-600">{description}</p>
    </header>
  );
};

export default QuizHeader;
