"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Instagram,
  Globe,
  Sparkles,
  ChevronRight,
  Edit,
} from "lucide-react"

export default function AccountPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">読み込み中...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="mb-8 text-2xl font-semibold text-foreground">アカウント</h1>

          {/* プロフィールカード */}
          <Link
            href="/account/edit"
            className="mb-6 block rounded-xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#FF385C' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {user.isHost ? "クリエイター" : "入居希望者"}
                  </p>
                  <p className="mt-1 text-sm text-coral font-medium">プロフィールを編集</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>

          {/* 基本情報 */}
          <div className="mb-6 rounded-xl border border-border bg-background shadow-sm">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold text-foreground">基本情報</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center gap-3 p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">メールアドレス</p>
                  <p className="text-foreground">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 p-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">電話番号</p>
                    <p className="text-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">登録日</p>
                  <p className="text-foreground">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              {user.authProvider && (
                <div className="flex items-center gap-3 p-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">認証方法</p>
                    <p className="text-foreground capitalize">{user.authProvider}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* クリエイタープロフィール（ホストのみ） */}
          {user.isHost && user.hostProfile && (
            <div className="mb-6 rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border p-4">
                <h3 className="font-semibold text-foreground">クリエイタープロフィール</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex items-center gap-3 p-4">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">職業・活動</p>
                    <p className="text-foreground">{user.hostProfile.occupation}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm text-muted-foreground">自己紹介</p>
                  <p className="whitespace-pre-wrap text-foreground">{user.hostProfile.bio}</p>
                </div>
                {user.hostProfile.socialLinks && (
                  <div className="p-4">
                    <p className="mb-3 text-sm text-muted-foreground">SNS</p>
                    <div className="space-y-2">
                      {user.hostProfile.socialLinks.instagram && (
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {user.hostProfile.socialLinks.instagram}
                          </span>
                        </div>
                      )}
                      {user.hostProfile.socialLinks.twitter && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">𝕏</span>
                          <span className="text-foreground">
                            {user.hostProfile.socialLinks.twitter}
                          </span>
                        </div>
                      )}
                      {user.hostProfile.socialLinks.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {user.hostProfile.socialLinks.website}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">クリエイター登録日</p>
                    <p className="text-foreground">{formatDate(user.hostProfile.hostSince)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* クリエイターになる（非ホストのみ） */}
          {!user.isHost && (
            <Link
              href="/creator"
              className="mb-6 flex items-center justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-coral/10 p-3">
                  <Sparkles className="h-6 w-6 text-coral" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">クリエイターになる</p>
                  <p className="text-sm text-muted-foreground">
                    あなたの暮らしを次の人へ引き継ぎませんか？
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}

          {/* リスティング（ホストのみ） */}
          {user.isHost && (
            <Link
              href="/listing"
              className="mb-6 flex items-center justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-coral/10 p-3">
                  <Sparkles className="h-6 w-6 text-coral" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">リスティング</p>
                  <p className="text-sm text-muted-foreground">
                    物件の掲載と管理
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
