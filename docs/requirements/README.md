# sumitsugi（すみつぎ） 要件定義書

**バージョン**: 3.0
**作成日**: 2026-01-24
**最終更新日**: 2026-02-07（モジュラー化: 単一ファイル → ディレクトリ構成に分割）
**ステータス**: 実験中

---

## 1. プロジェクト概要

### 1.1 プロジェクト名

**sumitsugi（住み継ぎ）**

### 1.2 コンセプト

暮らしを引き継ぐプラットフォーム

### 1.3 サービス概要

単なる物件のサブリースではなく、**家具・インテリア・ライフスタイルそのもの**を引き継ぐサービス。前の住人が築いた暮らしを次の住人へ繋ぐことで、空間の価値を最大化する。

### 1.4 ポジショニング（座談会#12で明確化）

| サービス           | 提供するもの                                           |
| ------------------ | ------------------------------------------------------ |
| レンタル家具       | パーツの一時貸し                                       |
| ホームステージング | 見せかけの空間演出                                     |
| **sumitsugi**      | **本物の暮らしの引き継ぎ（モノ＋世界観＋ストーリー）** |

暮らしの世界観は家具だけでは成立しない。床材・照明・植物・こだわりの道具——空間を構成する全ての要素が「本物の暮らし」を作る。sumitsugiはそれを丸ごと引き継ぐ唯一のプラットフォームを目指す。（長期ビジョンの詳細は [future.md](./future.md) 参照）

---

## 2. 目的と背景

### 2.1 課題

- 引越し時の家具・インテリアの処分問題
- 理想的な空間探しの難しさ
- 短期〜中期の住まい探しの選択肢の少なさ

### 2.2 解決策

- 家具・インテリア付きの物件をそのまま引き継げる仕組み
- 前の住人のライフスタイルを可視化し、マッチングを促進
- 1〜6ヶ月の短期〜中期契約に対応

### 2.3 目標

- 暮らしを引き継ぐ人同士のコミュニティ形成
- 持続可能な暮らしの提案
- 空間の価値の最大化

---

## ドキュメント構成

| ファイル                                       | 旧セクション | 内容                      |
| ---------------------------------------------- | ------------ | ------------------------- |
| **このファイル**                               | §1-2         | 概要・背景・目次          |
| [scope.md](./scope.md)                         | §3           | MVPスコープ・フェーズ定義 |
| [users.md](./users.md)                         | §4           | ユーザー種別              |
| [features/](./features/)                       | §5           | 機能要件（10ファイル）    |
| [screens.md](./screens.md)                     | §6           | 画面一覧                  |
| [data-model.md](./data-model.md)               | §7           | データモデル              |
| [non-functional.md](./non-functional.md)       | §8-9         | 非機能要件・技術スタック  |
| [design-guidelines.md](./design-guidelines.md) | §10          | デザインガイドライン      |
| [handover-flow.md](./handover-flow.md)         | §11          | 引き継ぎフロー            |
| [payment.md](./payment.md)                     | §12          | 決済システム              |
| [future.md](./future.md)                       | §13          | 今後の拡張予定            |
| [legal.md](./legal.md)                         | §14          | 法律対応                  |
| [glossary.md](./glossary.md)                   | §15          | 用語集                    |
| [open-items.md](./open-items.md)               | §16          | 未定義事項                |

### 機能要件ファイル一覧（features/）

| ファイル                                                    | 旧セクション | Feature IDs  | DESIGN_DOC参照 |
| ----------------------------------------------------------- | ------------ | ------------ | -------------- |
| [property-display.md](./features/property-display.md)       | §5.1         | F-001〜F-006 | —              |
| [property-management.md](./features/property-management.md) | §5.2         | F-101〜F-105 | T-4, T-6       |
| [inquiry.md](./features/inquiry.md)                         | §5.3         | F-201〜F-206 | T-2, T-3       |
| [auth.md](./features/auth.md)                               | §5.4         | F-301〜F-304 | —              |
| [account.md](./features/account.md)                         | §5.5         | F-401〜F-402 | —              |
| [move-out-safety.md](./features/move-out-safety.md)         | §5.6         | F-501〜F-511 | T-4            |
| [handover-visibility.md](./features/handover-visibility.md) | §5.7         | F-701〜F-713 | —              |
| [b2b.md](./features/b2b.md)                                 | §5.8         | F-601〜F-616 | T-1, T-2       |
| [viewing.md](./features/viewing.md)                         | §5.9         | F-801〜F-804 | T-5            |
| [coordinator.md](./features/coordinator.md)                 | §5.10        | F-901〜F-903 | —              |

---

## Feature ID クロスリファレンス

| Feature ID   | ファイル                                                             | 概要                 |
| ------------ | -------------------------------------------------------------------- | -------------------- |
| F-001〜F-006 | [features/property-display.md](./features/property-display.md)       | 物件表示             |
| F-101〜F-105 | [features/property-management.md](./features/property-management.md) | 物件登録・管理       |
| F-201〜F-206 | [features/inquiry.md](./features/inquiry.md)                         | 問い合わせ           |
| F-301〜F-304 | [features/auth.md](./features/auth.md)                               | 認証                 |
| F-401〜F-402 | [features/account.md](./features/account.md)                         | アカウント           |
| F-501〜F-511 | [features/move-out-safety.md](./features/move-out-safety.md)         | 緊急退去対策         |
| F-601〜F-616 | [features/b2b.md](./features/b2b.md)                                 | B2B連携              |
| F-701〜F-713 | [features/handover-visibility.md](./features/handover-visibility.md) | 引き継ぎフロー可視化 |
| F-801〜F-804 | [features/viewing.md](./features/viewing.md)                         | 内見負担軽減         |
| F-901〜F-903 | [features/coordinator.md](./features/coordinator.md)                 | コーディネーター連携 |

---

## 技術設計・実装ロードマップ

技術的な実装詳細（アーキテクチャ、DB設計、実装ロードマップ、既知の技術的負債等）は **[`docs/DESIGN_DOC.md`](../DESIGN_DOC.md)** を参照。

---

_旧ファイル `docs/REQUIREMENTS.md` から分割（技術ミーティング#12決定）_
