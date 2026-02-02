import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { InquiryForm } from '@/components/inquiry-form';
import { getPropertyById, getPublicProperties } from '@/lib/data';
import { ArrowLeft, Info } from 'lucide-react';

interface InquiryPageProps {
  params: Promise<{ id: string }>;
}

// Disable static generation for this page since it uses client components with auth context
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const properties = getPublicProperties();
  return properties.map((property) => ({
    id: property.id,
  }));
}

export async function generateMetadata({ params }: InquiryPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) return { title: '物件が見つかりません' };

  return {
    title: `お問い合わせ - ${property.title} | くらしの引き継ぎ`,
    description: `「${property.title}」へのお問い合わせフォーム`,
  };
}

export default async function InquiryPage({ params }: InquiryPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property || property.status !== 'public') {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Back Link */}
          <Link
            href={`/listings/${property.id}`}
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            物件詳細に戻る
          </Link>

          {/* Property Summary Card */}
          <div className="mb-8 flex gap-4 rounded-xl border border-border bg-background p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <img
                src={property.images[0] || '/placeholder.svg'}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">お問い合わせ対象</p>
              <h2 className="font-medium text-foreground line-clamp-2">
                {property.title}
              </h2>
            </div>
          </div>

          {/* Form Section */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:p-8">
            <h1 className="mb-2 text-xl font-semibold text-foreground md:text-2xl">
              この暮らしに興味がある
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              ご記入いただいた内容をもとに、運営者から個別にご連絡いたします。
              <br />
              条件を確定するものではありませんので、お気軽にお問い合わせください。
            </p>

            <InquiryForm property={property} />
          </div>

          {/* Bottom Notice */}
          <div className="mt-6 flex gap-3 rounded-lg bg-warm-gray-50 p-4">
            <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="text-xs leading-relaxed text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">
                このフォームの目的
              </p>
              <p>
                マッチングを行うものではありません。「こういう暮らしを探していた」という方との対話を始めるきっかけとして活用します。
                お返事には数日いただく場合があります。
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
