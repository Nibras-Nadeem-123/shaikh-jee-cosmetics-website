"use client"
import React from 'react';

export const SkeletonLoader: React.FC<{ count?: number; height?: string; width?: string; className?: string }> = ({
    count = 1,
    height = 'h-4',
    width = 'w-full',
    className = ''
}) => {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className={`bg-gray-200 rounded animate-pulse ${height} ${width} ${className} mb-2`}
                />
            ))}
        </>
    );
};

export const ProductCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    {/* Image skeleton */}
                    <div className="aspect-square bg-gray-200 animate-pulse" />

                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                        <SkeletonLoader height="h-3" width="w-1/2" />
                        <SkeletonLoader height="h-4" />
                        <SkeletonLoader height="h-4" width="w-2/3" />
                        <div className="flex gap-2">
                            <SkeletonLoader height="h-6" width="w-1/4" />
                            <SkeletonLoader height="h-6" width="w-1/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const ProductDetailsSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left side - Image */}
            <div>
                <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-4" />
                <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Right side - Details */}
            <div className="space-y-6">
                <SkeletonLoader height="h-8" width="w-3/4" />
                <SkeletonLoader height="h-4" count={3} width="w-full" />

                <div className="space-y-2">
                    <SkeletonLoader height="h-6" width="w-1/4" />
                    <SkeletonLoader height="h-4" count={2} />
                </div>

                <div className="space-y-3">
                    <SkeletonLoader height="h-10" width="w-full" />
                    <SkeletonLoader height="h-10" width="w-full" />
                </div>

                <div className="space-y-3 border-t pt-6">
                    <SkeletonLoader height="h-4" width="w-1/2" />
                    <SkeletonLoader height="h-4" count={3} />
                </div>
            </div>
        </div>
    );
};

export const CartPageSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 flex gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                        <div className="flex-1 space-y-3">
                            <SkeletonLoader height="h-4" width="w-3/4" />
                            <SkeletonLoader height="h-3" width="w-1/2" />
                            <SkeletonLoader height="h-4" width="w-1/4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar */}
            <div className="bg-gray-50 p-6 rounded-lg h-fit space-y-4">
                <SkeletonLoader height="h-6" width="w-1/2" />
                <SkeletonLoader height="h-4" count={5} />
                <SkeletonLoader height="h-10" width="w-full" />
            </div>
        </div>
    );
};

export const TableRowSkeleton: React.FC<{ columns?: number; rows?: number }> = ({ columns = 4, rows = 5 }) => {
    return (
        <>
            {[...Array(rows)].map((_, row) => (
                <tr key={row} className="border-b">
                    {[...Array(columns)].map((_, col) => (
                        <td key={col} className="px-6 py-4">
                            <SkeletonLoader height="h-4" width="w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export const HeaderSkeleton: React.FC = () => {
    return (
        <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                <SkeletonLoader height="h-8" width="w-32" />
                <div className="hidden md:flex flex-1 max-w-md">
                    <SkeletonLoader height="h-10" width="w-full" />
                </div>
                <div className="flex gap-4">
                    <SkeletonLoader height="h-10" width="w-10" />
                    <SkeletonLoader height="h-10" width="w-10" />
                    <SkeletonLoader height="h-10" width="w-10" />
                </div>
            </div>
        </header>
    );
};
