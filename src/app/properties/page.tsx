'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyCard } from '@/components/property-card';
import type { Property } from '@/lib/data';
import { isUrgentMoveIn, getDaysUntilMoveOut } from '@/lib/utils';
import { Search } from 'lucide-react';

interface ApiProperty {
  id: string;
  title: string;
  images: string[];
  handoverFee: number | null;
  rent: number | null;
  managementFee: number | null;
  deposit: string | null;
  keyMoney: string | null;
  area: string | null;
  lat: string | null;
  lng: string | null;
  neighborhood: string | null;
  layout: string | null;
  occupancy: number | null;
  style: string | null;
  status: string;
  moveOutDate: string | null;
  condition: string | null;
  furnitureItems: unknown;
  landlordConsent: { status?: string } | null;
  [key: string]: unknown;
}

function mapApiPropertyToProperty(item: ApiProperty): Property {
  return {
    id: item.id,
    title: item.title,
    images: item.images ?? [],
    handoverFee: item.handoverFee ?? 0,
    rent: item.rent ?? undefined,
    managementFee: item.managementFee ?? undefined,
    deposit: item.deposit ? parseFloat(item.deposit) : undefined,
    keyMoney: item.keyMoney ? parseFloat(item.keyMoney) : undefined,
    area: item.area ?? '',
    location:
      item.lat && item.lng
        ? {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            neighborhood: item.neighborhood ?? undefined,
          }
        : item.neighborhood
          ? { lat: 0, lng: 0, neighborhood: item.neighborhood }
          : undefined,
    layout: item.layout ?? undefined,
    occupancy: item.occupancy ?? undefined,
    style: item.style ?? undefined,
    moveOutDate: item.moveOutDate ?? undefined,
    status: item.status === 'public' ? 'public' : 'draft',
    consentStatus:
      (item.landlordConsent?.status as Property['consentStatus']) ?? undefined,
    condition: (item.condition as 'excellent' | 'good' | 'used') ?? undefined,
  };
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/properties');
      if (!res.ok) {
        throw new Error('物件の取得に失敗しました');
      }
      const json = (await res.json()) as { data?: ApiProperty[] };
      const items: ApiProperty[] = json.data ?? [];
      const mapped = items.map(mapApiPropertyToProperty);
      // F-507: 即入居可能物件（退去30日以内）を上部に優先表示
      const sorted = [...mapped].sort((a, b) => {
        const aUrgent = isUrgentMoveIn(a.moveOutDate);
        const bUrgent = isUrgentMoveIn(b.moveOutDate);
        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;
        if (aUrgent && bUrgent) {
          return (
            getDaysUntilMoveOut(a.moveOutDate!) -
            getDaysUntilMoveOut(b.moveOutDate!)
          );
        }
        return 0;
      });
      setProperties(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '物件の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            公開中の物件
          </h1>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-square bg-muted rounded-xl animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadProperties}
                className="px-4 py-2 bg-foreground text-white rounded-lg hover:bg-foreground/90 text-sm font-medium"
              >
                再試行
              </button>
            </div>
          )}

          {!isLoading && !error && properties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                公開中の物件はまだありません
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                現在公開されている物件はありません。新しい物件が登録されるまでお待ちください。
              </p>
            </div>
          )}

          {!isLoading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
