import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ImageGallery } from "@/components/image-gallery";
import { StyleBadge } from "@/components/style-badge";
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
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
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
    description: property.summary,
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
                    property.layout || property.propertyDetails?.layout,
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

                {/* Condition Badge */}
                {property.condition && (
                  <div>
                    <span className="inline-block rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                      状態：
                      {property.condition === "excellent" && "綺麗"}
                      {property.condition === "good" && "良好"}
                      {property.condition === "used" && "中古"}
                    </span>
                  </div>
                )}
              </section>

              {/* Property Details Section - Simplified */}
              {property.propertyDetails && (
                <section className="py-8 border-b border-border">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    物件情報
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-0.5">
                          間取り
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {property.propertyDetails.layout}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-0.5">
                          エリア
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {property.area}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Handover Schedule Section - 全物件で表示 */}
              <section className="py-8">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  引き継ぎスケジュール
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        内見可能日
                      </p>
                      <p className="text-base text-foreground">
                        {property.handoverDetails?.viewingAvailableFrom ||
                          "要相談"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              {/* FAQ Section */}
              {property.faq && property.faq.length > 0 && (
                <section className="py-8 border-b border-border">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    よくある質問
                  </h2>
                  <div className="space-y-6">
                    {property.faq.map((item, index) => (
                      <div
                        key={index}
                        className="pb-6 border-b border-border last:border-0 last:pb-0"
                      >
                        <h3 className="mb-2 text-base font-semibold text-foreground flex items-start gap-2">
                          <HelpCircle className="h-5 w-5 text-coral mt-0.5 flex-shrink-0" />
                          {item.question}
                        </h3>
                        <p className="text-base leading-relaxed text-foreground/80 ml-7">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
