# ユーザー種別

> 旧 REQUIREMENTS.md §4 | Feature IDs: — | DESIGN_DOC参照: T-4 | 最終更新: 2026-02-07

---

## ユーザーモデル（Airbnb風）

全ユーザーは入居希望者として登録し、暮らしを譲る側の登録で`isSeller=true`に切り替わる統一モデル。

**User（基本属性）**:

- id: UUID形式
- email: メールアドレス
- name: 氏名
- phone: 電話番号
- avatarUrl: プロフィール画像URL（任意）
- createdAt: 作成日時
- authProvider: 認証プロバイダー（email/google/facebook/apple）
- emailVerified: メール確認済みフラグ
- isSeller: セラーフラグ
- sellerProfile: セラープロフィール（isSeller=trueの場合のみ）

## 前の住人（Seller）

セラー登録済みのユーザー（`isSeller=true`）。自分の物件をリスティングできる。

**重要:** セラー登録済みのユーザーも、他の物件では次の住人として暮らしを引き継ぐことができる。「前の住人」「次の住人」はロールであり、ユーザーの固定的な分類ではない。

**SellerProfile（前の住人プロフィール）**:

- occupation: 職業
- bio: 自己紹介
- socialLinks: SNSリンク（Instagram, Twitter, YouTube, TikTok, Website）
- yearsSelling: 活動歴（年数）
- sellerSince: セラー登録日

**Phase 2以降で実装予定:**

- rating: 評価（1-5）
- reviewCount: レビュー数

## 次の住人

暮らしを引き継ぐ側のユーザー。**すべてのユーザー**（`isSeller`の値に関わらず）が次の住人として物件に問い合わせできる。セラー登録済みのユーザーも、自身が登録した物件以外では次の住人として活動できる。
