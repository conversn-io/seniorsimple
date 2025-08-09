
import { Button } from "@/components/ui/button";

interface QuizOptionButtonProps {
  id: string;
  text: string;
  icon: string;
  subtitle?: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const QuizOptionButton = ({ 
  id, 
  text, 
  icon, 
  subtitle, 
  isSelected, 
  isDisabled, 
  onClick,
  onKeyDown
}: QuizOptionButtonProps) => {
  return (
    <Button
      id={id}
      onClick={onClick}
      onKeyDown={onKeyDown}
      variant={isSelected ? "default" : "outline"}
      disabled={isDisabled}
      className={`h-20 md:h-24 text-left p-4 transition-all duration-300 hover:scale-105 ${
        isSelected 
          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
          : "hover:bg-blue-50 hover:border-blue-300"
      } ${
        isDisabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      role="radio"
      aria-checked={isSelected}
      aria-describedby={subtitle ? `${id}-subtitle` : undefined}
      tabIndex={0}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <span className="font-medium text-sm md:text-base">
          {text}
        </span>
        {subtitle && (
          <span 
            id={`${id}-subtitle`}
            className="text-xs text-gray-500 sr-only"
          >
            {subtitle}
          </span>
        )}
      </div>
    </Button>
  );
};

export default QuizOptionButton;
