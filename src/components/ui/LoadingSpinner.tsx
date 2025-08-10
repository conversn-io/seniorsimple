interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'white' | 'gray'
  className?: string
  label?: string
}

export function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary',
  className = '',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  }

  const colorClasses = {
    primary: 'text-[#36596A]',
    white: 'text-white',
    gray: 'text-gray-500'
  }

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-4 bg-gray-200 rounded-lg loading-skeleton" />
          <div className="h-4 bg-gray-200 rounded-lg loading-skeleton w-3/4" />
        </div>
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className = '' }: LoadingCardProps) {
  return (
    <div className={`card-enhanced generous-spacing animate-pulse ${className}`} role="status" aria-label="Loading card">
      <div className="space-y-6">
        {/* Icon placeholder */}
        <div className="w-14 h-14 bg-gray-200 rounded-xl loading-skeleton" />
        
        {/* Title placeholder */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded-lg loading-skeleton w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg loading-skeleton" />
          <div className="h-4 bg-gray-200 rounded-lg loading-skeleton w-5/6" />
        </div>
        
        {/* Button placeholder */}
        <div className="h-12 bg-gray-200 rounded-xl loading-skeleton w-32" />
      </div>
      <span className="sr-only">Loading card content...</span>
    </div>
  )
}