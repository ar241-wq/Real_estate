import { Metadata } from 'next';
import SavedPropertiesContent from './SavedPropertiesContent';

export const metadata: Metadata = {
  title: 'Saved Properties',
  description: 'View your saved and favorite properties. Keep track of the homes you love.',
};

export default function SavedPropertiesPage() {
  return <SavedPropertiesContent />;
}
