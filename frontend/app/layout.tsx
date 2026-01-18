import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PublicLayout from '@/components/layout/PublicLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'RealEstate - Find Your Dream Property',
    template: '%s | RealEstate',
  },
  description:
    'Discover exceptional properties for sale and rent. From luxury penthouses to cozy family homes, we help you find the perfect place to call home.',
  keywords: [
    'real estate',
    'property',
    'homes for sale',
    'apartments for rent',
    'luxury homes',
    'commercial property',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RealEstate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  );
}
