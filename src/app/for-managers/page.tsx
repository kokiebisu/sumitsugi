'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import {
  Building2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  HelpCircle,
  Mail,
  Shield,
  Users,
} from 'lucide-react';
import { faqItems, roleSteps, featureCards } from './faq-data';
import type { FaqItem } from './faq-data';

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="pr-4 text-base font-medium text-gray-900">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-5 pr-12">
          <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

const featureIcons = [FileText, Shield, Users] as const;

const roleIcons = [ClipboardCheck, HelpCircle, Building2] as const;

export default function ForManagersPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-coral-50 to-white py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#FF5A5F] shadow-sm">
              <Building2 className="h-4 w-4" />
              管理会社様向け
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              tsumugiのご案内
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              家具の引き継ぎサービス「tsumugi」について、管理会社のスタッフの方向けによくあるご質問をまとめました。
            </p>
          </div>
        </section>

        {/* Overview Cards */}
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            tsumugiの特徴
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((card, index) => {
              const Icon = featureIcons[index];
              const colorClasses = [
                { bg: 'bg-blue-100', text: 'text-blue-600' },
                { bg: 'bg-green-100', text: 'text-green-600' },
                { bg: 'bg-purple-100', text: 'text-purple-600' },
              ][index];
              return (
                <div
                  key={card.title}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${colorClasses.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Process Overview */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              管理会社様の役割
            </h2>
            <div className="space-y-4">
              {roleSteps.map((item, index) => {
                const Icon = roleIcons[index];
                return (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 rounded-lg bg-white p-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF5A5F] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium text-[#FF5A5F]">
                        STEP {item.step}
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            よくあるご質問
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white px-6">
            {faqItems.map((item, index) => (
              <FaqAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              お問い合わせ
            </h2>
            <p className="mb-6 text-gray-600">
              ご不明な点やご質問がございましたら、お気軽にお問い合わせください。
            </p>
            <a
              href="mailto:info@tsumugi.com"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF5A5F] px-6 py-3 font-medium text-white transition-colors hover:bg-[#e54e52]"
            >
              <Mail className="h-4 w-4" />
              info@tsumugi.com
            </a>
            <p className="mt-4 text-sm text-gray-500">
              営業時間: 平日 10:00 - 18:00
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
