"use client";
interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div className={`bg-gray-200 overflow-hidden relative ${className}`}>
            <div className="absolute inset-0 animate-shimmer" />
        </div>
    );
}
