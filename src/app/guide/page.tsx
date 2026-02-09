'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import {
  Camera,
  FileText,
  Building2,
  Eye,
  Handshake,
  ClipboardCheck,
  Sparkles,
  Key,
  Home,
  Search,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const sellerSteps = [
  {
    icon: Camera,
    title: '家具を登録',
    description: '残したい家具の写真と状態を登録します。',
    duration: '約15分',
  },
  {
    icon: FileText,
    title: '管理会社に相談',
    description: 'tsumugiが資料を作成し、管理会社に送付します。',
    duration: '1〜2日',
  },
  {
    icon: Building2,
    title: 'オーナー承認',
    description:
      '管理会社経由でオーナーの承認を得ます。tsumugiが説明資料を作成するので、手間はかかりません。',
    duration: '3〜5日',
  },
  {
    icon: Eye,
    title: '内見・確認',
    description: '次の住人が家具の状態を確認します。',
    duration: '日程調整次第',
  },
  {
    icon: Handshake,
    title: '合意・契約',
    description: '引き継ぎ条件に合意し、同意書に署名します。',
    duration: '1日',
  },
  {
    icon: ClipboardCheck,
    title: '引き渡し準備',
    description: '退去日までに家具の最終確認を行います。',
    duration: '退去前',
  },
  {
    icon: Sparkles,
    title: 'クリーニング',
    description: '退去後にクリーニングを実施します。',
    duration: '1〜2日',
  },
  {
    icon: Key,
    title: '鍵の引き渡し',
    description: '管理会社を通じて鍵を引き渡します。',
    duration: '1日',
  },
  {
    icon: CreditCard,
    title: '決済完了',
    description: 'エスクローから引越し費用が支払われます。',
    duration: '入居後3日以内',
  },
];

const buyerSteps = [
  {
    icon: Search,
    title: '物件を探す',
    description: 'tsumugiで家具付き物件を探します。',
    duration: '自由',
  },
  {
    icon: MessageCircle,
    title: '問い合わせ',
    description: '気になる物件について問い合わせます。',
    duration: '即日',
  },
  {
    icon: Eye,
    title: '内見',
    description: '物件と家具の状態を実際に確認します。',
    duration: '日程調整次第',
  },
  {
    icon: Handshake,
    title: '合意・契約',
    description: '引き継ぎ条件に合意し、同意書に署名します。',
    duration: '1日',
  },
  {
    icon: CreditCard,
    title: '引越し費用の支払い',
    description: 'エスクローに引越し費用を預けます。安全に保管されます。',
    duration: '即日',
  },
  {
    icon: ShieldCheck,
    title: '入居前確認',
    description: 'クリーニング完了後、最終状態を確認します。',
    duration: 'クリーニング後',
  },
  {
    icon: Key,
    title: '鍵の受け取り',
    description: '管理会社から鍵を受け取ります。',
    duration: '入居日',
  },
  {
    icon: Home,
    title: '入居開始',
    description: '家具付きの新しい暮らしがスタートします。',
    duration: '入居日',
  },
  {
    icon: ClipboardCheck,
    title: '確認・決済完了',
    description: '問題なければエスクローから前の住人に支払われます。',
    duration: '入居後3日以内',
  },
];

type TabType = 'seller' | 'buyer';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<TabType>('seller');

  const steps = activeTab === 'seller' ? sellerSteps : buyerSteps;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-coral-50 to-white py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              使い方ガイド
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              tsumugiでの家具引き継ぎの流れを、前の住人・次の住人それぞれの視点で
              ステップごとにご説明します。
            </p>
          </div>
        </section>

        {/* Tab Switcher */}
        <section className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('seller')}
                className={`rounded-md px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'seller'
                    ? 'bg-white text-[#FF5A5F] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                前の住人向け
              </button>
              <button
                onClick={() => setActiveTab('buyer')}
                className={`rounded-md px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'buyer'
                    ? 'bg-white text-[#FF5A5F] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                次の住人向け
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={`${activeTab}-${index}`}
                  className="relative flex gap-6"
                >
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF5A5F] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="my-1 h-full w-0.5 bg-gray-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#FF5A5F]">
                        STEP {index + 1}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                        {step.duration}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cost Explanation */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              費用の仕組み
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">引越し費用</h3>
                <p className="text-sm text-gray-600">
                  次の住人が前の住人に支払う家具の引き継ぎ費用です。金額は家具の内容に応じて設定されます。
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  エスクロー決済
                </h3>
                <p className="text-sm text-gray-600">
                  支払いはエスクローで安全に管理。入居後に問題がなければ前の住人に支払われます。
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  クリーニング費用
                </h3>
                <p className="text-sm text-gray-600">
                  退去後のクリーニング費用は引越し費用に含まれます。追加費用の心配はありません。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="py-12">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              よくある質問
            </h2>
            <p className="mb-6 text-gray-600">
              その他のご質問は、FAQページをご覧ください。
            </p>
            <a
              href="/help/emergency-options"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF5A5F] px-6 py-3 font-medium text-white transition-colors hover:bg-[#e54e52]"
            >
              ヘルプセンターへ
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
