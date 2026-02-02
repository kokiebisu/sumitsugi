import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyCardSkeleton } from '@/components/property-card-skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-12">
            {/* Skeleton for 2 areas with 4 properties each */}
            {[1, 2].map((section) => (
              <section key={section}>
                <div className="mb-6 h-8 w-32 animate-pulse rounded-md bg-muted" />
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
