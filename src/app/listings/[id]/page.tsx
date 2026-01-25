import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ImageGallery } from "@/components/image-gallery";
import { PropertySidebar } from "@/components/property-sidebar";
import { PropertyMap } from "@/components/property-map";
import {
  getPropertyById,
  getPublicProperties,
  furnitureLabels,
} from "@/lib/data";
import {
  ArrowLeft,
  Home,
  CheckCircle2,
  XCircle,
  BedDouble,
  Sofa,
  Monitor,
  Archive,
  UtensilsCrossed,
  Shirt,
  Tv,
  Refrigerator,
  Coffee,
} from "lucide-react";

const FURNITURE_ICONS: Record<string, typeof BedDouble> = {
  bed: BedDouble,
  sofa: Sofa,
  desk: Monitor,
  table: Coffee,
  storage: Archive,
  dining: UtensilsCrossed,
  wardrobe: Shirt,
  tv: Tv,
  fridge: Refrigerator,
};

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const properties = getPublicProperties();
  return properties.map((property) => ({
    id: property.id,
  }));
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) return { title: "物件が見つかりません" };

  return {
    title: `${property.title} | tsumugi`,
    description: property.title,
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property || property.status !== "public") {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pb-12">
        {/* Back Link */}
        <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-foreground/80"
          >
            <ArrowLeft className="h-4 w-4" />
            リスティング
          </Link>
        </div>

        {/* Image Gallery - Airbnb Style */}
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <ImageGallery images={property.images} title={property.title} />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-5">
            {/* Main Content - 3/5 width */}
            <div className="lg:col-span-3">
              {/* Title and Location */}
              <div className="pb-6 border-b border-border">
                <h1 className="text-[26px] font-medium text-foreground">
                  {property.title}
                </h1>
                <p className="mt-1 text-base font-normal text-foreground">
                  {[
                    property.location?.neighborhood || property.area,
                    property.layout,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              </div>

              {/* Furniture Section */}
              <section className="py-8 border-b border-border">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  引き継ぎ対象の大型家具
                </h2>

                {/* Large Furniture Icons */}
                {property.furniture && property.furniture.length > 0 && (
                  <div className="mb-6">
                    <div className="flex gap-6">
                      {property.furniture.map((item, index) => {
                        const Icon = FURNITURE_ICONS[item] || Home;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-2"
                          >
                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                              <Icon
                                className="h-7 w-7 text-foreground"
                                strokeWidth={1.5}
                              />
                            </div>
                            <span className="text-sm text-foreground">
                              {furnitureLabels[item] || item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar / CTA - 2/5 width */}
            <div className="lg:col-span-2 pb-8">
              <PropertySidebar property={property} />
            </div>

            {/* Map Section - Full Grid Width (5 columns) */}
            {property.location && (
              <div className="lg:col-span-5 pt-4 border-t border-border">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  ロケーション
                </h2>
                <p className="mb-4 text-base text-foreground">
                  {property.location.neighborhood
                    ? `日本東京都${property.location.neighborhood.replace("区", "区 ")}`
                    : property.area}
                </p>
                <PropertyMap
                  lat={property.location.lat}
                  lng={property.location.lng}
                  neighborhood={property.location.neighborhood}
                  title={property.title}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
