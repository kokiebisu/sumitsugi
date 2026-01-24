# tsumugi Memory Bank

> クリエイターの暮らしを引き継ぐプラットフォーム

## Quick Reference

**プロジェクト:** tsumugi（つむぎ）
**技術スタック:** Next.js 16 (App Router) / TypeScript / Tailwind CSS / shadcn/ui
**ノードバージョン:** 20
**パッケージマネージャー:** npm

## Commands

```bash
npm run dev     # 開発サーバー起動 (localhost:3000)
npm run build   # プロダクションビルド
npm run start   # プロダクションサーバー起動
npm run lint    # ESLintでコードチェック
```

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # ホームページ
│   ├── layout.tsx        # ルートレイアウト
│   ├── properties/       # 物件一覧・詳細
│   ├── listing/          # クリエイター向けリスティング管理
│   ├── admin/            # 管理画面
│   ├── account/          # ユーザーアカウント
│   └── creator/          # クリエイタープロフィール
├── components/           # Reactコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── admin/            # 管理画面用
│   ├── auth/             # 認証関連
│   └── listing/          # リスティング作成フロー
├── contexts/             # Reactコンテキスト
│   └── auth-context.tsx  # 認証状態管理
└── lib/                  # ユーティリティ・データ層
    ├── data.ts           # 物件データ、型定義
    ├── utils.ts          # ユーティリティ関数
    └── site-config.ts    # サイト設定
```

## Key Concepts

### 用語ガイドライン（重要）

**UIで使う用語：**
- ❌ ホスト → ✅ **クリエイター**
- ❌ インテリア利用料 → ✅ **インテリア購入料**
- ❌ ホスティング歴 → ✅ **活動歴**
- ❌ スーパーホスト → ✅ **スーパークリエイター**

**注意:** データ構造のフィールド名（`host`, `yearsHosting`など）は変更しない

### 物件ステータス

```typescript
status: "draft" | "public"
```

- `draft`: 下書き状態、一覧には非表示
- `public`: 公開状態、誰でも閲覧可能

### 料金構造

```typescript
// 初期費用合計 = インテリア購入料 + 敷金 + 礼金 + 保証会社利用料 + クリーニング代
// ※月額家賃・管理費は含まない

interface Fees {
  interiorFee: number;    // インテリア購入料
  deposit: number;        // 敷金
  keyMoney: number;       // 礼金
  guaranteeFee: number;   // 保証会社利用料
  cleaningFee: number;    // クリーニング代
  monthlyRent: number;    // 月額家賃
  managementFee: number;  // 管理費
}
```

### インテリアスタイル

- `bohemian` - ボヘミアン
- `industrial` - インダストリアル
- `minimal` - ミニマル
- `vintage` - ヴィンテージ
- `modern` - モダン
- `scandinavian` - スカンジナビアン

## Design Guidelines

- **テーマ:** Airbnb風のクリーンなUI
- **アクセントカラー:** コーラル色 `#FF5A5F`
- **アイコン:** Lucide React
- **UIコンポーネント:** shadcn/ui (Radix UIベース)
- **ダークモード:** classベース

## Key Files

| ファイル | 説明 |
|---------|------|
| `src/lib/data.ts` | Property, User, HostProfile などの型定義とモックデータ |
| `src/contexts/auth-context.tsx` | 認証状態管理（localStorage永続化） |
| `src/components/header.tsx` | グローバルヘッダー |
| `src/components/property-card.tsx` | 物件カードコンポーネント |

## Import Aliases

```typescript
import { something } from "@/lib/utils"   // → src/lib/utils
import { Button } from "@/components/ui/button"
```

## Related Documentation

詳細な仕様については以下を参照：

- `.claude/PROJECT.md` - プロジェクト仕様書（コンセプト、デザイン原則）
- `.claude/BUSINESS.md` - ビジネスロジック仕様書（料金体系、引き継ぎフロー）

## Current Phase

**フェーズ1（現在）:** 物件情報の表示、基本的な引き継ぎフロー

**次期開発予定（フェーズ2）:**
- ユーザー登録・ログイン機能
- メッセージング機能
- 決済機能統合
- 電子契約書機能
