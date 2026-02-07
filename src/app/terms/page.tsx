'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site-config';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-muted-foreground">最終更新日: 2026年1月24日</p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第1条（適用）</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                本規約は、{siteConfig.company.name}
                （以下「当社」）が提供するサービス「{siteConfig.name}
                」（以下「本サービス」）の利用に関する条件を定めるものです。
              </li>
              <li>
                ユーザーは、本規約に同意した上で本サービスを利用するものとします。
              </li>
              <li>
                本サービスを利用した時点で、ユーザーは本規約に同意したものとみなします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">第2条（定義）</h2>
            <p className="text-muted-foreground mb-4">
              本規約において使用する用語の定義は以下の通りとします。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>「本サービス」</strong>
                とは、前の住人が作り上げた暮らし（家具・インテリアを含む居住空間）を次の住人へ引き継ぐためのマッチングプラットフォームを指します。
              </li>
              <li>
                <strong>「ユーザー」</strong>
                とは、本サービスを利用するすべての方を指します。
              </li>
              <li>
                <strong>「前の住人」</strong>
                とは、本サービスにおいて自身の居住空間を出品する方を指します。
              </li>
              <li>
                <strong>「引き継ぎ希望者」</strong>
                とは、本サービスにおいて前の住人の居住空間の引き継ぎを希望する方を指します。
              </li>
              <li>
                <strong>「物品」</strong>
                とは、引き継ぎの対象となる家具、家電、インテリア等を指します。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第3条（アカウント登録）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                本サービスの一部機能を利用するためには、アカウント登録が必要です。
              </li>
              <li>
                登録にあたり、正確かつ最新の情報を提供していただく必要があります。
              </li>
              <li>
                アカウント情報の管理はユーザー自身の責任で行うものとし、第三者への譲渡・貸与は禁止します。
              </li>
              <li>
                当社は、以下の場合にアカウント登録を拒否、または登録済みアカウントを停止・削除できるものとします。
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>虚偽の情報を登録した場合</li>
                  <li>本規約に違反した場合</li>
                  <li>その他、当社が不適切と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第4条（本サービスの内容）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                本サービスは、前の住人と引き継ぎ希望者のマッチングの場を提供するものです。
              </li>
              <li>
                当社は、ユーザー間の取引の当事者とはならず、取引に関する交渉、契約締結、履行等はユーザー間で直接行うものとします。
              </li>
              <li>
                物件の賃貸借契約は、ユーザーと物件の所有者（大家）との間で締結されるものであり、当社は契約当事者ではありません。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第5条（前の住人の責任）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                前の住人は、出品にあたり以下の事項を遵守するものとします。
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    物件の所有者（大家）に対し、本サービスを通じた引き継ぎについて事前に説明し、承諾を得ること
                  </li>
                  <li>
                    出品する物品について、正確な情報（製造年、使用年数、動作状況、不具合の有無等）を記載すること
                  </li>
                  <li>
                    引き継ぎ対象の物品が自身の所有物であること、または正当な処分権限を有すること
                  </li>
                </ul>
              </li>
              <li>
                前の住人は、出品する物品の安全性について責任を負うものとします。
              </li>
              <li>
                以下の物品の出品は禁止します。
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>リコール対象製品</li>
                  <li>法令により所持・譲渡が禁止されている物品</li>
                  <li>盗品その他権利を侵害する物品</li>
                  <li>著しく劣化・破損しており安全性に問題がある物品</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第6条（引き継ぎ希望者の責任）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                引き継ぎ希望者は、引き継ぎを受ける物品について、内見時に十分な確認を行うものとします。
              </li>
              <li>
                引き継ぎ後の物品の管理・使用は、引き継ぎ希望者の責任において行うものとします。
              </li>
              <li>
                引き継ぎ希望者は、物件の所有者（大家）との賃貸借契約を自身の責任において締結するものとします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第7条（物品に関する免責）
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 font-medium">
                重要：以下の免責事項をよくお読みください
              </p>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                当社は、本サービスを通じて引き継がれる物品の品質、安全性、適法性、正確性等について一切保証しません。
              </li>
              <li>
                引き継いだ物品に起因する故障、事故、損害（火災、電気事故、怪我等を含むがこれに限らない）について、当社は一切の責任を負いません。
              </li>
              <li>
                中古の家電製品等には、経年劣化や予期せぬ故障のリスクがあることをユーザーは理解し、自己の責任において使用するものとします。
              </li>
              <li>
                ユーザー間の取引に関するトラブル（物品の状態に関する認識の相違、代金の支払い等）について、当社は一切の責任を負わず、ユーザー間で解決するものとします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第8条（禁止事項）
            </h2>
            <p className="text-muted-foreground mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>虚偽の情報を登録・掲載する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセス、なりすまし等の行為</li>
              <li>
                本サービスを通じて取得した情報を本サービスの目的以外に使用する行為
              </li>
              <li>反社会的勢力に対する利益供与その他の協力行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第9条（サービスの変更・停止）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                当社は、ユーザーへの事前の通知なく、本サービスの内容を変更、または本サービスの提供を停止・終了することができるものとします。
              </li>
              <li>
                当社は、本サービスの変更、停止、終了によりユーザーに生じた損害について一切の責任を負いません。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第10条（知的財産権）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                本サービスに関する知的財産権は、当社または正当な権利者に帰属します。
              </li>
              <li>
                ユーザーが本サービスに投稿したコンテンツ（写真、文章等）の著作権はユーザーに帰属しますが、当社は本サービスの運営・改善・宣伝のために当該コンテンツを無償で使用できるものとします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第11条（個人情報の取り扱い）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                当社は、本サービスの提供にあたり取得する個人情報を、別途定めるプライバシーポリシーに従い適切に取り扱います。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第12条（規約の変更）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                当社は、必要と判断した場合には、ユーザーへの事前の通知なく本規約を変更できるものとします。
              </li>
              <li>
                変更後の規約は、本サービス上に掲載した時点で効力を生じるものとします。
              </li>
              <li>
                規約変更後に本サービスを利用した場合、ユーザーは変更後の規約に同意したものとみなします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              第13条（準拠法・管轄）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>
                本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄とします。
              </li>
            </ol>
          </section>

          <section className="border-t pt-8 mt-12">
            <p className="text-muted-foreground">
              {siteConfig.company.name}
              <br />
              所在地: {siteConfig.company.address}
              <br />
              お問い合わせ: {siteConfig.company.email}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
