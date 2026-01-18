import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Hero() {
  return (
    <section className="relative text-white overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Trusted by 10,000+ happy homeowners
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Find Your Perfect
            <span className="block text-primary-400">Dream Property</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-secondary-300 mb-10 max-w-2xl mx-auto">
            Discover exceptional properties for sale and rent. From luxury
            penthouses to cozy family homes, we help you find the perfect place
            to call home.
          </p>

          {/* Search Bar */}
          <div className="mb-10">
            <SearchBar />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properties?featured=true"
              className="w-full sm:w-auto btn-primary bg-primary-500 hover:bg-primary-600 px-8 py-3.5 text-base"
            >
              Book a Viewing
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto btn-outline bg-transparent text-white border-white/30 hover:bg-white/10 px-8 py-3.5 text-base"
            >
              Contact Agent
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Properties' },
              { value: '1,200+', label: 'Happy Clients' },
              { value: '15+', label: 'Years Experience' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-secondary-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
