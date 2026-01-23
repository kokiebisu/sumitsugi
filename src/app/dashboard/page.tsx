"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Check, Clock, Calendar, Home, ArrowRight } from "lucide-react"

const inquirySteps = [
  { id: "pending", label: "申し込み", icon: Check },
  { id: "decided", label: "引き継ぎ決定", icon: Calendar },
  { id: "completed", label: "引き継ぎ完了", icon: Home },
]

export default function DashboardPage() {
  const { user, inquiries } = useAuth()

  const userInquiries = user
    ? inquiries.filter(inq => inq.applicantEmail === user.email)
    : []

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 0
      case "decided":
        return 1
      case "completed":
        return 2
      default:
        return 0
    }
  }

  const getNextAction = (status: string) => {
    switch (status) {
      case "pending":
        return "内見の日程調整のご連絡をお待ちください"
      case "decided":
        return "引き継ぎの準備を進めましょう"
      case "completed":
        return "引き継ぎが完了しました"
      default:
        return "お待ちください"
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground">ダッシュボード</h1>
            <p className="mt-2 text-muted-foreground">
              申し込んだ暮らしの引き継ぎ状況を確認できます
            </p>
          </div>

          {userInquiries.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                申し込んだ暮らしがありません
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                気になる暮らしを見つけて、引き継ぎを申し込みましょう
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-lg bg-coral px-6 py-2 text-sm font-semibold text-white hover:bg-coral/90"
              >
                暮らしを探す
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {userInquiries.map((inquiry) => {
                const currentStepIndex = getStepIndex(inquiry.status)

                return (
                  <div
                    key={inquiry.id}
                    className="rounded-xl border border-border bg-background p-6 shadow-sm"
                  >
                    {/* 物件情報 */}
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/listings/${inquiry.propertyId}`}
                          className="text-xl font-semibold text-foreground hover:text-coral"
                        >
                          {inquiry.propertyTitle}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          申込日: {new Date(inquiry.submittedAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </div>

                    {/* 進捗バー */}
                    <div className="mb-6">
                      <div className="relative">
                        <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
                        <div
                          className="absolute left-0 top-5 h-0.5 bg-coral transition-all duration-500"
                          style={{ width: `${(currentStepIndex / (inquirySteps.length - 1)) * 100}%` }}
                        />

                        <div className="relative flex justify-between">
                          {inquirySteps.map((step, index) => {
                            const isPast = index < currentStepIndex
                            const isCurrent = index === currentStepIndex
                            const DisplayIcon = isPast ? Check : step.icon

                            return (
                              <div key={step.id} className="flex flex-col items-center relative">
                                {isCurrent && (
                                  <div className="absolute -top-2 h-16 w-16 animate-pulse rounded-full bg-coral/10" />
                                )}
                                <div
                                  className={`flex items-center justify-center rounded-full border-2 transition-all duration-300 relative ${
                                    isPast
                                      ? "h-10 w-10 border-coral bg-coral text-white"
                                      : isCurrent
                                      ? "h-12 w-12 border-coral bg-white text-coral shadow-lg"
                                      : "h-10 w-10 border-gray-300 bg-white text-gray-400"
                                  }`}
                                >
                                  <DisplayIcon className={`${isCurrent ? "h-6 w-6" : "h-5 w-5"}`} />
                                </div>
                                <p
                                  className={`mt-2 text-xs font-medium ${
                                    isCurrent
                                      ? "text-coral font-bold"
                                      : isPast
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {step.label}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 次のアクション */}
                    <div className={`rounded-lg p-4 ${
                      inquiry.status === "pending"
                        ? "bg-amber-50 border border-amber-200"
                        : inquiry.status === "completed"
                        ? "bg-green-50 border border-green-200"
                        : "bg-blue-50"
                    }`}>
                      <p className={`flex items-center gap-2 text-sm font-semibold ${
                        inquiry.status === "pending"
                          ? "text-amber-900"
                          : inquiry.status === "completed"
                          ? "text-green-900"
                          : "text-blue-900"
                      }`}>
                        {inquiry.status === "pending" ? (
                          <Clock className="h-5 w-5 animate-pulse" />
                        ) : inquiry.status === "completed" ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <ArrowRight className="h-5 w-5" />
                        )}
                        {getNextAction(inquiry.status)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
