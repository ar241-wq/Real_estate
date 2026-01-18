import Link from 'next/link';

const features = [
  {
    title: 'Trusted & Verified',
    description:
      'All our properties are thoroughly verified to ensure authenticity and protect your investment.',
  },
  {
    title: 'Expert Agents',
    description:
      'Our team of experienced real estate professionals provides personalized guidance at every step.',
  },
  {
    title: 'Best Value',
    description:
      'We negotiate the best deals for you, ensuring you get maximum value for your investment.',
  },
  {
    title: 'Fast & Easy',
    description:
      'Streamlined process from search to closing. Find your dream property without the hassle.',
  },
];

export default function ValueProposition() {
  return (
    <section className="py-16 lg:py-24 bg-secondary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="section-title">
              Why Choose Us for Your Real Estate Journey
            </h2>
            <p className="section-subtitle">
              We combine local expertise with cutting-edge technology to deliver
              an exceptional real estate experience tailored to your needs.
            </p>

            {/* Features Grid */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title}>
                  <h3 className="font-semibold text-secondary-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/properties" className="btn-primary">
                Browse Properties
              </Link>
              <Link href="/about" className="btn-outline">
                Learn More About Us
              </Link>
            </div>
          </div>

          {/* Image/Stats Card */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-secondary-900">
                  Your Satisfaction is Our Priority
                </h3>
                <p className="mt-2 text-secondary-600">
                  Join thousands of happy homeowners who found their perfect property with us
                </p>
              </div>

              {/* Achievement Stats */}
              <div className="relative">
                {/* Snake Animation Path */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 25 25 L 75 25 L 75 75 L 25 75"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.4"
                    className="stats-snake"
                  />
                  <style>
                    {`
                      .stats-snake {
                        stroke-dasharray: 200;
                        stroke-dashoffset: 200;
                        animation: snakeMove 4s ease-in-out infinite;
                      }
                      @keyframes snakeMove {
                        0%, 100% { stroke-dashoffset: 200; }
                        50% { stroke-dashoffset: 0; }
                      }
                    `}
                  </style>
                </svg>

                <div className="grid grid-cols-2 gap-4 relative">
                  <div className="bg-secondary-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">15+</div>
                    <div className="text-sm text-secondary-600">Years Experience</div>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">500+</div>
                    <div className="text-sm text-secondary-600">Properties Sold</div>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">50+</div>
                    <div className="text-sm text-secondary-600">Expert Agents</div>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">98%</div>
                    <div className="text-sm text-secondary-600">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-50 blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-300 rounded-full opacity-30 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
