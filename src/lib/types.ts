// Amenity (アメニティ) データ型
export interface Amenity {
  type: string // "coffee", "records", "dj", etc.
  details?: string // 機種名や詳細情報
}

// HandoverProfile (引き継ぎ側プロフィール) データ型
export interface HandoverProfile {
  occupation: string
  bio: string
  socialLinks?: {
    instagram?: string
    twitter?: string
    website?: string
    youtube?: string
    tiktok?: string
  }
  sellerSince: string // ISO日付文字列
}

// SellerProfile (後方互換性のためのエイリアス)
export type SellerProfile = HandoverProfile

// User (ユーザー) データ型
// Airbnb風: 全ユーザーは入居希望者、ホスト登録でisSeller=trueに
export interface User {
  id: string // UUID形式
  email: string
  name: string
  phone?: string
  avatarUrl?: string
  createdAt: string // ISO日付文字列

  // 認証メタ情報
  authProvider?: "email" | "google" | "facebook" | "apple"
  emailVerified?: boolean

  // ロールフラグ（Airbnb風）
  isSeller: boolean
  isAdmin?: boolean

  // ホストプロフィール（isSeller=trueの場合のみ）
  sellerProfile?: SellerProfile
}

// 内見確認情報
export interface ViewingConfirmation {
  hostConfirmed: boolean
  hostConfirmedAt?: string
  applicantConfirmed: boolean
  applicantConfirmedAt?: string
}

// Inquiry (引き継ぎ申し込み) データ型
export interface Inquiry {
  id: string
  propertyId: string
  propertyTitle: string
  status: "pending" | "reviewing" | "approved" | "viewing_scheduled" | "contract_in_progress" | "completed" | "rejected" | "cancelled"
  applicantName: string
  applicantEmail: string
  reason: string // 興味を持った理由
  questions?: string // 質問
  submittedAt: string
  updatedAt: string
  notes?: string // 運営メモ
  viewingConfirmation?: ViewingConfirmation // 内見確認状態
}

// Seller Listing (物件掲載申込) データ型
export interface SellerListing {
  id: string
  status: "pending" | "approved" | "published" | "rejected"
  sellerName: string
  sellerEmail: string
  sellerPhone: string
  propertyAddress: string
  handoverFee?: number // 引き継ぎ費用
  moveOutDate: string
  furnitureDescription: string
  whyListing: string
  landlordConsent: LandlordConsent
  submittedAt: string
  updatedAt: string
  notes?: string // 運営メモ
  publishedPropertyId?: string // 公開された物件ID
}

// 引き継ぎ対象の大型家具
export type LargeFurnitureType = "bed" | "sofa" | "desk" | "table" | "storage" | "dining" | "wardrobe" | "tv" | "fridge"

// 家具アイテム（写真付き）
export interface FurnitureItem {
  type: LargeFurnitureType
  photos: string[] // 家具の写真URL（最大3枚）
  condition?: "excellent" | "good" | "fair" // 状態
  notes?: string // 備考
}

// 引き継ぎ対象の大型家電
export type LargeApplianceType = "washer" | "dryer" | "ac" | "microwave" | "dishwasher"

// 大家承諾情報
export interface LandlordConsent {
  hasLandlordConsent: boolean
}

// 責任区分条件
export interface LiabilityTerms {
  isPrivateTransfer: boolean
  noLandlordWarranty: boolean
  selfResponsibility: boolean
}

// User Listing (ユーザーが作成した部屋) データ型
export interface UserListing {
  id: string
  userId: string
  status: "draft" | "published"
  title: string
  roomStyle: string | null
  roomPhotos: string[]
  handoverFee?: number // 引き継ぎ費用
  rent?: number // 家賃
  managementFee?: number // 管理費
  area?: string // エリア
  layout?: string // 間取り
  occupants?: number // 居住人数
  viewingAvailableFrom?: string // 内見可能日
  moveInAvailableFrom?: string // 引き継ぎ可能日
  stations?: { name: string; walkingMinutes: number }[] // 最寄り駅（複数）
  createdAt: string
  updatedAt: string
  publishedAt?: string
  furniture?: LargeFurnitureType[] // 大型家具（旧形式、互換性のため）
  furnitureItems?: FurnitureItem[] // 家具アイテム（写真付き）
  story?: string
  landlordConsent?: LandlordConsent // 大家承諾
  liabilityTerms?: LiabilityTerms // 責任区分
}

// Property (物件) データ型
export interface Property {
  id: string
  title: string // 一言コピー
  images: string[]
  handoverFee: number // 引き継ぎ費用
  rent?: number // 家賃（月額）
  managementFee?: number // 管理費（月額）
  deposit?: number // 敷金（月数）
  keyMoney?: number // 礼金（月数）
  area: string // エリア
  location?: {
    lat: number // 緯度
    lng: number // 経度
    neighborhood?: string // 町名（例：目黒区中目黒）
  }
  layout?: string // 間取り
  occupancy?: number // 居住人数
  style?: string // e.g., "scandinavian", "industrial", "bohemian", "minimal", "vintage", "modern", etc.
  furniture?: LargeFurnitureType[] // 引き継ぎ対象の大型家具
  status: "draft" | "public"
  summary?: string
  furnitureDescription?: string
  story?: string
  conditions?: string
  condition?: "excellent" | "good" | "used" // 家具の状態
  // 引き継ぎ側プロフィール
  handoverHost?: {
    name: string
    occupation: string
    bio: string
    avatar?: string
    whyChoseThis?: Array<{ reason: string; image?: string }> // この部屋を選んだ理由
    messageToNext?: string // 次の人へのメッセージ
    socialLinks?: {
      instagram?: string
      twitter?: string
      website?: string
      youtube?: string
      tiktok?: string
    }
  }
  // 物件詳細情報
  propertyDetails?: {
    layout: string // 間取り（例：1K、1LDK）
  }
  // 引き継ぎ詳細
  handoverDetails?: {
    included: string[] // 引き継ぎに含まれるもの
    notIncluded: string[] // 含まれないもの
    viewingAvailableFrom?: string // 内見可能日
    moveInAvailableFrom?: string // 引き継ぎ可能日
  }
  // FAQ
  faq?: Array<{
    question: string
    answer: string
  }>
  // 内部品質管理用（非公開）
  issueRecord?: Array<{
    issue: string
    reportedAt: string
  }>
}
