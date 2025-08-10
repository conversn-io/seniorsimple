import Image from 'next/image'

interface TopicCardProps {
  title: string
  description: string
  icon: React.ReactNode
  imagePath?: string
  imageAlt?: string
  href?: string
}

export default function TopicCard({ 
  title, 
  description, 
  icon, 
  imagePath, 
  imageAlt, 
  href = "#" 
}: TopicCardProps) {
  return (
    <div className="card-enhanced generous-spacing">
      {/* Icon */}
      <div className="w-14 h-14 bg-[#E4CDA1] rounded-xl flex items-center justify-center mb-8 text-[#36596A] transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      
      {/* Optional Image */}
      {imagePath && (
        <div className="mb-8 relative h-52 rounded-xl overflow-hidden shadow-md">
          <Image
            src={imagePath}
            alt={imageAlt || `${title} illustration`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      {/* Content */}
      <h3 className="text-xl font-semibold mb-6 text-[#36596A] senior-friendly-text">{title}</h3>
      <p className="text-gray-600 mb-8 senior-friendly-text leading-relaxed">{description}</p>
      
      {/* Link */}
      <a 
        href={href} 
        className="text-[#36596A] font-medium hover:underline inline-flex items-center touch-target p-2 -m-2 rounded-lg focus-visible-enhanced transition-all duration-300 hover:bg-[#36596A] hover:bg-opacity-5 hover:text-[#2a4a5a] group"
      >
        <span className="senior-friendly-text">Learn More</span>
        <svg 
          className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </a>
    </div>
  )
}
