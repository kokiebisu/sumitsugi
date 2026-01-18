import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { getPublicProperties } from "@/lib/data"

export const metadata = {
  title: "物件一覧 | くらしの引き継ぎ",
  description: "引き継げる暮らしの一覧。家具も、空間も、ストーリーも。",
}

export default function PropertiesPage() {
  const properties = getPublicProperties()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-medium text-foreground md:text-4xl">引き継げる暮らし</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              いま、次の住人を探している物件です。
              <br className="hidden sm:block" />
              気になる暮らしがあれば、まずは話を聞いてみてください。
            </p>
          </div>

          {/* Notice Banner */}
          <div className="mb-8 rounded-lg bg-warm-gray-100 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">実験中のサービスです：</span>
            条件は固定ではありません。対話しながら、お互いに合う形を探していきます。
          </div>

          {/* Property Grid */}
          {properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-warm-gray-50 py-20 text-center">
              <p className="text-muted-foreground">現在、公開中の物件はありません。</p>
            </div>
          )}

          {/* Bottom Notice */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              探している暮らしが見つからない場合は、
              <br className="sm:hidden" />
              お気軽にご相談ください。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
