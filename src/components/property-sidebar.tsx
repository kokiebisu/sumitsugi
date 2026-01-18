"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomSignupDialog } from "@/components/auth/custom-signup-dialog"
import type { Property, User } from "@/lib/data"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface PropertySidebarProps {
  property: Property
}

export function PropertySidebar({ property }: PropertySidebarProps) {
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const router = useRouter()
  const { user, login } = useAuth()

  const handleInquiryClick = () => {
    if (!user) {
      setShowSignupDialog(true)
    } else {
      router.push(`/properties/${property.id}/inquiry`)
    }
  }

  const handleSignupComplete = (newUser: User) => {
    login(newUser)
    setShowSignupDialog(false)
    // After signup, redirect to inquiry form
    router.push(`/properties/${property.id}/inquiry`)
  }

  return (
    <>
      <div className="sticky top-24">
        <div className="rounded-xl border border-border bg-background p-6 shadow-lg">
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                ¥{property.monthlyRent.toLocaleString()}
              </span>
              <span className="text-base text-muted-foreground">/ 月</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              インテリア購入料 ¥{property.interiorFee.toLocaleString()}
            </p>
          </div>

          <Button
            onClick={handleInquiryClick}
            className="w-full rounded-lg bg-gradient-to-r from-[#FF385C] to-[#E61E4D] py-6 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            内見を希望
          </Button>

          {/* Pricing Breakdown */}
          {property.fees && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="mb-4 text-sm font-semibold text-foreground">料金について</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground/80">月額家賃</span>
                  <span className="font-semibold text-foreground">
                    ¥{property.monthlyRent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground/80">インテリア購入料</span>
                  <span className="font-semibold text-foreground">
                    ¥{property.interiorFee.toLocaleString()}
                  </span>
                </div>
                {property.fees.deposit !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground/80">敷金</span>
                    <span className="text-foreground">¥{property.fees.deposit.toLocaleString()}</span>
                  </div>
                )}
                {property.fees.keyMoney !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground/80">礼金</span>
                    <span className="text-foreground">
                      {property.fees.keyMoney === 0 ? "なし" : `¥${property.fees.keyMoney.toLocaleString()}`}
                    </span>
                  </div>
                )}
                {property.fees.managementFee !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground/80">管理費・共益費（月額）</span>
                    <span className="text-foreground">¥{property.fees.managementFee.toLocaleString()}</span>
                  </div>
                )}
                {property.fees.cleaningFee !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground/80">クリーニング代（退去時）</span>
                    <span className="text-foreground">¥{property.fees.cleaningFee.toLocaleString()}</span>
                  </div>
                )}
                {property.fees.guaranteeFee !== undefined && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground/80">保証会社利用料</span>
                    <span className="text-foreground">¥{property.fees.guaranteeFee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* 初期費用合計 */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-semibold text-foreground">初期費用合計</span>
                  <span className="text-lg font-bold text-foreground">
                    ¥{(
                      property.interiorFee +
                      (property.fees.deposit || 0) +
                      (property.fees.keyMoney || 0) +
                      (property.fees.guaranteeFee || 0) +
                      (property.fees.cleaningFee || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  ※ 月額家賃・管理費は含まれません
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">契約期間</h3>
                <p className="text-sm text-muted-foreground">{property.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">エリア</h3>
                <p className="text-sm text-muted-foreground">{property.area}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">入居形態</h3>
                <p className="text-sm text-muted-foreground">単身向け</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Dialog */}
      <CustomSignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        onSignupComplete={handleSignupComplete}
      />
    </>
  )
}
