import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedArticles } from '../lib/articles'
import TopicCard from '../components/TopicCard'
import NewsletterSignup from '../components/NewsletterSignup'

// Icons (using simple SVG icons)
const IconQuiz = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
  </svg>
)

const IconLightbulb = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M15.5 9.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5 4.5 2 4.5 4.5z"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="M4.93 4.93l1.41 1.41"/>
    <path d="M17.66 17.66l1.41 1.41"/>
  </svg>
)

const IconHandshake = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L9 6.5l3.77 3.77L20.42 4.58z"/>
    <path d="M3.58 20.42a5.4 5.4 0 0 0 7.65 0L15 17.5l-3.77-3.77L3.58 20.42z"/>
  </svg>
)

const IconPiggybank = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 5c-1.5-1.5-3-2-5-2s-3.5.5-5 2c-1.5 1.5-2 3-2 5s.5 3.5 2 5c1.5 1.5 3 2 5 2s3.5-.5 5-2c1.5-1.5 2-3 2-5s-.5-3.5-2-5z"/>
    <path d="M12 8v8"/>
    <path d="M8 12h8"/>
  </svg>
)

const IconCalculator = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <path d="M8 6h8"/>
    <path d="M8 10h2"/>
    <path d="M12 10h2"/>
    <path d="M16 10h2"/>
    <path d="M8 14h2"/>
    <path d="M12 14h2"/>
    <path d="M16 14h2"/>
    <path d="M8 18h2"/>
    <path d="M12 18h2"/>
    <path d="M16 18h2"/>
  </svg>
)

const IconDocument = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
)

const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)

const IconHeartbeat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
)

const IconLocation = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconGraph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,3 21,3 21,21 3,21"/>
    <polyline points="7,17 11,13 15,15 21,9"/>
  </svg>
)

const IconClipboard = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)

export default async function HomePage() {
  // Fetch featured articles for the homepage
  const { articles: featuredArticles, error } = await getFeaturedArticles(3)

  return (
    <div className="min-h-screen bg-[#F5F5F0]">


      {/* Hero Section */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
                Simplify Your Retirement Journey
              </h1>
              <p className="text-xl mb-8 opacity-90">
                No-cost education on annuities, taxes, estate planning, reverse mortgages, regenerative medicine, and housing.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <button className="bg-white text-[#36596A] px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Take the Retirement Quiz
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-[#36596A] transition-colors">
                  I&apos;m a Financial Advisor
                </button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm opacity-80">
                <span>As seen on Forbes</span>
                <span>Partnered with AARP</span>
                <span>Fiduciary Alliance Approved</span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-full h-96 bg-white bg-opacity-10 rounded-xl flex items-center justify-center text-lg opacity-70 relative overflow-hidden">
                {/* Hero Image */}
                <Image
                  src="/images/webp/hero/couple-share-coffee-meeting-home-couch.webp"
                  alt="Senior couple sharing coffee and planning retirement at home"
                  fill
                  className="object-cover rounded-xl"
                  priority={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
              <div className="w-16 h-16 bg-[#E4CDA1] rounded-full flex items-center justify-center mx-auto mb-6 text-[#36596A]">
                <IconQuiz />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Take a Quick Quiz</h3>
              <p className="text-gray-600">Answer 5–7 questions about your retirement needs.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
              <div className="w-16 h-16 bg-[#E4CDA1] rounded-full flex items-center justify-center mx-auto mb-6 text-[#36596A]">
                <IconLightbulb />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Get Personalized Guidance</h3>
              <p className="text-gray-600">Receive educational content tailored to you.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
              <div className="w-16 h-16 bg-[#E4CDA1] rounded-full flex items-center justify-center mx-auto mb-6 text-[#36596A]">
                <IconHandshake />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Connect with Trusted Experts</h3>
              <p className="text-gray-600">Optionally speak with a vetted professional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">Explore Retirement Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: 'Annuities', 
                icon: <IconPiggybank />, 
                desc: 'Understand fixed index annuities and income options.',
                imagePath: '/images/webp/topics/black-grey-hair-couple-beach.webp',
                imageAlt: 'Senior couple planning financial security on the beach'
              },
              { 
                title: 'Tax Planning', 
                icon: <IconCalculator />, 
                desc: 'Explore tax-efficient retirement strategies.',
                imagePath: '/images/webp/topics/elder-man-beard-laptop-cell-phone.webp',
                imageAlt: 'Senior man using technology for tax planning'
              },
              { 
                title: 'Estate Planning', 
                icon: <IconDocument />, 
                desc: 'Discover how to protect your legacy.',
                imagePath: '/images/webp/topics/happy-couple-gray-hard-back-embrace-meadow.webp',
                imageAlt: 'Happy couple embracing in meadow - protecting family legacy'
              },
              { 
                title: 'Reverse Mortgage', 
                icon: <IconHome />, 
                desc: 'Find out if accessing home equity is right for you.',
                imagePath: '/images/webp/topics/gray-hair-couple-walk-golden-retriever-park.webp',
                imageAlt: 'Senior couple enjoying retirement lifestyle with their dog'
              },
              { 
                title: 'Regenerative Medicine', 
                icon: <IconHeartbeat />, 
                desc: 'Learn about pain-free living with new treatments.',
                imagePath: '/images/webp/topics/happy-senior-squat-fitness-class.webp',
                imageAlt: 'Active senior participating in fitness class'
              },
              { 
                title: 'Housing', 
                icon: <IconLocation />, 
                desc: 'Compare options for downsizing or relocating.',
                imagePath: '/images/webp/topics/five-seniors-site-together-ipad.webp',
                imageAlt: 'Group of seniors exploring housing options together'
              }
            ].map((topic, index) => (
              <TopicCard
                key={index}
                title={topic.title}
                description={topic.desc}
                icon={topic.icon}
                imagePath={topic.imagePath}
                imageAlt={topic.imageAlt}
                href="#"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why SeniorSimple */}
      <section className="py-16 px-6 bg-[#E4CDA1]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif font-semibold mb-8">Why Choose SeniorSimple?</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-[#36596A] mb-2">Fiduciary-Aligned</h3>
                  <p className="text-gray-700">We only partner with licensed professionals who act in your best interest.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#36596A] mb-2">Senior-Centered Education</h3>
                  <p className="text-gray-700">Everything is built with the 55+ audience in mind—simple, jargon-free, and valuable.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#36596A] mb-2">No Obligation, Ever</h3>
                  <p className="text-gray-700">Our service is always free. You choose what happens next.</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-full h-96 bg-white bg-opacity-30 rounded-xl flex items-center justify-center text-lg opacity-70 relative overflow-hidden">
                {/* Value Proposition Image */}
                <Image
                  src="/images/webp/hero/gray-hair-short-brunette-beach-breeze.webp"
                  alt="Senior enjoying retirement with confidence and freedom"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools & Resources */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">Tools & Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Retirement Income Estimator', desc: 'Get a sense of your monthly cash flow after retiring.', icon: <IconGraph /> },
              { title: 'Estate Planning Checklist', desc: 'Download your 10-step estate checklist today.', icon: <IconClipboard /> },
              { title: 'Reverse Mortgage Calculator', desc: 'See how much equity you can access.', icon: <IconCalculator /> }
            ].map((tool, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm text-center border">
                <div className="w-12 h-12 bg-[#36596A] rounded-lg flex items-center justify-center mx-auto mb-6 text-white">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{tool.title}</h3>
                <p className="text-gray-600">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold text-[#36596A] mb-4">
              Latest Retirement Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with our latest articles on retirement planning, annuities, and financial security.
            </p>
          </div>
          
          {/* Featured Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">Unable to load featured articles at this time.</p>
              </div>
            ) : featuredArticles && featuredArticles.length > 0 ? (
              featuredArticles.map((article) => (
                <article key={article.id} className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#E4CDA1] text-[#36596A] text-sm font-medium rounded-full">
                      {article.category || 'Retirement'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36596A] mb-3">
                    <Link href={`/articles/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {new Date(article.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <Link href={`/articles/${article.slug}`} className="text-[#36596A] font-medium hover:underline">
                      Read More →
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              // Fallback articles when no featured articles are available
              <>
                <article className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#E4CDA1] text-[#36596A] text-sm font-medium rounded-full">
                      Annuities
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36596A] mb-3">
                    Understanding Fixed Index Annuities
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Learn how fixed index annuities can provide guaranteed income while protecting your principal from market downturns.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Coming Soon</span>
                    <Link href="/articles" className="text-[#36596A] font-medium hover:underline">
                      Read More →
                    </Link>
                  </div>
                </article>

                <article className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#E4CDA1] text-[#36596A] text-sm font-medium rounded-full">
                      Tax Planning
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36596A] mb-3">
                    Tax-Efficient Retirement Strategies
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover strategies to minimize taxes in retirement and maximize your income.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Coming Soon</span>
                    <Link href="/articles" className="text-[#36596A] font-medium hover:underline">
                      Read More →
                    </Link>
                  </div>
                </article>

                <article className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#E4CDA1] text-[#36596A] text-sm font-medium rounded-full">
                      Estate Planning
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36596A] mb-3">
                    Protecting Your Legacy
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essential steps to ensure your assets are protected and passed on according to your wishes.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Coming Soon</span>
                    <Link href="/articles" className="text-[#36596A] font-medium hover:underline">
                      Read More →
                    </Link>
                  </div>
                </article>
              </>
            )}
          </div>

          <div className="text-center">
            <Link 
              href="/articles"
              className="inline-block bg-[#36596A] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2a4a5a] transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-semibold text-white mb-4">
            Join 50,000+ Seniors Getting Retirement Smart
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Weekly insights on income, taxes, healthcare, and more.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
          <p className="text-sm text-white mt-4 opacity-80">
            Free download: The Retirement Planning Essentials Checklist
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#36596A] mb-4">Get in Touch</h3>
              <div className="space-y-2 text-gray-600">
                <p>Contact Us</p>
                <p>Phone: 800-555-2040</p>
                <p>Email: support@seniorsimple.org</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#36596A] mb-4">Resources</h3>
              <div className="space-y-2 text-gray-600">
                <p>Annuities</p>
                <p>Estate Planning</p>
                <p>Health</p>
                <p>Housing</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#36596A] mb-4">About</h3>
              <div className="space-y-2 text-gray-600">
                <p>Mission</p>
                <p>Team</p>
                <p>Press</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#36596A] mb-4">Legal</h3>
              <div className="space-y-2 text-gray-600">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
                <p>Disclaimers</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2024 SeniorSimple. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
