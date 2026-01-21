import { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about our company story, mission, values, and the experienced team behind RealEstate.',
};

export default function AboutPage() {
  return <AboutContent />;
}


