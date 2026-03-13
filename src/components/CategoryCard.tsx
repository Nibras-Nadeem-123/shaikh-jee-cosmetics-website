import React from 'react';
import { Category } from '@/types';
import Image from 'next/image';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group bg-white border border-(--color-border) rounded-lg overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={category.image}
                  alt={category.name}
                  height={500}
                  width={500}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-6">
          <div className="text-white">
            <h3 className="text-xl mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm opacity-90">{category.description}</p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
