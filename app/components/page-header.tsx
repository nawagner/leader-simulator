'use client';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="py-6 md:py-10 border-b border-gray-200 mb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-lg text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}
