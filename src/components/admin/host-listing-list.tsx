"use client"

import { useState } from "react"
import type { SellerListing } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, User, Phone, MapPin, Home } from "lucide-react"

interface HostListingListProps {
  listings: SellerListing[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  published: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusLabels = {
  pending: "新規申込",
  approved: "承認済み",
  published: "掲載中",
  rejected: "却下",
}

export function HostListingList({ listings }: HostListingListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredListings =
    filterStatus === "all" ? listings : listings.filter((listing) => listing.status === filterStatus)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
          className="rounded-full"
        >
          すべて ({listings.length})
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("pending")}
          className="rounded-full"
        >
          新規 ({listings.filter((l) => l.status === "pending").length})
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("approved")}
          className="rounded-full"
        >
          承認済み ({listings.filter((l) => l.status === "approved").length})
        </Button>
        <Button
          variant={filterStatus === "published" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("published")}
          className="rounded-full"
        >
          掲載中 ({listings.filter((l) => l.status === "published").length})
        </Button>
      </div>

      {/* Listing Cards */}
      <div className="space-y-4">
        {filteredListings.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-12 text-center">
            <p className="text-muted-foreground">掲載申込がありません</p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-lg border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className={statusColors[listing.status]}>{statusLabels[listing.status]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(listing.submittedAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {listing.propertyAddress} の物件
                  </h3>
                  <p className="text-sm text-muted-foreground">ID: {listing.id}</p>
                </div>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{listing.sellerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${listing.sellerEmail}`} className="text-coral hover:underline">
                    {listing.sellerEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${listing.sellerPhone}`} className="text-coral hover:underline">
                    {listing.sellerPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.propertyAddress}</span>
                </div>
                {listing.handoverFee && (
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">引き継ぎ費用: ¥{listing.handoverFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>退去予定: {new Date(listing.moveOutDate).toLocaleDateString("ja-JP")}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Home className="h-4 w-4" />
                    引き継ぐ家具・インテリア
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{listing.furnitureDescription}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 text-sm font-semibold text-foreground">掲載したい理由</div>
                  <p className="text-sm leading-relaxed text-foreground/90">{listing.whyListing}</p>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                    {listing.landlordConsent.hasLandlordConsent ? "大家さんの承諾済み" : "大家さんの承諾未確認"}
                  </div>
                </div>

                {listing.notes && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-foreground">運営メモ</div>
                    <p className="text-sm leading-relaxed text-foreground/90">{listing.notes}</p>
                  </div>
                )}

                {listing.publishedPropertyId && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-green-800">掲載中の物件</div>
                    <a
                      href={`/listings/${listing.publishedPropertyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-coral hover:underline"
                    >
                      物件ページを見る
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <Button size="sm" className="bg-coral hover:bg-coral-dark">
                  ステータス変更
                </Button>
                <Button size="sm" variant="outline">
                  メモを編集
                </Button>
                <Button size="sm" variant="outline">
                  メール送信
                </Button>
                {listing.status === "approved" && !listing.publishedPropertyId && (
                  <Button size="sm" variant="default">
                    物件として掲載
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
