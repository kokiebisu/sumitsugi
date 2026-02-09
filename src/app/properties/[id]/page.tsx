import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getPropertyById } from '@/lib/data';
import { formatDateJa } from '@/lib/format';

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            物件一覧に戻る
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            {property.title}
          </h1>

          {property.location?.neighborhood && (
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <MapPin className="w-4 h-4" />
              <span>{property.location.neighborhood}</span>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Property Info */}
            <div className="space-y-4">
              {property.handoverFee > 0 && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">引越し費用</p>
                  <p className="text-2xl font-bold">
                    {property.handoverFee.toLocaleString()}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      円
                    </span>
                  </p>
                </div>
              )}

              {property.moveOutDate && (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">退去予定日</p>
                  </div>
                  <p className="text-lg font-medium">
                    {formatDateJa(property.moveOutDate)}
                  </p>
                </div>
              )}

              {property.layout && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">間取り</p>
                  <p className="text-lg font-medium">{property.layout}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
