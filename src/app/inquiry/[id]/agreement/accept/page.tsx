"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";

export default function AcceptPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading } = useAuth();

  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agreement = mockHandoverAgreements.find(
    (a) => a.inquiryId === inquiryId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleAccept = async () => {
    if (!isAccepted) return;

    setIsSubmitting(true);
    // TODO: API call to record acceptance
    setTimeout(() => {
      router.push(`/inquiry/${inquiryId}/agreement/sign`);
    }, 500);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Agreement not found</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/inquiry/${inquiryId}/agreement`}
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Review
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              Accept Handover Terms
            </h1>
            <p className="mt-2 text-muted-foreground">
              Accept the following handover terms
            </p>
          </div>

          {/* Summary */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">
              {agreement.propertyTitle}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Handover Fee</span>
                <span className="font-medium">
                  ¥{agreement.adjustedHandoverFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Items Included</span>
                <span className="font-medium">{includedItems.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous Resident</span>
                <span className="font-medium">{agreement.sellerName}</span>
              </div>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="mb-8">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
              <button
                type="button"
                onClick={() => setIsAccepted(!isAccepted)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isAccepted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                }`}
              >
                {isAccepted && <Check className="h-3 w-3" />}
              </button>
              <span className="text-sm text-foreground">
                I have reviewed and accept the above handover terms.
                After acceptance, you will proceed to sign the handover agreement.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={`/inquiry/${inquiryId}/agreement`}>Back</Link>
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!isAccepted || isSubmitting}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  Accept and Sign
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
