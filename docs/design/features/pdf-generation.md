# T-1: PDF自動生成アーキテクチャ

> 技術決定: **`@react-pdf/renderer`** — サーバーサイド`renderToBuffer()` + R2保存。日本語フォント: Noto Sans JP

関連機能: F-611, F-612, F-616

---

## アーキテクチャ

```
[リスティングデータ]
  → API Route (POST /api/pdf/generate)
  → @react-pdf/renderer (サーバーサイド renderToBuffer())
  → PDFバイナリ生成
  → R2にアップロード（永続保存）
  → URLをPropertyレコードに保存
```

## 実装詳細

**テンプレート配置:** `src/lib/pdf/templates/` に F-611・F-612 それぞれ別テンプレート（F-616はPost-MVP）

**日本語フォント:** Noto Sans JP（public/fonts/ に配置 or CDN動的ロード）

**実装優先順位:** F-611（Phase 2）→ F-612（Phase 3）。F-616はPost-MVP（座談会#11: コンシェルジュ型MVPでは管理会社経由で伝達）

## PDF品質要件（座談会#5）

- 結論ファースト構成（アクション手順→概要→家具リスト→メリット→リスク対応→FAQ）
- A4 3枚以内
- sumitsugiブランディング控えめ
- メール送付テンプレートも付随提供
- 詳細は[座談会#5議事録](../../requirements/meetings/2026-02-07-product-meeting-5-pdf-templates.md)
