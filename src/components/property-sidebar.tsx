'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomSignupDialog } from '@/components/auth/custom-signup-dialog';
import type { Property, User } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface PropertySidebarProps {
  property: Property;
}

export function PropertySidebar({ property }: PropertySidebarProps) {
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const router = useRouter();
  const { user, login } = useAuth();

  const handleInquiryClick = () => {
    if (!user) {
      setShowSignupDialog(true);
    } else {
      router.push(`/listings/${property.id}/inquiry`);
    }
  };

  const handleSignupComplete = (newUser: User) => {
    login(newUser);
    setShowSignupDialog(false);
    router.push(`/listings/${property.id}/inquiry`);
  };

  return (
    <>
      <div className="sticky top-24">
        <div className="rounded-xl border border-border bg-background p-6 shadow-lg">
          {/* 引き継ぎ費用 */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">引き継ぎ費用</p>
            <span className="text-3xl font-semibold text-foreground">
              ¥{property.handoverFee.toLocaleString()}
            </span>
          </div>

          {/* 家賃 */}
          {property.rent && (
            <div className="mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">家賃</span>
                <span className="text-lg font-semibold text-foreground">
                  ¥{property.rent.toLocaleString()}/月
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                敷金・礼金・管理費は大家さんとの契約内容によります
              </p>
            </div>
          )}

          <Button
            onClick={handleInquiryClick}
            className="w-full rounded-lg bg-gradient-to-r from-[#FF385C] to-[#E61E4D] py-6 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            この暮らしを引き継ぐ
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            まずは内見から始めましょう
          </p>
        </div>
      </div>

      {/* Signup Dialog */}
      <CustomSignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        onSignupComplete={handleSignupComplete}
      />
    </>
  );
}
