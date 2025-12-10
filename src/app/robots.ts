import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://seniorsimple.org'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/quiz-submitted/',
          '/quote-submitted/',
          '/consultation-confirmed/',
          '/consultation-booked/',
          '/book-confirmation/',
          '/expect-call/',
          '/otp-debug/',
          '/otp-test/',
          '/debug-api/',
          '/debug-env/',
          '/test-content/',
          '/test-mega-menu/',
          '/health/',
          '/quiz-book/', // Booking funnel entry - can be indexed but low priority
          '/booking/', // Booking page - can be indexed but low priority
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/quiz-submitted/',
          '/quote-submitted/',
          '/consultation-confirmed/',
          '/consultation-booked/',
          '/book-confirmation/',
          '/expect-call/',
          '/otp-debug/',
          '/otp-test/',
          '/debug-api/',
          '/debug-env/',
          '/test-content/',
          '/test-mega-menu/',
          '/health/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

