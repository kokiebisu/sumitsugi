import { Skeleton } from '@/components/ui/skeleton';

export function PropertyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </header>

      <main className="pb-16">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Back Button */}
          <Skeleton className="mb-6 h-10 w-32" />

          {/* Image Gallery Skeleton */}
          <div className="mb-8">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Main Content - 3/5 width */}
            <div className="space-y-8 lg:col-span-3">
              {/* Title */}
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Sections */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3 border-t border-border pt-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            {/* Sidebar - 2/5 width */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="rounded-xl border border-border bg-background p-6 shadow-lg">
                  <div className="mb-6 space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="mb-6 h-12 w-full" />
                  <div className="space-y-3 border-t border-border pt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
