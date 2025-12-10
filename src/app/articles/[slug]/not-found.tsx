import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">


      {/* Not Found Content */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-[#36596A] mb-4">404</h1>
          <h2 className="text-3xl font-serif font-semibold text-gray-800 mb-6">
            Article Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The article you&apos;re looking for doesn&apos;t exist or may have been moved. 
            Let&apos;s get you back to exploring our retirement planning resources.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/articles"
              className="bg-[#36596A] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2a4a5a] transition-colors"
            >
              Browse All Articles
            </Link>
            <Link 
              href="/"
              className="border-2 border-[#36596A] text-[#36596A] px-8 py-3 rounded-lg font-medium hover:bg-[#36596A] hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Suggested Articles */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-[#36596A] text-center mb-12">
            Popular Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-[#E4CDA1] text-[#36596A] text-sm font-medium rounded-full">
                  Annuities
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#36596A] mb-3">
                Understanding Fixed Index Annuities
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how fixed index annuities can provide guaranteed income while protecting your principal.
              </p>
              <Link href="/articles" className="text-[#36596A] font-medium hover:underline">
                Browse Articles →
              </Link>
            </div>

            <div className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
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
              <Link href="/articles" className="text-[#36596A] font-medium hover:underline">
                Browse Articles →
              </Link>
            </div>

            <div className="bg-[#F5F5F0] rounded-lg p-6 border border-gray-200">
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
              <Link href="/articles" className="text-[#36596A] font-medium hover:underline">
                Browse Articles →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
