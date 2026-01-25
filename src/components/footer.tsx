export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-3">
          {/* Column 1: サポート */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              サポート
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/help" className="hover:underline">
                  ヘルプセンター
                </a>
              </li>
              <li>
                <a href="/safety" className="hover:underline">
                  安全上の問題に関してサポートを受ける
                </a>
              </li>
              <li>
                <a href="/cancellation" className="hover:underline">
                  キャンセルオプション
                </a>
              </li>
              <li>
                <a href="/report" className="hover:underline">
                  近隣トラブルを報告する
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: 引き継ぎ */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              引き継ぎ
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/list" className="hover:underline">
                  お部屋を掲載する
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:underline">
                  引き継ぎの仕組み
                </a>
              </li>
              <li>
                <a href="/seller-resources" className="hover:underline">
                  出品者向けリソース
                </a>
              </li>
              <li>
                <a href="/community" className="hover:underline">
                  コミュニティフォーラム
                </a>
              </li>
              <li>
                <a href="/handover-responsibly" className="hover:underline">
                  責任ある引き継ぎとは
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: tsumugi */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              tsumugi
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/about" className="hover:underline">
                  ニュースルーム
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:underline">
                  採用情報
                </a>
              </li>
              <li>
                <a href="/investors" className="hover:underline">
                  株主・投資家のみなさまへ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-8 text-xs text-muted-foreground">
          <span>&copy; 2026 tsumugi</span>
          <span className="hidden sm:inline">·</span>
          <a href="/privacy" className="hover:underline">
            プライバシー
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="/terms" className="hover:underline">
            利用規約
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="/sitemap" className="hover:underline">
            サイトマップ
          </a>
          <span className="hidden sm:inline">·</span>
          <a href="/company" className="hover:underline">
            企業情報
          </a>
        </div>
      </div>
    </footer>
  );
}
