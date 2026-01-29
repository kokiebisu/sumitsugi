import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InquiryList } from "@/components/admin/inquiry-list"
import { SellerListingList } from "@/components/admin/seller-listing-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllInquiries, getAllSellerListings, type SellerListing } from "@/lib/data"

export const metadata = {
  title: "管理画面 | くらしの引き継ぎ",
  description: "問い合わせと物件掲載申込の管理",
}

export default function AdminPage() {
  const inquiries = getAllInquiries()
  const sellerListings = getAllSellerListings()

  const pendingInquiries = inquiries.filter((inq) => inq.status === "pending")
  const pendingSellerListings = sellerListings.filter((listing: SellerListing) => listing.status === "pending")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">管理画面</h1>
            <p className="text-sm text-muted-foreground">
              問い合わせと物件掲載申込を管理できます
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">新規問い合わせ</p>
              <p className="text-3xl font-bold text-coral">{pendingInquiries.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">全問い合わせ</p>
              <p className="text-3xl font-bold text-foreground">{inquiries.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">新規掲載申込</p>
              <p className="text-3xl font-bold text-coral">{pendingSellerListings.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">全掲載申込</p>
              <p className="text-3xl font-bold text-foreground">{sellerListings.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="inquiries" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="inquiries">
                問い合わせ
                {pendingInquiries.length > 0 && (
                  <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-xs text-white">
                    {pendingInquiries.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="listings">
                掲載申込
                {pendingSellerListings.length > 0 && (
                  <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-xs text-white">
                    {pendingSellerListings.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inquiries" className="mt-6">
              <InquiryList inquiries={inquiries} />
            </TabsContent>

            <TabsContent value="listings" className="mt-6">
              <SellerListingList listings={sellerListings} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
