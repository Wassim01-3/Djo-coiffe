import React from 'react'

export interface SkeletonProps {
  className?: string
}

const pulse = 'animate-pulse bg-gray-200 rounded-xl'

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`${pulse} ${className}`} />
)

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 2 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
)

export const SkeletonCard: React.FC = () => (
  <div className="w-full rounded-[20px] bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
)

export const SkeletonImage: React.FC<{ height?: string }> = ({
  height = 'h-48',
}) => <Skeleton className={`w-full rounded-[20px] ${height}`} />

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export const SkeletonProfile: React.FC = () => (
  <div className="flex flex-col items-center gap-4 py-6">
    <Skeleton className="h-24 w-24 rounded-full" />
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-4 w-32" />
    <div className="flex gap-4 mt-2">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-16 w-20 rounded-[16px]" />
      ))}
    </div>
  </div>
)

export const SkeletonGallery: React.FC = () => (
  <div className="grid grid-cols-3 gap-2">
    {Array.from({ length: 9 }, (_, i) => (
      <Skeleton
        key={i}
        className={`rounded-[12px] ${i % 3 === 1 ? 'h-36' : 'h-28'}`}
      />
    ))}
  </div>
)

export const SkeletonProduct: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className="rounded-[20px] bg-white shadow-sm overflow-hidden"
      >
        <Skeleton className="h-40 rounded-none" />
        <div className="p-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)
