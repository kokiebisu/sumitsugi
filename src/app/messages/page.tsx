import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-16 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            メッセージ機能
          </h1>
          <p className="text-muted-foreground mb-4">
            この機能は現在準備中です。
          </p>
          <p className="text-sm text-muted-foreground">
            内見の日程調整やお問い合わせは、物件ページの問い合わせフォームをご利用ください。
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
