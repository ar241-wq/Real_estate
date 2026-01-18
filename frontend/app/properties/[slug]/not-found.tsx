import Link from 'next/link';

export default function PropertyNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">
          Property Not Found
        </h1>
        <p className="text-secondary-600 mb-6 max-w-md">
          The property you are looking for does not exist or has been removed.
        </p>
        <Link href="/properties" className="btn-primary">
          Browse All Properties
        </Link>
      </div>
    </div>
  );
}
