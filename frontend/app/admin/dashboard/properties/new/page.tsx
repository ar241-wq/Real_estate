import PropertyForm from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">Add New Property</h2>
        <p className="text-sm sm:text-base text-secondary-600">
          Create a new property listing
        </p>
      </div>

      <PropertyForm />
    </div>
  );
}
