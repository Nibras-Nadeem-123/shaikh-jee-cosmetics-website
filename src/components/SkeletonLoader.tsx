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

// Shimmer effect skeleton for premium look
export const ShimmerSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
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

// Account Page Skeleton
export const AccountPageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen pb-20 bg-muted/20">
            {/* Header Banner Skeleton */}
            <div className="pt-12 pb-24 bg-gray-300 animate-pulse">
                <div className="container px-4 mx-auto lg:px-8">
                    <div className="flex flex-col items-center gap-8 md:flex-row">
                        <div className="w-32 h-32 bg-gray-400 rounded-full animate-pulse" />
                        <div className="space-y-3 text-center md:text-left">
                            <div className="w-48 h-10 bg-gray-400 rounded animate-pulse" />
                            <div className="w-64 h-4 bg-gray-400 rounded animate-pulse" />
                            <div className="flex gap-4">
                                <div className="w-24 h-8 bg-gray-400 rounded-full animate-pulse" />
                                <div className="w-24 h-8 bg-gray-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto -mt-12 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-4">
                    {/* Sidebar Skeleton */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-6 space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    </aside>

                    {/* Content Skeleton */}
                    <main className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] p-10 space-y-6">
                            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                            <div className="grid gap-6 md:grid-cols-2 mt-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

// Order Card Skeleton
export const OrderCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="space-y-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-3xl overflow-hidden">
                    <div className="p-6 bg-gray-100">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-8">
                                <div className="space-y-2">
                                    <div className="w-16 h-3 bg-gray-300 rounded animate-pulse" />
                                    <div className="w-24 h-5 bg-gray-300 rounded animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="w-16 h-3 bg-gray-300 rounded animate-pulse" />
                                    <div className="w-20 h-5 bg-gray-300 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="w-24 h-8 bg-gray-300 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex gap-4 items-center">
                                <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
                                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Wishlist Skeleton
export const WishlistSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                        <div className="w-1/3 h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="w-full h-5 bg-gray-200 rounded animate-pulse" />
                        <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="flex gap-2">
                            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Address Card Skeleton
export const AddressCardSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white border-2 border-gray-200 rounded-[2.5rem] p-8 space-y-4">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Profile Stats Skeleton
export const ProfileStatsSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-8 bg-white border rounded-3xl space-y-3 text-center">
                    <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-16 h-8 mx-auto bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-3 mx-auto bg-gray-200 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
};

// Checkout Skeleton
export const CheckoutSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl p-6 space-y-4">
                            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="grid md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl p-6 space-y-4">
                            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl p-6 h-fit space-y-4">
                        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                                        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex justify-between">
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex justify-between pt-2">
                                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-14 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};
