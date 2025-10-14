import { SkeletonCard } from "@/components/skeleton-card"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Feature Highlights Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex space-x-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        <SkeletonCard className="h-96" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  )
}
