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
    <div className="bg-white p-8 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-12 h-12 bg-[#E4CDA1] rounded-lg flex items-center justify-center mb-6 text-[#36596A]">
        {icon}
      </div>
      
      {/* Optional Image */}
      {imagePath && (
        <div className="mb-6 relative h-48 rounded-lg overflow-hidden">
          <Image
            src={imagePath}
            alt={imageAlt || `${title} illustration`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      {/* Content */}
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      
      {/* Link */}
      <a 
        href={href} 
        className="text-[#36596A] font-medium hover:underline inline-flex items-center"
      >
        Learn More 
        <svg 
          className="ml-1 w-4 h-4" 
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
