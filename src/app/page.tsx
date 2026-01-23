"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { getPublicProperties, Property, convertUserListingToProperty } from "@/lib/data"
import { useAuth } from "@/contexts/auth-context"
import { useMemo } from "react"

// neighborhoodから区名を抽出する関数
function extractDistrict(neighborhood?: string): string {
  if (!neighborhood) return "その他"
  // 「目黒区中目黒」→「目黒区」、「大阪市浪速区新今宮」→「浪速区」
  const match = neighborhood.match(/(.+?区)/)
  return match ? match[1] : "その他"
}

// 横スクロールセクションコンポーネント
function ScrollSection({ title, properties }: { title: string; properties: Property[] }) {
  if (properties.length === 0) return null

  return (
    <section className="mb-10">
      <div className="mx-auto max-w-7xl px-6 mb-5">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
        />
        <div className="overflow-x-auto scrollbar-hide pb-4" style={{ scrollSnapType: 'x mandatory', scrollPaddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))' }}>
          <div className="flex gap-5" style={{ paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))' }}>
            {properties.map((property) => (
              <div key={property.id} className="flex-shrink-0 w-72" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                <PropertyCard property={property} />
              </div>
            ))}
            {/* 右側の余白を確保するための見えない要素 */}
            <div className="flex-shrink-0" style={{ width: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))' }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}

// 表示する区の順番（人気エリア順）
const DISTRICT_ORDER = [
  "渋谷区",
  "目黒区",
  "港区",
  "世田谷区",
  "新宿区",
  "杉並区",
  "文京区",
  "台東区",
  "墨田区",
  "豊島区",
  "中野区",
  "練馬区",
  "北区",
  "荒川区",
  "板橋区",
]

export default function HomePage() {
  const { listings } = useAuth()

  const properties = useMemo(() => {
    const staticProperties = getPublicProperties()

    const publishedUserListings = listings
      .filter((listing) => listing.status === "published")
      .map((listing) => convertUserListingToProperty(listing))

    return [...staticProperties, ...publishedUserListings]
  }, [listings])

  // 東京の物件のみをフィルタリング
  const tokyoProperties = properties.filter((p) => p.area === "東京")

  // 区ごとにグループ化
  const propertiesByDistrict = useMemo(() => {
    const grouped: Record<string, Property[]> = {}

    tokyoProperties.forEach((property) => {
      const district = extractDistrict(property.location?.neighborhood)
      if (!grouped[district]) {
        grouped[district] = []
      }
      grouped[district].push(property)
    })

    return grouped
  }, [tokyoProperties])

  // 表示順序に従ってソートされた区のリスト
  const sortedDistricts = DISTRICT_ORDER.filter(
    (district) => propertiesByDistrict[district]?.length > 0
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="py-8">
          {tokyoProperties.length > 0 ? (
            <>
              {sortedDistricts.map((district) => (
                <ScrollSection
                  key={district}
                  title={district}
                  properties={propertiesByDistrict[district]}
                />
              ))}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">現在、公開中の物件はありません</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
