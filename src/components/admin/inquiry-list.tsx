"use client"

import { useState } from "react"
import Link from "next/link"
import type { Inquiry } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, User, MessageSquare, ExternalLink } from "lucide-react"

interface InquiryListProps {
  inquiries: Inquiry[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  viewing_scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusLabels = {
  pending: "新規",
  approved: "承認済み",
  viewing_scheduled: "内見予定",
  completed: "完了",
  rejected: "却下",
}

export function InquiryList({ inquiries }: InquiryListProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredInquiries =
    filterStatus === "all" ? inquiries : inquiries.filter((inq) => inq.status === filterStatus)

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
          すべて ({inquiries.length})
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("pending")}
          className="rounded-full"
        >
          新規 ({inquiries.filter((i) => i.status === "pending").length})
        </Button>
        <Button
          variant={filterStatus === "viewing_scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("viewing_scheduled")}
          className="rounded-full"
        >
          内見予定 ({inquiries.filter((i) => i.status === "viewing_scheduled").length})
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("approved")}
          className="rounded-full"
        >
          承認済み ({inquiries.filter((i) => i.status === "approved").length})
        </Button>
      </div>

      {/* Inquiry Cards */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-12 text-center">
            <p className="text-muted-foreground">問い合わせがありません</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-lg border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className={statusColors[inquiry.status]}>{statusLabels[inquiry.status]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inquiry.submittedAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{inquiry.propertyTitle}</h3>
                  <p className="text-sm text-muted-foreground">ID: {inquiry.id}</p>
                </div>
                <Link href={`/properties/${inquiry.propertyId}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    物件を見る
                  </Button>
                </Link>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{inquiry.applicantName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${inquiry.applicantEmail}`} className="text-coral hover:underline">
                    {inquiry.applicantEmail}
                  </a>
                </div>
                {inquiry.duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>契約期間: {inquiry.duration}</span>
                  </div>
                )}
                {inquiry.viewingDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-purple-600">
                      内見: {new Date(inquiry.viewingDate).toLocaleString("ja-JP")}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MessageSquare className="h-4 w-4" />
                    興味を持った理由
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{inquiry.reason}</p>
                </div>

                {inquiry.questions && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="mb-2 text-sm font-semibold text-foreground">質問・不安点</div>
                    <p className="text-sm leading-relaxed text-foreground/90">{inquiry.questions}</p>
                  </div>
                )}

                {inquiry.notes && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-foreground">運営メモ</div>
                    <p className="text-sm leading-relaxed text-foreground/90">{inquiry.notes}</p>
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
