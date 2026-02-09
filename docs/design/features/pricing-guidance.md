# T-6: 値付けガイダンス実装

> 技術決定: **クライアントサイド計算** — FurnitureItemのnewPrice・yearsUsedから減価テーブルで目安レンジを算出。バックエンド不要

関連機能: F-XXX(§7.10)

座談会#9で決定。クライアントサイドのみで完結。

---

## アーキテクチャ

```
[出品フォーム]
  → FurnitureItemのcategory選択 → デフォルトnewPriceを自動セット
  → yearsUsed入力 → 減価テーブルで目安レンジ計算
  → 「参考値: ¥XX,XXX 〜 ¥YY,YYY」を表示

[物件詳細ページ]
  → 各FurnitureItemのnewPrice合計 → 「新品で揃えた場合: 約○万円」
  → handoverFee / newPrice合計 → 「新品の○%の価格で引き継ぎ」
```

## 実装メモ

- 減価テーブル（[data-model.md §7.10.1](../requirements/data-model.md#7101-減価目安レンジ)）はconstオブジェクトで定義: `src/lib/pricing.ts`
- カテゴリ別デフォルト新品価格もconstオブジェクトで定義（同ファイル）
- UIコンポーネント: `src/components/listing/pricing-guidance.tsx`
- バックエンド不要（計算はすべてクライアント）
