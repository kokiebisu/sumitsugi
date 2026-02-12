'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';
import {
  Clock,
  Truck,
  Recycle,
  HandHeart,
  Mail,
  AlertTriangle,
} from 'lucide-react';

const options = [
  {
    icon: HandHeart,
    title: '家具の寄付・譲渡',
    description:
      'NPOや支援団体を通じて、まだ使える家具を必要な方へ届けます。処分費用がかからない場合もあります。',
    timeline: '1〜2週間',
    cost: '無料〜',
  },
  {
    icon: Truck,
    title: '不用品回収業者への依頼',
    description:
      '回収業者が自宅まで引き取りに来てくれます。大型家具や家電もまとめて対応可能です。',
    timeline: '2〜5日',
    cost: '¥10,000〜',
  },
  {
    icon: Recycle,
    title: '自治体の粗大ごみ回収',
    description:
      'お住まいの自治体に粗大ごみとして申し込みます。費用は抑えられますが、予約が必要です。',
    timeline: '1〜3週間',
    cost: '¥200〜¥2,000/点',
  },
] as const;

const steps = [
  {
    number: 1,
    title: '状況を教えてください',
    description:
      '退去日、残している家具の種類・数量をフォームからお知らせください。',
  },
  {
    number: 2,
    title: 'スタッフが最適なプランをご提案',
    description:
      '状況に応じて、寄付・回収・自治体回収などの選択肢をご案内します。',
  },
  {
    number: 3,
    title: '手配・引き取り',
    description:
      '決定した方法で処分・引き取りを進めます。必要に応じて立会いのサポートも行います。',
  },
] as const;

export default function EmergencyOptionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50 to-white py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <AlertTriangle className="h-4 w-4" />
              退去まで時間がない方へ
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              緊急引き取り・処分のご案内
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              退去日が迫っている方のために、家具・家電の処分・引き取りオプションをご案内します。
              sumitsugiがお手伝いします。
            </p>
          </div>
        </section>

        {/* Options */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-semibold mb-8">
              処分・引き取りオプション
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {options.map((option) => (
                <div
                  key={option.title}
                  className="rounded-xl border border-border bg-background p-6 shadow-sm"
                >
                  <option.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>目安: {option.timeline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">費用:</span>
                      <span className="font-medium">{option.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-semibold mb-8">ご利用の流れ</h2>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / Inquiry */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-xl border border-border bg-background p-8 md:p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">
                お困りの方はご相談ください
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                退去日が迫っていて、家具の処分にお困りの方はお気軽にご連絡ください。
                状況に応じた最適なプランをご提案いたします。
              </p>
              <a
                href={`mailto:${siteConfig.company.email}?subject=緊急引き取り相談`}
                className="inline-flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-5 w-5" />
                メールで相談する
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-semibold mb-8">よくある質問</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">
                  Q. 退去まで数日しかありません。間に合いますか？
                </h3>
                <p className="text-muted-foreground">
                  不用品回収業者であれば最短翌日〜3日以内の対応が可能な場合もあります。
                  まずはご相談ください。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Q. 費用はどのくらいかかりますか？
                </h3>
                <p className="text-muted-foreground">
                  方法によって異なります。寄付であれば無料の場合もあり、
                  回収業者の場合は家具の量に応じて¥10,000〜¥50,000程度が目安です。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Q. まだ使える家具なのに処分するしかないですか？
                </h3>
                <p className="text-muted-foreground">
                  いいえ。sumitsugiでは引き続き次の住人をお探しすることも可能です。
                  また、寄付という選択肢もあります。状況に応じてご提案します。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
