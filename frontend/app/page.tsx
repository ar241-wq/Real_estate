import Hero from '@/components/home/Hero';
import FeaturedListings from '@/components/home/FeaturedListings';
import RecommendedProperties from '@/components/home/RecommendedProperties';
import ValueProposition from '@/components/home/ValueProposition';
import FindProperty from '@/components/home/FindProperty';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedListings />
      <RecommendedProperties />
      <ValueProposition />
      <FindProperty />
    </>
  );
}
