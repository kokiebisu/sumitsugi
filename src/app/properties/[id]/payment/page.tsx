import { notFound } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { getPropertyById } from '@/lib/data';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-16 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-2">決済機能</h1>
          <p className="text-muted-foreground mb-4">
            この機能は現在準備中です。
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            引き継ぎ費用のお支払い機能は近日公開予定です。
          </p>
          <Link href={`/properties/${id}`}>
            <Button variant="outline" className="rounded-lg">
              物件ページに戻る
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
