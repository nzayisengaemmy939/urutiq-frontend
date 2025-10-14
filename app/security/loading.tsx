import { Skeleton } from "@/components/ui/skeleton"

export default function SecurityLoading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 p-6 border rounded-lg">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4 p-6 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
