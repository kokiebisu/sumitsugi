import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | sumitsugi',
  description: 'sumitsugiのプライバシーポリシー - 個人情報の取り扱いについて',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-foreground">
        プライバシーポリシー
      </h1>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <p className="text-foreground">
          sumitsugi運営事務局（以下「当社」）は、本サービス「sumitsugi」（以下「本サービス」）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
        </p>

        {/* 1. 事業者情報 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            1. 事業者情報
          </h2>
          <div className="space-y-2">
            <p>
              <strong>事業者名:</strong> sumitsugi運営事務局
            </p>
            <p>
              <strong>代表者:</strong> （準備中）
            </p>
            <p>
              <strong>所在地:</strong> 〒000-0000 東京都（準備中）
            </p>
            <p>
              <strong>お問い合わせ:</strong>{' '}
              <a
                href="mailto:privacy@sumitsugi.example.com"
                className="text-primary hover:underline"
              >
                privacy@sumitsugi.example.com
              </a>
            </p>
          </div>
        </section>

        {/* 2. 収集する個人情報 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            2. 収集する個人情報
          </h2>
          <p className="mb-3">本サービスでは、以下の個人情報を収集します。</p>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">
                2.1 アカウント登録時
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>氏名</li>
                <li>メールアドレス</li>
                <li>電話番号（任意）</li>
                <li>プロフィール画像（任意）</li>
                <li>認証プロバイダー情報（Google、Appleなど）</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">
                2.2 リスティング作成時（前の住人として登録する場合）
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>職業</li>
                <li>自己紹介文</li>
                <li>SNSアカウント（任意）</li>
                <li>物件情報（住所、間取り、家賃など）</li>
                <li>物件写真</li>
                <li>家具・設備に関する情報</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">
                2.3 問い合わせ・申し込み時
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>氏名</li>
                <li>メールアドレス</li>
                <li>興味を持った理由、質問内容</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">
                2.4 自動的に収集される情報
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>IPアドレス</li>
                <li>ブラウザの種類・バージョン</li>
                <li>アクセス日時</li>
                <li>リファラ情報</li>
                <li>Cookie情報</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 利用目的 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            3. 利用目的
          </h2>
          <p className="mb-3">収集した個人情報は、以下の目的で利用します。</p>
          <ul className="list-inside list-disc space-y-2 pl-4">
            <li>本サービスの提供、運営、維持、保護および改善のため</li>
            <li>ユーザー認証、本人確認のため</li>
            <li>
              物件リスティングの掲載および、前の住人と次の住人のマッチングのため
            </li>
            <li>
              問い合わせへの対応、カスタマーサポート、重要な通知の送信のため
            </li>
            <li>利用規約違反、不正利用の防止および対応のため</li>
            <li>
              サービス利用状況の分析、統計データの作成（個人を特定できない形式）のため
            </li>
            <li>
              新機能、キャンペーン、イベントに関する情報提供のため（オプトアウト可能）
            </li>
            <li>法令に基づく対応のため</li>
          </ul>
        </section>

        {/* 4. 第三者提供 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            4. 第三者への提供
          </h2>
          <p className="mb-3">
            当社は、以下の場合を除き、ユーザーの同意なく第三者に個人情報を提供しません。
          </p>
          <ul className="list-inside list-disc space-y-2 pl-4">
            <li>法令に基づく場合</li>
            <li>
              人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
            </li>
            <li>
              公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
            </li>
            <li>
              国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
            </li>
          </ul>
        </section>

        {/* 5. 委託先・外部サービス */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            5. 委託先および外部サービス
          </h2>
          <p className="mb-3">
            本サービスの提供にあたり、以下の外部サービスを利用しています。これらのサービスには、サービス提供に必要な範囲で個人情報が共有される場合があります。
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="mb-1 font-semibold text-foreground">認証</h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>
                  Google OAuth（
                  <a
                    href="https://policies.google.com/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    プライバシーポリシー
                  </a>
                  ）
                </li>
                <li>
                  Apple Sign In（
                  <a
                    href="https://www.apple.com/legal/privacy/"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    プライバシーポリシー
                  </a>
                  ）
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">
                データベース
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>
                  Neon PostgreSQL（
                  <a
                    href="https://neon.tech/privacy-policy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    プライバシーポリシー
                  </a>
                  ）
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">
                画像ストレージ
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>
                  Amazon S3（
                  <a
                    href="https://aws.amazon.com/privacy/"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    プライバシーポリシー
                  </a>
                  ）
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">メール配信</h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>
                  Resend（
                  <a
                    href="https://resend.com/legal/privacy-policy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    プライバシーポリシー
                  </a>
                  ）
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Cookie・ローカルストレージ */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            6. CookieおよびローカルストレージUの使用
          </h2>
          <p className="mb-3">
            本サービスでは、ユーザー体験の向上とサービスの最適化のため、Cookieおよびブラウザのローカルストレージを使用します。
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="mb-1 font-semibold text-foreground">使用目的</h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>ログイン状態の維持</li>
                <li>ユーザー設定の保存</li>
                <li>セキュリティの確保</li>
                <li>サービス利用状況の分析</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">
                保存される情報
              </h3>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>ユーザー認証情報</li>
                <li>作成中のリスティング情報（下書き保存）</li>
                <li>問い合わせ履歴</li>
              </ul>
            </div>
            <p className="text-xs">
              ※
              ブラウザの設定によりCookieの使用を無効にすることができますが、一部機能が利用できなくなる場合があります。
            </p>
          </div>
        </section>

        {/* 7. 個人情報の保存期間 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            7. 個人情報の保存期間
          </h2>
          <p>
            個人情報は、利用目的を達成するために必要な期間に限り保存します。アカウント削除を希望される場合は、速やかに個人情報を削除いたします。ただし、法令により保存が義務付けられている場合は、その期間保存します。
          </p>
        </section>

        {/* 8. セキュリティ */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            8. セキュリティ対策
          </h2>
          <p>
            当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のため、以下の対策を講じています。
          </p>
          <ul className="list-inside list-disc space-y-2 pl-4">
            <li>SSL/TLS暗号化通信の使用</li>
            <li>アクセス制御および認証システムの導入</li>
            <li>定期的なセキュリティ監査</li>
            <li>従業員への教育・研修</li>
          </ul>
        </section>

        {/* 9. 個人情報の開示・訂正・削除 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            9. 個人情報の開示・訂正・削除
          </h2>
          <p className="mb-3">
            ユーザーは、当社が保有する自己の個人情報について、以下の権利を有します。
          </p>
          <ul className="list-inside list-disc space-y-2 pl-4">
            <li>個人情報の開示請求</li>
            <li>個人情報の訂正・追加・削除請求</li>
            <li>個人情報の利用停止請求</li>
            <li>個人情報の第三者提供停止請求</li>
          </ul>
          <p className="mt-3">
            これらの請求を希望される場合は、本ポリシー記載のお問い合わせ先までご連絡ください。本人確認の上、法令に基づき対応いたします。
          </p>
        </section>

        {/* 10. 未成年者の個人情報 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            10. 未成年者の個人情報
          </h2>
          <p>
            本サービスは、18歳未満の方のご利用を想定していません。18歳未満の方が本サービスを利用される場合は、保護者の同意を得た上でご利用ください。
          </p>
        </section>

        {/* 11. プライバシーポリシーの変更 */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            11. プライバシーポリシーの変更
          </h2>
          <p>
            当社は、法令の変更や本サービスの機能追加・変更等に伴い、本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。重要な変更がある場合は、本サービス上での通知またはメールにてお知らせします。
          </p>
        </section>

        {/* 12. お問い合わせ */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            12. お問い合わせ
          </h2>
          <p>本ポリシーに関するお問い合わせは、以下までご連絡ください。</p>
          <div className="mt-3 space-y-1">
            <p>
              <strong>メール:</strong>{' '}
              <a
                href="mailto:privacy@sumitsugi.example.com"
                className="text-primary hover:underline"
              >
                privacy@sumitsugi.example.com
              </a>
            </p>
          </div>
        </section>

        {/* 制定日 */}
        <div className="mt-12 border-t border-border pt-6 text-right text-xs">
          <p>制定日：2026年1月25日</p>
          <p>最終更新日：2026年1月25日</p>
        </div>
      </div>
    </div>
  );
}
