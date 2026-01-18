import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { getPublicProperties, Property } from "@/lib/data"

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
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-5 px-6" style={{ paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))' }}>
            {properties.map((property) => (
              <div key={property.id} className="flex-shrink-0 w-72">
                <PropertyCard property={property} />
              </div>
            ))}
            <div className="flex-shrink-0 w-6" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const properties = getPublicProperties()

  // スタイルでグループ化
  const creativeStyles = ["bohemian", "industrial", "modern"]
  const minimalStyles = ["minimal", "scandinavian"]
  const vintageStyles = ["vintage"]

  const creativeProperties = properties.filter((p) => creativeStyles.includes(p.style || ""))
  const minimalProperties = properties.filter((p) => minimalStyles.includes(p.style || ""))
  const vintageProperties = properties.filter((p) => vintageStyles.includes(p.style || ""))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="py-8">
          {properties.length > 0 ? (
            <>
              <ScrollSection title="クリエイターの暮らし" properties={creativeProperties} />
              <ScrollSection title="ミニマル・北欧スタイル" properties={minimalProperties} />
              <ScrollSection title="ヴィンテージ・レトロ" properties={vintageProperties} />
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
