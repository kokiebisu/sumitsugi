import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ImageGallery } from "@/components/image-gallery";
import { AmenityIcons } from "@/components/amenity-icons";
import { StyleBadge } from "@/components/style-badge";
import { PropertySidebar } from "@/components/property-sidebar";
import { getPropertyById, getPublicProperties } from "@/lib/data";
import {
  Clock,
  ArrowLeft,
  Sofa,
  Home,
  Calendar,
  MapPin,
  User,
  Sparkles,
  Users,
  Building2,
  Maximize2,
  Layers,
  Train,
  Store,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Heart,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  MessageCircle,
  Check,
} from "lucide-react";

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
            物件一覧
          </Link>
        </div>

        {/* Image Gallery - Airbnb Style */}
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <ImageGallery images={property.images} title={property.title} />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-5 xl:gap-20">
            {/* Main Content - 3/5 width */}
            <div className="lg:col-span-3">
              {/* Title and Location */}
              <div className="pb-6 border-b border-border">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {property.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-base">
                  <span className="text-foreground">{property.area}</span>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{property.estimatedDuration}</span>
                  </div>
                  {property.style && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <StyleBadge style={property.style} size="md" />
                    </>
                  )}
                </div>
              </div>

              {/* Creator Profile - Airbnb Style */}
              {property.host && (
                <section className="py-8 border-b border-border">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-[#F7F7F7]">
                        {/* DiceBear Notionists アバター */}
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${property.host?.name || "default"}&backgroundColor=f7f7f7`}
                          alt="Avatar"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-2">
                        クリエイター：{property.host.name}さん
                      </h2>
                      {property.host.yearsHosting && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {property.host.rating &&
                            property.host.rating >= 4.8 &&
                            "スーパークリエイター・"}
                          活動歴{property.host.yearsHosting}年
                        </p>
                      )}
                      <p className="text-base leading-relaxed text-foreground/80 mb-4">
                        {property.host.bio}
                      </p>

                      {/* Social Links */}
                      {property.host.socialLinks && (
                        <div className="flex flex-wrap gap-3">
                          {property.host.socialLinks.instagram && (
                            <a
                              href={`https://instagram.com/${property.host.socialLinks.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <Instagram className="h-4 w-4" />
                              <span>{property.host.socialLinks.instagram}</span>
                            </a>
                          )}
                          {property.host.socialLinks.twitter && (
                            <a
                              href={`https://twitter.com/${property.host.socialLinks.twitter.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <Twitter className="h-4 w-4" />
                              <span>{property.host.socialLinks.twitter}</span>
                            </a>
                          )}
                          {property.host.socialLinks.youtube && (
                            <a
                              href={`https://youtube.com/${property.host.socialLinks.youtube.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <Youtube className="h-4 w-4" />
                              <span>{property.host.socialLinks.youtube}</span>
                            </a>
                          )}
                          {property.host.socialLinks.website && (
                            <a
                              href={`https://${property.host.socialLinks.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <Globe className="h-4 w-4" />
                              <span>{property.host.socialLinks.website}</span>
                            </a>
                          )}
                          {property.host.socialLinks.tiktok && (
                            <a
                              href={`https://tiktok.com/@${property.host.socialLinks.tiktok.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>{property.host.socialLinks.tiktok}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Why Chose This Room */}
                  {property.host.whyChoseThis &&
                    property.host.whyChoseThis.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="mb-6 text-lg font-semibold text-foreground flex items-center gap-2">
                          <Heart className="h-5 w-5 text-coral" />
                          こだわりのインテリア
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {property.host.whyChoseThis.map((item, index) => (
                            <div key={index} className="group">
                              {typeof item !== "string" && item.image && (
                                <div className="mb-3 rounded-xl overflow-hidden aspect-[4/3]">
                                  <img
                                    src={item.image}
                                    alt={`理由${index + 1}の写真`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                              )}
                              <p className="text-base text-foreground/90 leading-relaxed">
                                {typeof item === "string" ? item : item.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Message to Next */}
                  {property.host.messageToNext && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="mb-3 text-lg font-semibold text-foreground">
                        次の人へのメッセージ
                      </h3>
                      <div className="rounded-lg bg-muted/30 border border-border p-6">
                        <p className="text-base leading-relaxed text-foreground/90 italic">
                          "{property.host.messageToNext}"
                        </p>
                        <p className="mt-4 text-sm text-muted-foreground text-right">
                          — {property.host.name}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Story Section */}
              <section className="py-8 border-b border-border">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  この暮らしのストーリー
                </h2>
                <p className="text-base leading-relaxed text-foreground/80">
                  {property.story}
                </p>
              </section>

              {/* Amenities Section */}
              <section className="py-8 border-b border-border">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  提供されるアメニティ・設備
                </h2>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                  {property.basicAmenities &&
                    property.basicAmenities.map((amenity, index) => (
                      <div
                        key={`amenity-${index}`}
                        className="flex items-center gap-3"
                      >
                        <Check className="h-5 w-5 text-foreground flex-shrink-0" />
                        <span className="text-base text-foreground">
                          {amenity}
                        </span>
                      </div>
                    ))}
                </div>
              </section>

              {/* Furniture Description */}
              <section className="py-8 border-b border-border">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  家具・インテリアについて
                </h2>
                <p className="text-base leading-relaxed text-foreground/80 mb-6">
                  {property.furnitureDescription}
                </p>

                {/* Condition Badge */}
                {property.condition && (
                  <div className="mb-6">
                    <span className="inline-block rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                      状態：
                      {property.condition === "excellent" && "綺麗"}
                      {property.condition === "good" && "良好"}
                      {property.condition === "used" && "中古"}
                    </span>
                  </div>
                )}

                {/* Equipment List */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-16 md:gap-y-4">
                      <AmenityIcons
                        amenities={property.amenities}
                        layout="row"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Property Details Section */}
              {property.propertyDetails && (
                <section className="py-8 border-b border-border">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    物件詳細
                  </h2>
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
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
                      <Maximize2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-0.5">
                          専有面積
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {property.propertyDetails.size}㎡
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Layers className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-0.5">
                          階数
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {property.propertyDetails.floor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-0.5">
                          築年
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {property.propertyDetails.buildYear}年
                        </p>
                      </div>
                    </div>
                  </div>
                  {property.propertyDetails.facilities &&
                    property.propertyDetails.facilities.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                          設備
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {property.propertyDetails.facilities.map(
                            (facility, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm text-foreground"
                              >
                                {facility}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </section>
              )}

              {/* Location Info Section */}
              {property.locationInfo && (
                <section className="py-8 border-b border-border">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    エリア情報
                  </h2>

                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Train className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {property.locationInfo.nearestStation} 徒歩
                          {property.locationInfo.walkingMinutes}分
                        </p>
                      </div>
                    </div>
                    {property.locationInfo.areaDescription && (
                      <p className="text-base leading-relaxed text-foreground/80 ml-8">
                        {property.locationInfo.areaDescription}
                      </p>
                    )}
                  </div>

                  {property.locationInfo.nearbyPlaces &&
                    property.locationInfo.nearbyPlaces.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          周辺施設
                        </h3>
                        <div className="grid grid-cols-2 gap-3 ml-6">
                          {property.locationInfo.nearbyPlaces.map(
                            (place, index) => (
                              <div key={index} className="text-sm">
                                <span className="text-foreground">
                                  {place.name}
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  {place.distance}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {property.locationInfo.creatorRecommendations &&
                    property.locationInfo.creatorRecommendations.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                          クリエイターのおすすめスポット
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {property.locationInfo.creatorRecommendations.map(
                            (spot, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1.5 rounded-full border border-coral/20 bg-coral/10 px-3 py-1.5 text-sm text-coral font-medium"
                              >
                                {spot}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </section>
              )}

              {/* Handover Details Section */}
              {property.handoverDetails && (
                <section className="py-8 border-b border-border">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    引き継ぎ詳細
                  </h2>

                  <div className="space-y-6">
                    {/* Included Items */}
                    {property.handoverDetails.included &&
                      property.handoverDetails.included.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            引き継ぎに含まれるもの
                          </h3>
                          <ul className="space-y-2 ml-7">
                            {property.handoverDetails.included.map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-foreground/80 flex items-start gap-2"
                                >
                                  <span className="text-green-600 mt-0.5">
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Not Included Items */}
                    {property.handoverDetails.notIncluded &&
                      property.handoverDetails.notIncluded.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-base font-semibold text-foreground flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                            含まれないもの
                          </h3>
                          <ul className="space-y-2 ml-7">
                            {property.handoverDetails.notIncluded.map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Timeline */}
                    {(property.handoverDetails.viewingAvailableFrom ||
                      property.handoverDetails.moveInAvailableFrom) && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="mb-4 text-base font-semibold text-foreground">
                          引き継ぎスケジュール
                        </h3>
                        <div className="space-y-3">
                          {property.handoverDetails.viewingAvailableFrom && (
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  内見可能日
                                </p>
                                <p className="text-base text-foreground">
                                  {
                                    property.handoverDetails
                                      .viewingAvailableFrom
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                          {property.handoverDetails.moveInAvailableFrom && (
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  引き継ぎ可能日
                                </p>
                                <p className="text-base text-foreground">
                                  {property.handoverDetails.moveInAvailableFrom}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

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
            <div className="lg:col-span-2">
              <PropertySidebar property={property} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
