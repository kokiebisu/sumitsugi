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

// Inquiry (引き継ぎ申し込み) データ型
export interface Inquiry {
  id: string
  propertyId: string
  propertyTitle: string
  status: "pending" | "decided" | "completed"
  applicantName: string
  applicantEmail: string
  reason: string // 興味を持った理由
  questions?: string // 質問
  submittedAt: string
  updatedAt: string
  notes?: string // 運営メモ
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
  landlordConsent: boolean
  submittedAt: string
  updatedAt: string
  notes?: string // 運営メモ
  publishedPropertyId?: string // 公開された物件ID
}

// 引き継ぎ対象の大型家具
export type LargeFurnitureType = "bed" | "sofa" | "desk" | "table" | "storage" | "dining" | "wardrobe" | "tv" | "fridge"

// User Listing (ユーザーが作成したリスティング) データ型
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
  viewingAvailableFrom?: string // 内見可能日
  moveInAvailableFrom?: string // 引き継ぎ可能日
  createdAt: string
  updatedAt: string
  publishedAt?: string
  // MVP後に追加検討
  furniture?: LargeFurnitureType[] // 大型家具
  story?: string
}

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
  style?: string // e.g., "scandinavian", "industrial", "bohemian", "minimal", "vintage", "modern", etc.
  furniture?: LargeFurnitureType[] // 引き継ぎ対象の大型家具
  status: "draft" | "public"
  // 以下は詳細ページ用（MVP後に追加検討）
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
  // 物件詳細情報（簡素化: 間取りのみ）
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

export const properties: Property[] = [
  {
    id: "1368794573069214647",
    title: "アートと植物に囲まれたワンルーム",
    summary: "カラフルなタペストリーと50以上の植物。レコードを聴きながら、自分らしい空間を作り上げてきた暮らしです。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5927-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5734-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5843-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5817-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5807-1.jpg",
    ],
    furnitureDescription:
      "ヴィンテージのチェスト、手作りの本棚、レコードプレーヤー。壁にかかる大きなタペストリーはお気に入りのアーティストの作品。スケートボードやアート作品もそのままお使いいただけます。",
    status: "public",
    story:
      "グラフィックデザイナーとして活動しながら、この部屋を自分だけのギャラリーのように育ててきました。窓辺の植物たちに水をやり、好きなレコードをかけながら作業する日々。海外での仕事が決まり、この空間を大切にしてくれる方に引き継ぎたいと思っています。",
    conditions: "植物の世話ができる方。アートやカルチャーが好きな方だと嬉しいです。",
    handoverFee: 60000,
    rent: 85000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6442, lng: 139.6986, neighborhood: "目黒区中目黒" },
    layout: "1K",
    style: "bohemian",
    furniture: ["bed", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Yuki",
      occupation: "グラフィックデザイナー",
      bio: "デザインとアートが好きで、この部屋を自分のギャラリーのように育ててきました。植物を育てながら、好きなレコードをかけて作業する時間が至福です。",
      whyChoseThis: [
        { reason: "北欧ヴィンテージのサイドテーブル。デンマークで見つけた1960年代のチーク材で、経年変化が美しい一品", image: "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5776-1.jpg" },
        { reason: "IKEAで購入したモジュラーシェルフをカスタム。植物とアート作品をバランスよく配置できます", image: "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5798-1.jpg" },
        { reason: "友人のアーティストに特注したフロアランプ。真鍮と和紙で柔らかな光を演出", image: "https://www.mensnonno.jp/wp-content/uploads/2026/01/1H8A5790-1-880x587.jpg" },
      ],
      messageToNext: "この部屋は、私にとってただの住まいではなく、クリエイティブな実験室でした。窓から見える目黒川の四季、壁に映る朝日の影、夜の静けさ。すべてが作品作りのインスピレーションになりました。次に住む方にも、この空間で自分だけの物語を紡いでほしいです。植物たちも、きっとあなたを歓迎してくれるはず。",
      socialLinks: {
        instagram: "@yuki_design_tokyo",
        website: "yukidesign.com",
      },
    },
    propertyDetails: {

      layout: "1K",

    },
    handoverDetails: {
      included: ["家具一式（ベッド、チェスト、本棚、テーブル）", "レコードプレーヤー", "タペストリー・アート作品", "植物（50鉢以上）", "スケートボード", "調理器具・食器"],
      notIncluded: ["個人の衣類・書籍", "消耗品", "一部のアート作品（要相談）"],
      viewingAvailableFrom: "2026年2月1日〜",
      moveInAvailableFrom: "2026年3月1日〜",
    },
    faq: [
      {
        question: "植物の世話は初心者でも大丈夫ですか？",
        answer: "はい、水やりの頻度など詳しく引き継ぎます。ほとんどが丈夫な品種なので、初心者の方でも安心して育てられます。",
      },
      {
        question: "レコードプレーヤーの使い方を教えてもらえますか？",
        answer: "もちろんです。引き継ぎ時に使い方を丁寧にレクチャーします。レコードも一部そのままお使いいただけます。",
      },
      {
        question: "友人を泊めることはできますか？",
        answer: "はい、可能です。ただし長期滞在の場合は大家さんへの連絡をお願いします。",
      },
      {
        question: "インテリア購入料の支払い方法は？",
        answer: "銀行振込または分割払いに対応しています。詳細は相談時にご説明します。",
      },
    ],
  },
  {
    id: "1368794573069214648",
    title: "DJ/プロデューサーの音楽制作空間",
    summary: "打ちっぱなしのコンクリート壁と防音対策。ターンテーブルと機材に囲まれた音楽制作の拠点です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7510-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7772-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7541-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7691-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7654-1.jpg",
    ],
    furnitureDescription:
      "Marshallのスピーカー、DJ機材一式（ターンテーブル、ミキサー）、レコード棚。深夜でも音を出せる防音対策済み。シンプルなベッドフレーム、カフェテーブルとチェア。",
    status: "public",
    story:
      "DJとして活動しながら、週末は自宅でイベントを開催してきました。コンクリートの音響と、機材を囲んだ空間が最高です。海外ツアーが決まり、同じように音楽を愛する方に使ってもらえたら嬉しいです。レコードコレクションも一部そのまま使えます。",
    conditions: "音楽制作をする方歓迎。深夜の音出しOK（防音済み）。機材の扱いに慣れている方優先。",
    handoverFee: 60000,
    rent: 120000,
    managementFee: 8000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6580, lng: 139.7016, neighborhood: "渋谷区恵比寿" },
    layout: "1LDK",
    style: "industrial",
    furniture: ["bed", "sofa", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Takeshi",
      occupation: "DJ / Music Producer",
      bio: "週末はクラブでDJをしながら、平日は自宅で楽曲制作をしています。音楽と共に生きる毎日。海外ツアーに行くので、この空間を音楽仲間に託したいです。",
      whyChoseThis: [
        { reason: "オーダーメイドのDJブース。ウォールナット無垢材で職人に作ってもらった一点もの", image: "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7581-1.jpg" },
        { reason: "イームズのラウンジチェア。中古で見つけたオリジナル。レコードを聴きながらくつろぐ定位置", image: "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7727-1.jpg" },
        { reason: "インダストリアルなスチールラック。500枚以上のレコードを収納。見せる収納として", image: "https://www.mensnonno.jp/wp-content/uploads/2025/12/OHZM7664-1.jpg" },
      ],
      messageToNext: "この部屋で無数のトラックを作り、週末には友人を呼んでセッションを重ねてきました。コンクリートの壁に反響する音、機材に囲まれた空間。音楽を本気で愛する人には、これ以上ない環境です。レコードコレクションの一部も引き継ぎますので、ぜひこの空間で新しいサウンドを生み出してください。",
      socialLinks: {
        instagram: "@takeshi_sounds",
        twitter: "@takeshi_dj",
        youtube: "@takeshimusic",
      },
    },
    propertyDetails: {

      layout: "1K",

    },
    handoverDetails: {
      included: ["DJ機材一式（ターンテーブル×2、ミキサー）", "Marshallスピーカー", "レコード棚", "ベッドフレーム", "テーブル・チェア", "防音パネル", "レコードコレクション（約200枚）"],
      notIncluded: ["個人の衣類", "PC・制作ソフトウェア", "一部のヴィンテージレコード"],
      viewingAvailableFrom: "2026年2月10日〜",
      moveInAvailableFrom: "2026年3月15日〜",
    },
    faq: [
      {
        question: "音楽制作の経験がなくても住めますか？",
        answer: "もちろん可能です。ただ、音楽が好きな方、これから始めたい方におすすめの空間です。",
      },
      {
        question: "DJ機材の使い方を教えてもらえますか？",
        answer: "はい、基本的な使い方は引き継ぎ時にレクチャーします。また、おすすめの練習方法もお伝えします。",
      },
      {
        question: "深夜に音を出しても本当に大丈夫ですか？",
        answer: "防音対策済みですが、22時以降は音量を控えめにしていただくのがマナーです。通常のヘッドホン使用であれば問題ありません。",
      },
      {
        question: "レコードも全て引き継げますか？",
        answer: "約200枚のうち、150枚程度は引き継ぎ可能です。一部ヴィンテージの貴重盤は持っていく予定ですが、リストは相談時にお見せします。",
      },
    ],
  },
  {
    id: "1368794573069214649",
    title: "ヴィンテージ家具とレトロな暮らし",
    summary: "昭和の雰囲気漂うレトロな家具と、温かみのある照明。時間がゆっくり流れる空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/11/007_OHZM9436-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/11/009_OHZM9458-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/11/028_OHZM9580-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/11/019_OHZM9523-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/11/012_OHZM9485-1.jpg",
    ],
    furnitureDescription:
      "木製のヴィンテージデスク、レトロな照明、古い本棚。長年かけて集めた古道具たちがこの空間を彩っています。",
    status: "public",
    story:
      "古着屋を営みながら、仕事帰りに少しずつ集めた家具たち。この部屋で過ごす時間が一番落ち着きます。店舗を移転することになり、この空間を気に入ってくれる方に譲りたいです。",
    conditions: "ヴィンテージ品を大切にしてくれる方。喫煙不可。",
    handoverFee: 48000,
    rent: 75000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.7090, lng: 139.6651, neighborhood: "杉並区高円寺" },
    layout: "1K",
    style: "vintage",
    furniture: ["bed", "desk", "storage"],
    condition: "used",
    handoverHost: {
      name: "Sota",
      occupation: "古着屋オーナー",
      bio: "古着屋を営みながら、仕事帰りに少しずつ集めた家具たち。ヴィンテージの良さを日々伝えています。",
      whyChoseThis: [
        { reason: "昭和30年代の木製デスク。味わい深い色合いが気に入っています", image: "https://www.mensnonno.jp/wp-content/uploads/2025/11/009_OHZM9458-1-880x586.jpg" },
        { reason: "アンティークの照明。温かみのある光が部屋全体を包みます", image: "https://www.mensnonno.jp/wp-content/uploads/2025/11/028_OHZM9580-1.jpg" },
        { reason: "古書店で見つけた本棚。長年の使用感が美しい", image: "https://www.mensnonno.jp/wp-content/uploads/2025/11/012_OHZM9485-1.jpg" },
      ],
      messageToNext: "古いものには、新しいものにはない温かさがあります。この部屋で過ごす時間がゆっくり流れるように感じられるのは、そんな家具たちのおかげかもしれません。次の方にも、この空間の心地よさを感じてもらえたら嬉しいです。",
      socialLinks: {
        instagram: "@sota_vintage_life",
      },
    },
  },
  {
    id: "1368794573069214650",
    title: "アーティストのアトリエ 1LDK",
    summary: "広いリビングとアート作品。創作活動をしながら、自分だけの世界観を作ってきた空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8551-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8779-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8737-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8632-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8649-1.jpg",
    ],
    furnitureDescription:
      "アルコランプ、ローテーブル、2人掛けソファ。壁には自作の大きな絵画。ネイティブアメリカン柄のベッドカバーは古着屋で見つけたお気に入り。",
    status: "public",
    story:
      "画家として活動しながら、この広い空間でインスピレーションを得てきました。光の入り方、天井の高さ、すべてが創作に向いている部屋です。レジデンスプログラムで海外に行くことになり、同じくアーティストの方に引き継いでもらえたらと思っています。",
    conditions: "創作活動をされている方優先。作品制作に使っていただいて構いません。",
    handoverFee: 80000,
    rent: 150000,
    managementFee: 10000,
    deposit: 2,
    keyMoney: 2,
    area: "東京",
    location: { lat: 35.6762, lng: 139.6503, neighborhood: "世田谷区三軒茶屋" },
    layout: "1LDK",
    style: "modern",
    furniture: ["bed", "sofa", "desk"],
    condition: "good",
    handoverHost: {
      name: "Haruki",
      occupation: "画家",
      bio: "画家として活動しながら、この広い空間でインスピレーションを得てきました。光の入り方、天井の高さ、すべてが創作に向いている部屋です。",
      whyChoseThis: [
        { reason: "アルコランプ。部屋のシンボル的存在で、柔らかな光が好き", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8551-1-880x586.jpg" },
        { reason: "壁に飾った自作の大きな絵画。この部屋で描きました", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8779-1-880x586.jpg" },
        { reason: "ネイティブアメリカン柄のベッドカバー。古着屋で見つけたお気に入り", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/OHZM8632-1.jpg" },
      ],
      messageToNext: "この部屋は私にとってキャンバスのようなものでした。窓から入る光、壁の色、すべてがインスピレーションの源です。次に住む方にも、ここで何か新しいものを生み出してほしいです。",
      socialLinks: {
        instagram: "@haruki_art_studio",
        website: "haruki-art.com",
      },
    },
  },
  {
    id: "1368794573069214651",
    title: "インダストリアルなクリエイターの部屋",
    summary: "むき出しの配管とコンクリート。倉庫をリノベーションした無骨な空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_01-2.jpeg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_02-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_03-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_04-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_06-1.jpg",
    ],
    furnitureDescription:
      "アイアンフレームのベッド、工業用照明、古い作業台をリメイクしたデスク。無骨さの中に温かみを感じる空間です。",
    status: "public",
    story:
      "プロダクトデザイナーとして、このインダストリアルな空間でプロトタイプを作ってきました。天井高があるので、大きな作品も制作可能。新しいアトリエに移ることになり、ものづくりが好きな方に使ってほしいです。",
    conditions: "DIYや制作活動OK。音が出る作業は要相談。",
    handoverFee: 36000,
    rent: 95000,
    managementFee: 6000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7295, lng: 139.7109, neighborhood: "北区田端" },
    layout: "1K",
    style: "industrial",
    furniture: ["bed", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Kento",
      occupation: "プロダクトデザイナー",
      bio: "プロダクトデザイナーとして、このインダストリアルな空間でプロトタイプを作ってきました。天井高があるので、大きな作品も制作可能。",
      whyChoseThis: [
        { reason: "アイアンフレームのベッド。無骨さが気に入っています", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_01-2.jpeg" },
        { reason: "工業用照明。本物の工場で使われていたものを再利用", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_02-1.jpg" },
        { reason: "古い作業台をリメイクしたデスク。長時間の作業にも耐える頑丈さ", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_03-1.jpg" },
      ],
      messageToNext: "ものづくり���する人にとって、この空間は最高の環境だと思います。無骨なコンクリートの壁が、かえって創造力を刺激してくれる。次の方も、ここで素晴らしい作品を生み出してください。",
      socialLinks: {
        instagram: "@kento_industrial",
      },
    },
  },
  {
    id: "1368794573069214652",
    title: "ミニマルホワイトのワンルーム",
    summary: "白を基調とした清潔感のある空間。必要最小限のもので暮らすミニマリストの部屋です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_04.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_05.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_06.jpg",
    ],
    furnitureDescription:
      "白いベッドフレーム、シンプルなデスク、間接照明。余計なものを置かない、すっきりとした空間です。",
    status: "public",
    story:
      "IT企業で働きながら、頭をクリアに保つためにものを減らしてきました。この部屋にいると集中できる。海外転勤が決まり、同じようにシンプルな暮らしを求める方に引き継ぎたいです。",
    conditions: "ミニマルな状態を維持できる方。整理整頓が好きな方向け。",
    handoverFee: 30000,
    rent: 70000,
    managementFee: 4000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6938, lng: 139.7034, neighborhood: "新宿区西新宿" },
    layout: "1R",
    style: "minimal",
    furniture: ["bed", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Yuto",
      occupation: "ITエンジニア",
      bio: "IT企業で働きながら、頭をクリアに保つためにものを減らしてきました。この部屋にいると集中できる。",
      whyChoseThis: [
        { reason: "白いベッドフレーム。シンプルさの極み", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/01.jpg" },
        { reason: "間接照明。必要最低限の光で落ち着く空間に", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_03.jpg" },
        { reason: "シンプルなデスク。集中できる作業環境", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_04.jpg" },
      ],
      messageToNext: "ミニマルな暮らしは、自分にとって必要なものを見極める練習でもあります。この白い空間で、あなたも本当に大切なものと向き合ってみてください。",
      socialLinks: {
        twitter: "@yuto_minimal",
      },
    },
  },
  {
    id: "1368794573069214653",
    title: "ボヘミアンスタイルの隠れ家",
    summary: "世界中で集めたテキスタイルと雑貨。旅するように暮らしてきた空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_04.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_05.jpg",
    ],
    furnitureDescription:
      "モロッコのラグ、インドの布、タイで買った照明。旅先で出会ったものたちが調和した、エスニックな空間です。",
    status: "public",
    story:
      "フリーランスのライターとして世界を旅しながら、気に入ったものを少しずつ持ち帰ってきました。高円寺の街の雰囲気とこの部屋がぴったり合っています。長期の取材旅行に出るため、旅好きな方に託したいです。",
    conditions: "エスニック雑貨を大切にしてくれる方。猫を飼っていた名残があります。",
    handoverFee: 40000,
    rent: 68000,
    managementFee: 3000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.7051, lng: 139.6499, neighborhood: "杉並区高円寺南" },
    layout: "1K",
    style: "bohemian",
    furniture: ["bed", "storage"],
    condition: "used",
    handoverHost: {
      name: "Mika",
      occupation: "フリーランスライター",
      bio: "フリーランスのライターとして世界を旅しながら、気に入ったものを少しずつ持ち帰ってきました。高円寺の街の雰囲気とこの部屋がぴったり合っています。",
      whyChoseThis: [
        { reason: "モロッコのラグ。マラケシュのスークで一目惚れ", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_01.jpg" },
        { reason: "インドの布。ジャイプールで見つけた手染めの美しい生地", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_02.jpg" },
        { reason: "タイで買った照明。チェンマイの職人さんが作ったもの", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_03.jpg" },
      ],
      messageToNext: "この部屋の雑貨には、それぞれ旅の思い出が詰まっています。でも、次の住人にも新しい物語を紡いでほしい。旅好きな方、エスニックな雰囲気が好きな方、ぜひこの空間を楽しんでください。",
      socialLinks: {
        instagram: "@mika_travel_writer",
        twitter: "@mika_writes",
      },
    },
  },
  {
    id: "1368794573069214654",
    title: "北欧家具が映えるデザイナーズ1LDK",
    summary: "アルテックやゲタマなど、厳選された北欧ヴィンテージ家具。窓から入る自然光が美しい空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_05.jpg",
    ],
    furnitureDescription:
      "アルテックのスツール、ソルマーニのソファ、ライトイヤーズのランプ、ゲタマのベッド、USMのシェルフ。どれも長く愛されてきた名作家具です。",
    status: "public",
    story:
      "インテリアショップで働きながら、少しずつ集めてきた北欧家具たち。この部屋は私のショールームでもありました。転勤で手放すことになりましたが、家具を大切にしてくれる方に引き継ぎたいです。",
    conditions: "家具を大切に扱える方。北欧デザインが好きな方優先。",
    handoverFee: 80000,
    rent: 130000,
    managementFee: 8000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6595, lng: 139.7004, neighborhood: "港区白金台" },
    layout: "1LDK",
    style: "scandinavian",
    furniture: ["bed", "sofa", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Kenji",
      occupation: "インテリアショップスタッフ",
      bio: "10年以上インテリア業界で働いています。北欧家具の魅力を伝えることがライフワーク。この部屋で培った審美眼を次の方にも引き継いでほしいです。",
      whyChoseThis: [
        { reason: "アルテックのスツール60。フィンランドの職人技が光る、シンプルで機能的な名作", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_02.jpg" },
        { reason: "ソルマーニのレザーソファ。イタリアンミッドセンチュリーの傑作。経年変化が美しい", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_03.jpg" },
        { reason: "ゲタマのデイベッド。デンマーク製。ソファにもベッドにもなる万能家具", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251004_05.jpg" },
      ],
      messageToNext: "北欧家具は「使い続けることで価値が生まれる」という哲学があります。この部屋の家具たちも、次の住人と共に新しい歴史を刻んでほしい。ぜひ、毎日の暮らしの中で愛用してください。",
      socialLinks: {
        instagram: "@kenji_nordic_life",
      },
    },
    propertyDetails: {

      layout: "1LDK",

    },
  },
  {
    id: "1368794573069214655",
    title: "ロフト付きワンルーム",
    summary: "天井高を活かしたロフト付き。限られた空間を最大限に活用したミニマルな暮らし。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_04.jpg",
    ],
    furnitureDescription:
      "無印良品のベッドとデスク、IKEAの収納。必要最小限に厳選された家具で、すっきりとした空間を実現。",
    status: "public",
    story:
      "映像クリエイターとして、機材以外はできるだけシンプルに暮らしてきました。ロフトは寝室、下は作業スペースと完全に分けています。仕事の拠点を移すことになり、同じく制作活動をされている方にぴったりの空間です。",
    conditions: "ミニマルな暮らしを維持できる方。在宅ワークの方にもおすすめ。",
    handoverFee: 30000,
    rent: 72000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7796, lng: 139.7180, neighborhood: "荒川区西日暮里" },
    style: "minimal",
    furniture: ["bed", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Taro",
      occupation: "映像クリエイター",
      bio: "映像クリエイターとして、機材以外はできるだけシンプルに暮らしてきました。ロフトは寝室、下は作業スペースと完全に分けています。",
      whyChoseThis: [
        { reason: "無印良品のベッド。シンプルで寝心地が良い", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_top.jpg" },
        { reason: "IKEAの収納。必要最小限に厳選", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_02.jpg" },
        { reason: "ロフトの上から見下ろす景色が好き", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251003_03.jpg" },
      ],
      messageToNext: "限られた空間を最大限に活用するのは、クリエイティブな挑戦です。この部屋で、あなたらしい暮らし方を見つけてください。",
      socialLinks: {
        youtube: "@taro_films",
      },
    },
  },
  {
    id: "1368794573069214656",
    title: "モルタル天井のデザイナーズ物件",
    summary: "無機質なモルタルと温かみのある木のコントラスト。内見即決の人気物件です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_04.jpg",
    ],
    furnitureDescription:
      "オーク材のダイニングテーブル、レザーソファ、真鍮の照明。素材感にこだわった家具で統一しています。",
    status: "public",
    story:
      "建築事務所で働いていたころから、いつかこういう空間に住みたいと思っていました。内見して即契約。4年間大切に暮らしてきた空間です。海外プロジェクトに参加することになり、引き継ぎ先を探しています。",
    conditions: "素材感を大切にできる方。インテリアが好きな方歓迎。",
    handoverFee: 80000,
    rent: 145000,
    managementFee: 10000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6638, lng: 139.7454, neighborhood: "港区南青山" },
    style: "modern",
    furniture: ["bed", "sofa", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Ryo",
      occupation: "建築士",
      bio: "空間デザインを仕事にしています。この部屋は自分の「住む作品」として、素材選びから照明計画までこだわりました。",
      whyChoseThis: [
        { reason: "モルタル仕上げの天井と壁。無機質な素材感が好きで、これが決め手でした", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_01.jpg" },
        { reason: "オーク無垢材のフローリング。裸足で歩くと気持ちいい", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_02.jpg" },
        { reason: "大きな窓から入る自然光。照明をつけなくても十分明るい", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251002_03.jpg" },
      ],
      messageToNext: "建築家として「空間」というものに向き合い続けてきました。この部屋は、私の美意識の集大成です。素材の経年変化も含めて、長く愛してくれる方に引き継ぎたいです。",
      socialLinks: {
        instagram: "@ryo_architecture",
        website: "ryo-design.com",
      },
    },
    propertyDetails: {

      layout: "1LDK",

    },
  },
  {
    id: "1368794573069214657",
    title: "陶芸作家のアトリエ兼住居",
    summary: "DIYで作り上げた作業スペース。陶芸や手仕事をする方にぴったりの空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_04.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_05.jpg",
    ],
    furnitureDescription:
      "DIYで作った大きな作業台、オープンシェルフ、ローテーブル。手仕事の道具が並ぶ、温かみのある空間です。",
    status: "public",
    story:
      "陶芸家として独立してから5年。この部屋で多くの作品を生み出してきました。窯は近くの共同アトリエを使っています。地方に拠点を移すことになり、同じくものづくりをする方に使ってほしいです。",
    conditions: "制作活動をする方優先。DIY好きな方歓迎。",
    handoverFee: 32000,
    rent: 78000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.7565, lng: 139.6675, neighborhood: "練馬区江古田" },
    style: "industrial",
    furniture: ["bed", "desk", "storage"],
    condition: "used",
    handoverHost: {
      name: "Aya",
      occupation: "陶芸家",
      bio: "陶芸家として独立してから5年。この部屋で多くの作品を生み出してきました。窯は近くの共同アトリエを使っています。",
      whyChoseThis: [
        { reason: "DIYで作った大きな作業台。制作に欠かせません", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_top.jpg" },
        { reason: "オープンシェルフ。完成した作品を並べています", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_02.jpg" },
        { reason: "自然光が入る窓辺。作品の仕上がりを確認するのに最適", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251001_03.jpg" },
      ],
      messageToNext: "ものづくりには「場」の力が大きいと思っています。この空間で生まれた作品たちは、この部屋の空気を吸って育ちました。次の方にも、創作の喜びを感じてもらえたら。",
      socialLinks: {
        instagram: "@aya_ceramics",
      },
    },
  },
  {
    id: "1368794573069214658",
    title: "ポップカラーが映える大人の1LDK",
    summary: "ビビッドな色使いと大人の落ち着きが共存。個性的なインテリアを楽しむ空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_04.jpg",
    ],
    furnitureDescription:
      "イエローのアクセントチェア、ブルーのラグ、ピンクのクッション。モノトーンベースにカラフルな差し色を効かせています。",
    status: "public",
    story:
      "アパレルブランドのデザイナーとして、色の力を信じています。この部屋は私の色彩感覚の実験場でした。海外ブランドとのコラボで渡航することになり、同じく色を楽しめる方に引き継ぎたいです。",
    conditions: "カラフルなインテリアを楽しめる方。センスのある方優先。",
    handoverFee: 72000,
    rent: 115000,
    managementFee: 7000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6689, lng: 139.6989, neighborhood: "渋谷区代官山" },
    style: "modern",
    furniture: ["bed", "sofa", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Nao",
      occupation: "アパレルデザイナー",
      bio: "アパレルブランドのデザイナーとして、色の力を信じています。この部屋は私の色彩感覚の実験場でした。",
      whyChoseThis: [
        { reason: "イエローのアクセントチェア。部屋のアイコン的存在", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_top.jpg" },
        { reason: "ブルーのラグ。床に色を入れると空間が引き締まる", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_02.jpg" },
        { reason: "ピンクのクッション。差し色の使い方がポイント", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251006_03.jpg" },
      ],
      messageToNext: "色は人の気持ちを動かす力があります。この部屋で過ごすと、なんだか元気が出てくる。そんな空間を次の方にも楽しんでほしいです。",
      socialLinks: {
        instagram: "@nao_color_design",
      },
    },
  },
  {
    id: "1368794573069214659",
    title: "白を基調としたレザーの空間",
    summary: "大きな窓からの自然光と白いインテリア。レザー家具がアクセントの洗練された空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_04.jpg",
    ],
    furnitureDescription:
      "白いソファとレザーのオットマン、ガラスのコーヒーテーブル。清潔感と高級感を両立したインテリアです。",
    status: "public",
    story:
      "外資系コンサルで働きながら、仕事後にリラックスできる空間を追求してきました。白い空間は頭をクリアにしてくれます。転職を機に引っ越すことになり、同じように仕事に集中したい方におすすめです。",
    conditions: "清潔感を保てる方。在宅ワークの方にも最適。",
    handoverFee: 60000,
    rent: 98000,
    managementFee: 6000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6581, lng: 139.7413, neighborhood: "港区六本木" },
    style: "minimal",
    furniture: ["bed", "sofa", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Ken",
      occupation: "コンサルタント",
      bio: "外資系コンサルで働きながら、仕事後にリラックスできる空間を追求してきました。白い空間は頭をクリアにしてくれます。",
      whyChoseThis: [
        { reason: "白いソファ。清潔感と高級感の両立", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_top.jpg" },
        { reason: "レザーのオットマン。足を伸ばしてリラックス", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_01.jpg" },
        { reason: "大きな窓からの自然光。朝の光で目覚める贅沢", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251005_02.jpg" },
      ],
      messageToNext: "仕事に集中する場所と、心を休める場所。この部屋はその両方を叶えてくれました。次の方にも、このバランスの良さを体感してほしいです。",
      socialLinks: {
        twitter: "@ken_business",
      },
    },
  },
  {
    id: "1368794573069214660",
    title: "リノベーションで蘇った2DK",
    summary: "築40年の物件をフルリノベーション。新しさと懐かしさが同居する空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_04.jpg",
    ],
    furnitureDescription:
      "古材を使ったダイニングテーブル、リペアしたヴィンテージチェア、新品の快適なベッド。古いものと新しいものをミックスしています。",
    status: "public",
    story:
      "リノベーション会社で働きながら、実験的にこの物件を改修しました。自分で壁を塗り、床を張り替え、3ヶ月かけて完成させた愛着のある空間です。新しいプロジェクトのため、この部屋を次の方に託します。",
    conditions: "DIYやリノベーションに興味がある方。古いものを愛せる方。",
    handoverFee: 48000,
    rent: 82000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.7236, lng: 139.7195, neighborhood: "台東区谷中" },
    style: "vintage",
    furniture: ["bed", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Daiki",
      occupation: "リノベーションプランナー",
      bio: "古い建物に新しい命を吹き込む仕事をしています。この部屋は私の「作品」でもあり「実験室」でもありました。",
      whyChoseThis: [
        { reason: "壁の珪藻土塗り。自分で塗ったからこそ愛着がある", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_02.jpg" },
        { reason: "古材を使ったダイニングテーブル。解体現場からもらってきた材を再利用", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_03.jpg" },
        { reason: "ヴィンテージの椅子。ネットで見つけて、座面を張り替えた", image: "https://www.mensnonno.jp/wp-content/uploads/2025/10/room_20251007_04.jpg" },
      ],
      messageToNext: "築40年の古い物件ですが、リノベーションで生まれ変わりました。古いものには歴史があり、新しいものにはない温かみがあります。この空間の「物語」を引き継いでくれる方を待っています。",
      socialLinks: {
        instagram: "@daiki_renovation",
      },
    },
    propertyDetails: {

      layout: "2DK",

    },
  },
  {
    id: "1368794573069214661",
    title: "グリーンに囲まれた癒しの空間",
    summary: "100鉢以上の観葉植物と暮らすボタニカルライフ。都会のオアシスのような部屋です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6604-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6721-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6849-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6634-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6648-1-880x586.jpg",
    ],
    furnitureDescription:
      "ラタンのソファ、木製のプランタースタンド、ハンギングプランター。植物たちと共存するために選んだナチュラルな家具です。",
    status: "public",
    story:
      "植物園で働きながら、自宅もジャングルのようにしてしまいました。朝起きて植物に水をやる時間が一番好き。海外の植物園に研修に行くことになり、植物好きな方に託したいです。",
    conditions: "植物の世話ができる方必須。水やりスケジュールをお伝えします。",
    handoverFee: 72000,
    rent: 110000,
    managementFee: 6000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6762, lng: 139.6710, neighborhood: "世田谷区池尻" },
    style: "bohemian",
    furniture: ["bed", "sofa", "storage"],
    condition: "good",
    handoverHost: {
      name: "Saki",
      occupation: "植物園スタッフ",
      bio: "植物園で働きながら、自宅もジャングルのようにしてしまいました。朝起きて植物に水をやる時間が一番好き。",
      whyChoseThis: [
        { reason: "ラタンのソファ。植物たちとの相性が抜群", image: "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6604-1-880x586.jpg" },
        { reason: "ハンギングプランター。空間を立体的に使えます", image: "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6721-880x586.jpg" },
        { reason: "木製のプランタースタンド。高低差をつけて植物を配置", image: "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6849-1-880x586.jpg" },
      ],
      messageToNext: "植物との暮らしは、手間もかかりますが、それ以上の癒しをくれます。100鉢以上の植物たち、ぜひ大切にしてあげてください。水やりスケジュールも引き継ぎます。",
      socialLinks: {
        instagram: "@saki_botanical_life",
      },
    },
  },
  {
    id: "1368794573069214662",
    title: "写真家のスタジオ兼住居",
    summary: "自然光を活かした撮影スタジオ。白壁と大きな窓が特徴の創作空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8204-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8241-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8437-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8487-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8313-1.jpg",
    ],
    furnitureDescription:
      "撮影用の白いバックペーパー、ライトスタンド、シンプルなソファ。撮影機材は別途相談で引き継ぎ可能です。",
    status: "public",
    story:
      "フォトグラファーとして独立後、自宅をスタジオ兼住居として使ってきました。窓からの光が最高で、ポートレート撮影に最適です。海外を拠点にすることになり、同じく写真を仕事にしている方に使ってほしいです。",
    conditions: "撮影やクリエイティブな仕事をしている方優先。",
    handoverFee: 48000,
    rent: 88000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6634, lng: 139.6870, neighborhood: "目黒区祐天寺" },
    style: "minimal",
    furniture: ["bed", "sofa", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Riko",
      occupation: "フォトグラファー",
      bio: "フォトグラファーとして独立後、自宅をスタジオ兼住居として使ってきました。窓からの光が最高で、ポートレート撮影に最適です。",
      whyChoseThis: [
        { reason: "白いバックペーパー。撮影に欠かせない背景", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8204-1-880x586.jpg" },
        { reason: "大きな窓からの自然光。人工光では出せない柔らかさ", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8241-1-880x586.jpg" },
        { reason: "シンプルなソファ。撮影の合間にリラックス", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8437-1-880x586.jpg" },
      ],
      messageToNext: "この部屋で何百人ものポートレートを撮影しました。窓から入る光の角度、壁の反射、すべてが計算されています。写真を仕事にしている方には最高の環境だと思います。",
      socialLinks: {
        instagram: "@riko_photography",
        website: "riko-photo.com",
      },
    },
  },
  {
    id: "1368794573069214663",
    title: "ミッドセンチュリーが香る1LDK",
    summary: "イームズやノグチの名作家具。50〜60年代のデザインを愛する人のための空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0316-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0469-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0425-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0653-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0520-1-880x587.jpg",
    ],
    furnitureDescription:
      "イームズのラウンジチェア、ノグチのコーヒーテーブル、ネルソンのベンチ。どれも本物のヴィンテージです。",
    status: "public",
    story:
      "家具デザインを学んだあと、ヴィンテージ家具の買い付けを仕事にしてきました。この部屋は私のコレクションの一部です。独立してショップを開くため、引き継ぎ先を探しています。",
    conditions: "ヴィンテージ家具を大切にできる方。家具の価値がわかる方優先。",
    handoverFee: 80000,
    rent: 125000,
    managementFee: 8000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6512, lng: 139.7232, neighborhood: "港区麻布十番" },
    style: "modern",
    furniture: ["bed", "sofa", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Shun",
      occupation: "家具バイヤー",
      bio: "家具デザインを学んだあと、ヴィンテージ家具の買い付けを仕事にしてきました。この部屋は私のコレクションの一部です。",
      whyChoseThis: [
        { reason: "イームズのラウンジチェア。言わずと知れた名作", image: "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0316-1-880x587.jpg" },
        { reason: "ノグチのコーヒーテーブル。有機的なフォルムが美しい", image: "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0469-1-880x587.jpg" },
        { reason: "ネルソンのベンチ。シンプルで機能的なデザイン", image: "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0425-1-880x587.jpg" },
      ],
      messageToNext: "ミッドセンチュリーの家具は、70年以上前のデザインなのに今も色褪せない普遍性があります。この空間で、名作家具と暮らす贅沢を味わってください。",
      socialLinks: {
        instagram: "@shun_vintage_furniture",
      },
    },
  },
  {
    id: "1368794573069214664",
    title: "天井高4mのロフト空間",
    summary: "倉庫をコンバージョンした開放的な空間。天井高を活かしたダイナミックな暮らし。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8838-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8863-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM9016-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8849-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8870-1-880x586.jpg",
    ],
    furnitureDescription:
      "特注の鉄製ロフトベッド、大きなワークテーブル、ハンモック。天井高を活かした家具配置です。",
    status: "public",
    story:
      "スタートアップで働きながら、この開放的な空間でアイデアを練ってきました。天井の高さが思考を広げてくれる気がします。会社の移転に伴い、同じく自由な発想を大切にする方に。",
    conditions: "開放的な空間を楽しめる方。ロフトの���り下りが苦にならない方。",
    handoverFee: 40000,
    rent: 92000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6995, lng: 139.7744, neighborhood: "墨田区両国" },
    style: "industrial",
    furniture: ["bed", "desk"],
    condition: "good",
    handoverHost: {
      name: "Yuki",
      occupation: "スタートアップCEO",
      bio: "スタートアップで働きながら、この開放的な空間でアイデアを練ってきました。天井の高さが思考を広げてくれる気がします。",
      whyChoseThis: [
        { reason: "特注の鉄製ロフトベッド。空間を有効活用", image: "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8838-1-880x586.jpg" },
        { reason: "大きなワークテーブル。チームでのブレストにも対応", image: "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8863-1-880x586.jpg" },
        { reason: "ハンモック。リラックスタイムに欠かせない", image: "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM9016-1-880x586.jpg" },
      ],
      messageToNext: "天井高4mという空間は、想像以上に気持ちを解放してくれます。大きなアイデアを持っている方、ぜひこの空間で実現に向けて動いてください。",
      socialLinks: {
        twitter: "@yuki_startup",
        website: "yuki-ventures.com",
      },
    },
  },
  {
    id: "1368794573069214665",
    title: "和モダンが美しい1DK",
    summary: "畳と障子のある現代的な和室。日本の美意識を大切にした空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8582-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8602-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8682-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8604-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8614-1-880x587.jpg",
    ],
    furnitureDescription:
      "琉球畳、障子、ちゃぶ台、座布団。現代的な設備と伝統的な和の要素が融合しています。",
    status: "public",
    story:
      "茶道を習いながら、和の暮らしを実践してきました。この部屋で点てるお茶は格別です。京都に移住することになり、同じく日本文化を愛する方に引き継ぎたいです。",
    conditions: "畳の部屋を大切にできる方。和の暮らしに興味がある方。",
    handoverFee: 32000,
    rent: 65000,
    managementFee: 4000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.7117, lng: 139.7789, neighborhood: "墨田区向島" },
    style: "minimal",
    furniture: ["bed", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Hana",
      occupation: "茶道講師",
      bio: "茶道を習いながら、和の暮らしを実践してきました。この部屋で点てるお茶は格別です。",
      whyChoseThis: [
        { reason: "琉球畳。足触りが心地よい", image: "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8582-1-880x587.jpg" },
        { reason: "障子。柔らかな光が入ります", image: "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8602-1-880x587.jpg" },
        { reason: "ちゃぶ台と座布団。正座でお茶を点てる時間", image: "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8682-1-880x587.jpg" },
      ],
      messageToNext: "和の暮らしは、日々の所作を丁寧にする練習です。この畳の部屋で、ゆっくりとお茶を点てる時間を楽しんでください。茶道具も引き継ぎます。",
      socialLinks: {
        instagram: "@hana_tea_ceremony",
      },
    },
  },
  {
    id: "1368794573069214666",
    title: "DIYで作り込んだ賃貸ワンルーム",
    summary: "原状回復可能なDIYで劇的ビフォーアフター。創意工夫が詰まった空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_top.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_04.jpg",
    ],
    furnitureDescription:
      "自作の壁面収納、DIYキッチンカウンター、リメイクした古家具。すべて手作りの温かみがあります。",
    status: "public",
    story:
      "YouTubeでDIY動画を配信しながら、この部屋を実験台にしてきました。賃貸でもここまでできる！という証明です。次の物件でまた挑戦するため、DIY好きな方に引き継ぎます。",
    conditions: "DIYを継続できる方。現状維持でもOKです。",
    handoverFee: 30000,
    rent: 75000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.7341, lng: 139.6517, neighborhood: "中野区野方" },
    style: "industrial",
    furniture: ["bed", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Masa",
      occupation: "YouTuber / DIYクリエイター",
      bio: "YouTubeでDIY動画を配信しながら、この部屋を実験台にしてきました。賃貸でもここまでできる！という証明です。",
      whyChoseThis: [
        { reason: "自作の壁面収納。釘を使わないDIY技術の結晶", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_top.jpg" },
        { reason: "DIYキッチンカウンター。料理が楽しくなりました", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_01.jpg" },
        { reason: "リメイクした古家具。廃材を再利用", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_02.jpg" },
      ],
      messageToNext: "賃貸だからこそ、原状回復可能なDIYにこだわってきました。このノウハウ、全部引き継ぎます。次の方も、ぜひ自分らしくカスタマイズしてください。",
      socialLinks: {
        youtube: "@masa_diy_life",
        instagram: "@masa_diy",
      },
    },
  },
  {
    id: "1368794573069214667",
    title: "コーヒー好きのための1LDK",
    summary: "自家焙煎もできるコーヒーコーナー完備。香りに包まれる毎日を。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6622-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6736-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6793-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6849-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6604-1.jpg",
    ],
    furnitureDescription:
      "業務用エスプレッソマシン、焙煎機、ドリップスタンド。コーヒー器具は一通り揃っています。",
    status: "public",
    story:
      "バリスタとして働きながら、自宅でも本格的なコーヒーが淹れられる環境を整えてきました。朝のコーヒータイムが一日のハイライト。開業準備のため、コーヒー好きな方にこの空間を。",
    conditions: "コーヒー好きな方。器具の扱いに慣れている方優先。",
    handoverFee: 80000,
    rent: 105000,
    managementFee: 7000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7090, lng: 139.6875, neighborhood: "新宿区落合" },
    style: "modern",
    furniture: ["bed", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Kohei",
      occupation: "バリスタ",
      bio: "バリスタとして働きながら、自宅でも本格的なコーヒーが淹れられる環境を整えてきました。朝のコーヒータイムが一日のハイライト。",
      whyChoseThis: [
        { reason: "業務用エスプレッソマシン La Marzocco。プロ仕様の味が出せます", image: "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6622-1-880x586.jpg" },
        { reason: "焙煎機 Aillio Bullet。自家焙煎の香りは格別", image: "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6736-1-880x586.jpg" },
        { reason: "ドリップスタンド。ハンドドリップ派にも対応", image: "https://www.mensnonno.jp/wp-content/uploads/2024/12/OHZM6793-1-880x586.jpg" },
      ],
      messageToNext: "コーヒーは人生を豊かにしてくれます。この空間で、毎朝最高の一杯を淹れてください。器具の使い方もレクチャーします。",
      socialLinks: {
        instagram: "@kohei_coffee",
      },
    },
  },
  {
    id: "1368794573069214668",
    title: "映画好きのシアタールーム",
    summary: "プロジェクター&サラウンドシステム完備。自宅が映画館になる空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8440-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8273-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8393-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8341-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8451-1.jpg",
    ],
    furnitureDescription:
      "4Kプロジェクター、120インチスクリーン、5.1chサラウンドシステム、リクライニングソファ。",
    status: "public",
    story:
      "映画評論の仕事をしながら、自宅を最高の視聴環境にしてきました。週末は友人を呼んで上映会。転職で拠点を移すことになり、映画愛のある方に託します。",
    conditions: "映画好きな方。機材を大切に扱える方。",
    handoverFee: 80000,
    rent: 135000,
    managementFee: 8000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6580, lng: 139.7016, neighborhood: "渋谷区恵比寿" },
    style: "modern",
    furniture: ["bed", "sofa"],
    condition: "excellent",
    handoverHost: {
      name: "Takuma",
      occupation: "映画評論家",
      bio: "映画評論の仕事をしながら、自宅を最高の視聴環境にしてきました。週末は友人を呼んで上映会。",
      whyChoseThis: [
        { reason: "4Kプロジェクター EPSON EH-TW9400。映画館クオリティ", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8440-1.jpg" },
        { reason: "120インチスクリーン。没入感が違います", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8273-1.jpg" },
        { reason: "リクライニングソファ。長時間の鑑賞も快適", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8393-1-880x587.jpg" },
      ],
      messageToNext: "映画は暗い部屋で、大きなスクリーンで、良い音で観るべきです。この環境を作り上げるのに何年もかかりました。映画好きの方に引き継げたら本望です。",
      socialLinks: {
        twitter: "@takuma_cinema",
        youtube: "@takuma_movie_review",
      },
    },
  },
  {
    id: "1368794573069214669",
    title: "料理研究家のキッチンスタジオ",
    summary: "業務用キッチン設備完備。料理好きの夢が詰まった空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8650-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8717-1-880x587.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8537-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8893-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8914-1-880x586.jpg",
    ],
    furnitureDescription:
      "5口ガスコンロ、大型オーブン、業務用冷蔵庫、アイランドキッチン。調理器具も豊富に。",
    status: "public",
    story:
      "料理教室を主宰しながら、自宅キッチンを作り込んできました。このキッチンで何百ものレシピが生まれました。海外で修行することになり、料理を仕事にしている方に使ってほしいです。",
    conditions: "料理を仕事にしている方優先。撮影利用も可。",
    handoverFee: 80000,
    rent: 155000,
    managementFee: 10000,
    deposit: 2,
    keyMoney: 2,
    area: "東京",
    location: { lat: 35.6762, lng: 139.6503, neighborhood: "世田谷区駒沢" },
    style: "modern",
    furniture: ["bed", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Yumi",
      occupation: "料理研究家",
      bio: "料理教室を主宰しながら、自宅キッチンを作り込んできました。このキッチンで何百ものレシピが生まれました。",
      whyChoseThis: [
        { reason: "5口ガスコンロ。同時調理が捗ります", image: "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8650-1-880x587.jpg" },
        { reason: "大型オーブン。パンからローストまで対応", image: "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8717-1-880x587.jpg" },
        { reason: "アイランドキッチン。作業効率が段違い", image: "https://www.mensnonno.jp/wp-content/uploads/2025/06/OHZM8537-1-880x586.jpg" },
      ],
      messageToNext: "料理は愛情。このキッチンで作った料理で、たくさんの笑顔を見てきました。次の方にも、ここでたくさんの美味しい料理を作ってほしいです。",
      socialLinks: {
        instagram: "@yumi_kitchen_studio",
        youtube: "@yumi_cooking",
      },
    },
  },
  {
    id: "1368794573069214670",
    title: "本に埋もれる書斎付き1LDK",
    summary: "壁一面の本棚に囲まれた読書家の楽園。静かに本と向き合える空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8496-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8301-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8361-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8457-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/DMA-250421_MN47536.jpg",
    ],
    furnitureDescription:
      "天井までの造作本棚（3000冊収納可）、読書用チェア、デスクランプ。本好きのための空間。",
    status: "public",
    story:
      "編集者として働きながら、ひたすら本を集めてきました。この部屋で過ごす静かな時間が宝物です。地方の出版社に転職することになり、同じく本を愛する方に。",
    conditions: "本を大切にできる方。静かな環境を好む方。",
    handoverFee: 60000,
    rent: 95000,
    managementFee: 6000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7128, lng: 139.7603, neighborhood: "文京区本郷" },
    style: "vintage",
    furniture: ["bed", "desk", "storage"],
    condition: "good",
    handoverHost: {
      name: "Akira",
      occupation: "編集者",
      bio: "編集者として働きながら、ひたすら本を集めてきました。この部屋で過ごす静かな時間が宝物です。",
      whyChoseThis: [
        { reason: "天井までの造作本棚。3000冊収納可能", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8496-1.jpg" },
        { reason: "読書用チェア。長時間の読書も快適", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8301-1-880x586.jpg" },
        { reason: "デスクランプ。目に優しい光で夜の読書も", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/OHZM8361-1.jpg" },
      ],
      messageToNext: "本は人生を豊かにしてくれます。この3000冊の蔵書、次の方にも読んでいただけたら嬉しいです。静かな時間を大切にできる方に。",
      socialLinks: {
        twitter: "@akira_books",
      },
    },
  },
  {
    id: "1368794573069214671",
    title: "ヨガインストラクターの静寂空間",
    summary: "朝日が差し込む広いリビング。毎日のヨガ習慣に最適な空間です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8872-1-880x586.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/DMA-250421_MN47538.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/DMA-250421_MN47543.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/07/DMA-250421_MN47549.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_05.jpg",
    ],
    furnitureDescription:
      "ヨガマット、瞑想クッション、アロマディフューザー。最小限の家具で広々とした空間を確保。",
    status: "public",
    story:
      "ヨガインストラクターとして、この部屋で毎朝プラクティスを続けてきました。東向きの窓から入る朝日が最高。海外でヨガを学ぶため、心身を整える暮らしを求める方に。",
    conditions: "静かな暮らしを好む方。ヨガや瞑想に興味がある方。",
    handoverFee: 30000,
    rent: 72000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.6938, lng: 139.7034, neighborhood: "渋谷区千駄ヶ谷" },
    style: "minimal",
    furniture: ["bed", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Emi",
      occupation: "ヨガインストラクター",
      bio: "ヨガインストラクターとして、この部屋で毎朝プラクティスを続けてきました。東向きの窓から入る朝日が最高。",
      whyChoseThis: [
        { reason: "広いリビング。ヨガマットを広げても余裕", image: "https://www.mensnonno.jp/wp-content/uploads/2025/07/OHZM8872-1-880x586.jpg" },
        { reason: "瞑想クッション。心を落ち着ける時間に", image: "https://www.mensnonno.jp/wp-content/uploads/2025/07/DMA-250421_MN47538.jpg" },
        { reason: "アロマディフューザー。香りで空間を整える", image: "https://www.mensnonno.jp/wp-content/uploads/2025/07/DMA-250421_MN47543.jpg" },
      ],
      messageToNext: "ヨガは心と体を整える最高の習慣です。この部屋で毎朝プラクティスを続けてきた私の習慣を、次の方にも引き継いでいただけたら。",
      socialLinks: {
        instagram: "@emi_yoga_life",
      },
    },
  },
  {
    id: "1368794573069214672",
    title: "ガレージ付きバイク好きの隠れ家",
    summary: "バイク2台収納可能なガレージ付き。整備もできる趣味の空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_01-2.jpeg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_02-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_03-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_04-1.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_06-1.jpg",
    ],
    furnitureDescription:
      "バイクリフト、工具棚、作業台。居住スペースはシンプルに、ガレージを充実させています。",
    status: "public",
    story:
      "週末はバイクをいじり、平日は眺めて過ごす。そんなバイク中心の生活を送ってきました。転勤で手放すことになり、同じくバイクを愛する方に最高の環境を引き継ぎます。",
    conditions: "バイク乗りの方優先。ガレージを大切に使える方。",
    handoverFee: 40000,
    rent: 85000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7295, lng: 139.7109, neighborhood: "板橋区大山" },
    style: "industrial",
    furniture: ["bed", "storage"],
    condition: "good",
    handoverHost: {
      name: "Tatsuya",
      occupation: "メカニック",
      bio: "週末はバイクをいじり、平日は眺めて過ごす。そんなバイク中心の生活を送ってきました。",
      whyChoseThis: [
        { reason: "バイクリフト。整備が格段に楽になります", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_01-2.jpeg" },
        { reason: "工具棚。必要な工具がすべて揃っています", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_02-1.jpg" },
        { reason: "作業台。細かい作業もしやすい環境", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_03-1.jpg" },
      ],
      messageToNext: "バイクは単なる移動手段じゃない、人生の相棒です。この最高の環境で、あなたも愛車と過ごしてください。工具も全部引き継ぎます。",
      socialLinks: {
        instagram: "@tatsuya_bike_garage",
        youtube: "@tatsuya_moto",
      },
    },
  },
  {
    id: "1368794573069214673",
    title: "ペットと暮らせる広々2LDK",
    summary: "犬と猫と暮らすためにカスタマイズした空間。ペットファーストな設計です。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_04.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_05.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_06.jpg",
    ],
    furnitureDescription:
      "キャットウォーク、ペット用ドア、洗いやすい床材。人間用の家具もペットに優しい素材を選んでいます。",
    status: "public",
    story:
      "獣医として働きながら、犬1匹と猫2匹と暮らしてきました。この部屋はペットのために作った空間です。海外の動物病院で研修することになり、ペットと暮らす方に引き継ぎたいです。",
    conditions: "ペットと暮らしている方優先。動物好きな方。",
    handoverFee: 32000,
    rent: 78000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "東京",
    location: { lat: 35.6356, lng: 139.6484, neighborhood: "世田谷区等々力" },
    style: "scandinavian",
    furniture: ["bed", "sofa", "storage"],
    condition: "used",
    handoverHost: {
      name: "Mio",
      occupation: "獣医",
      bio: "獣医として働きながら、犬1匹と猫2匹と暮らしてきました。この部屋はペットのために作った空間です。",
      whyChoseThis: [
        { reason: "キャットウォーク。猫たちの遊び場", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/01.jpg" },
        { reason: "ペット用ドア。自由に行き来できます", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_03.jpg" },
        { reason: "洗いやすい床材。お手入れが簡単", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250928_04.jpg" },
      ],
      messageToNext: "ペットは家族です。この部屋はペットファーストで設計しました。動物好きな方に、この愛情を込めた空間を引き継いでいただけたら嬉しいです。",
      socialLinks: {
        instagram: "@mio_vet_life",
      },
    },
  },
  {
    id: "1368794573069214674",
    title: "テラス付きルーフトップ1LDK",
    summary: "屋上テラスでBBQもできる開放的な空間。都心で空を感じる暮らし。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_01.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_02.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_03.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_04.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_05.jpg",
    ],
    furnitureDescription:
      "テラス用家具、BBQグリル、ハンモック。室内はシンプルに、テラスを充実させています。",
    status: "public",
    story:
      "マーケターとして働きながら、週末はテラスでBBQパーティーを開催してきました。夜景を見ながらのビールは最高です。海外赴任のため、この開放的な空間を楽しめる方に。",
    conditions: "アウトドア好きな方。テラスを活用できる方。",
    handoverFee: 48000,
    rent: 120000,
    managementFee: 8000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.6605, lng: 139.7292, neighborhood: "港区白金台" },
    style: "modern",
    furniture: ["bed", "sofa", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Ryota",
      occupation: "マーケター",
      bio: "マーケターとして働きながら、週末はテラスでBBQパーティーを開催してきました。夜景を見ながらのビールは最高です。",
      whyChoseThis: [
        { reason: "20㎡のルーフテラス。都心で空を感じられる贅沢", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_01.jpg" },
        { reason: "Weber グリル。本格的なBBQが楽しめます", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_02.jpg" },
        { reason: "ハンモック。テラスでの昼寝は最高", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250929_03.jpg" },
      ],
      messageToNext: "都心でテラス付きの部屋は本当に貴重です。友人を呼んでBBQ、一人で夜景を眺める時間、両方楽しめるこの空間を次の方にも。",
      socialLinks: {
        instagram: "@ryota_rooftop",
      },
    },
  },
  {
    id: "1368794573069214675",
    title: "ゲーマーのための最強環境",
    summary: "ハイスペックPC、配信環境完備。プロゲーマーも満足の空間。",
    images: [
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_06.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_07.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0473-1-880x1319.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0493-1-880x1319.jpg",
      "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0642-1-880x1319.jpg",
    ],
    furnitureDescription:
      "ゲーミングデスク、4Kモニター3枚、配信用機材、ゲーミングチェア。すべてが最高スペック。",
    status: "public",
    story:
      "プロゲーマーとして活動しながら、配信環境を完璧に整えてきました。この部屋で何千時間もプレイしてきた愛着のある空間です。チーム移籍で引っ越すため、ゲーム好きな方に。",
    conditions: "ゲームや配信をする方優先。機材を大切に扱える方。",
    handoverFee: 80000,
    rent: 140000,
    managementFee: 10000,
    deposit: 2,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7050, lng: 139.7187, neighborhood: "新宿区高田馬場" },
    style: "modern",
    furniture: ["bed", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Yusuke",
      occupation: "プロゲーマー / ストリーマー",
      bio: "プロゲーマーとして活動しながら、配信環境を完璧に整えてきました。この部屋で何千時間もプレイしてきた愛着のある空間です。",
      whyChoseThis: [
        { reason: "RTX 4090搭載PC。最高スペックでどんなゲームも快適", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_06.jpg" },
        { reason: "4Kモニター3枚。配信しながらのプレイも余裕", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250930_07.jpg" },
        { reason: "配信用機材一式。すぐに配信を始められます", image: "https://www.mensnonno.jp/wp-content/uploads/2025/08/OHZM0473-1-880x1319.jpg" },
      ],
      messageToNext: "ゲームは真剣にやるから面白い。この環境で、あなたも最高のパフォーマンスを発揮してください。配信のノウハウも教えます。",
      socialLinks: {
        twitter: "@yusuke_pro_gamer",
        youtube: "@yusuke_gaming",
        tiktok: "@yusuke_clips",
      },
    },
  },
  {
    id: "1368794573069214671",
    title: "池袋エリアのコンパクトな隠れ家",
    summary: "漫画の聖地・トキワ荘近く。クリエイターの街で暮らすミニマルな空間。",
    images: [
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/b5125a3b-bef2-459a-8f40-3ea1eae7fd82.png",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/fc57f575-96fc-4304-8235-910a5b74ecf2.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/90a5e031-8f11-4854-9345-186b2c8925dc.png",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/666b4056-5bcd-499e-bbc3-d57e14a62705.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/9ef964d8-50a4-42df-b092-810a9e86c657.jpeg",
    ],
    furnitureDescription:
      "ダブルベッド、コンパクトなキッチン、デスクスペース。必要なものが全て揃ったミニマルな空間です。",
    status: "public",
    story:
      "漫画家を目指してこの街に来ました。トキワ荘の跡地が近く、毎日インスピレーションをもらっています。デビューが決まり、仕事部屋を別に借りることになったので、同じく夢を追う方にこの部屋を。",
    conditions: "クリエイティブな活動をしている方歓迎。静かに暮らせる方。",
    handoverFee: 35000,
    rent: 72000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7359, lng: 139.6989, neighborhood: "豊島区南長崎" },
    layout: "1R",
    style: "minimal",
    furniture: ["bed", "desk"],
    condition: "excellent",
    handoverHost: {
      name: "Ren",
      occupation: "漫画家",
      bio: "漫画家を目指してこの街に来ました。トキワ荘の聖地で、先人たちのエネルギーを感じながら創作しています。",
      whyChoseThis: [
        { reason: "コンパクトだけど機能的なデスク。原稿作業に集中できる", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/b5125a3b-bef2-459a-8f40-3ea1eae7fd82.png" },
        { reason: "大きなダブルベッド。締め切り前の仮眠に最適", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/fc57f575-96fc-4304-8235-910a5b74ecf2.jpeg" },
        { reason: "明るい窓。自然光で作業できるのが嬉しい", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1526563981109647588/original/90a5e031-8f11-4854-9345-186b2c8925dc.png" },
      ],
      messageToNext: "トキワ荘の近くで暮らすということは、漫画の歴史の中に身を置くこと。手塚治虫や藤子不二雄が歩いた街で、あなたも夢を追いかけてください。",
      socialLinks: {
        twitter: "@ren_manga",
      },
    },
  },
  {
    id: "1368794573069214672",
    title: "大阪・新今宮のレトロモダンな部屋",
    summary: "下町情緒と都会の便利さが共存。大阪を遊び尽くす拠点に最適な空間。",
    images: [
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/3ed272be-c70c-48d5-8c5c-84917c55ac56.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/9ca9f361-8cc1-4778-a7ea-f296c2ce4441.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/853af2c6-920a-4281-a24e-0f02d24ab406.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/d577b1d6-2b4c-4689-a0bd-58cc34fb7d1e.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/5487e444-83ad-4629-8633-44255fc0bf6e.jpeg",
    ],
    furnitureDescription:
      "ダブルベッド、ミニキッチン、バスタブ付きバスルーム。コンパクトながら必要な設備が全て揃っています。",
    status: "public",
    story:
      "大阪で飲食店を経営しながら、この下町エリアの人情味に惹かれて暮らしてきました。通天閣も歩いてすぐ、新世界の串カツも毎日食べられる最高の立地。店舗を移転することになり、大阪の魅力を知っている方に。",
    conditions: "大阪の下町文化を楽しめる方。飲み歩きが好きな方歓迎。",
    handoverFee: 38000,
    rent: 58000,
    managementFee: 4000,
    deposit: 1,
    keyMoney: 0,
    area: "大阪",
    location: { lat: 34.6523, lng: 135.5013, neighborhood: "大阪市浪速区新今宮" },
    layout: "1K",
    style: "modern",
    furniture: ["bed"],
    condition: "good",
    handoverHost: {
      name: "Daisuke",
      occupation: "飲食店経営者",
      bio: "大阪で10年、飲食店を経営しています。新世界の活気と人情が大好きで、この街に根を下ろしました。",
      whyChoseThis: [
        { reason: "清潔感のあるベッドルーム。仕事終わりにぐっすり眠れる", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/3ed272be-c70c-48d5-8c5c-84917c55ac56.jpeg" },
        { reason: "使いやすいキッチン。簡単な料理なら十分できる", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/9ca9f361-8cc1-4778-a7ea-f296c2ce4441.jpeg" },
        { reason: "バスタブ付き。大阪の夜を楽しんだ後はゆっくり湯船に", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1453600273857937648/original/853af2c6-920a-4281-a24e-0f02d24ab406.jpeg" },
      ],
      messageToNext: "新今宮は観光客には見えない、本当の大阪がある場所。地元の人が通う居酒屋、朝から開いてる立ち飲み、ディープな大阪を楽しんでください。",
      socialLinks: {
        instagram: "@daisuke_osaka_food",
      },
    },
  },
  {
    id: "1515284949501830584",
    title: "海が見える湘南スタイルの暮らし",
    summary: "朝は波の音で目覚め、夕方はサンセットを眺める。サーファーが愛した海辺の1LDK。",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/fc7eb3e0-6a7d-4c1d-98c2-4eea0caa1baf.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/25c3fd35-3d3c-43b7-a8d4-5f5cb17f84f0.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/5ec79b1f-8e2b-417b-a75c-d1f2f53d1a6f.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/7c6e6df8-7b0e-4c1a-9e3c-b6c8f8d9e0a1.jpeg",
    ],
    furnitureDescription:
      "オーシャンビューのリビング、流木を使ったDIY家具、サーフボードラック。海辺の暮らしに必要なものが揃っています。",
    status: "public",
    story:
      "湘南でサーフィンを続けて15年。朝は波チェックから始まり、仕事終わりにも海に入れる最高の環境です。転勤で離れることになり、同じように海を愛する方にこの暮らしを引き継ぎたいです。",
    conditions: "海好き、自然を大切にする方。サーフィンしなくてもOK。",
    handoverFee: 55000,
    rent: 95000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "神奈川",
    location: { lat: 35.3106, lng: 139.4831, neighborhood: "藤沢市鵠沼海岸" },
    layout: "1LDK",
    style: "coastal",
    furniture: ["bed", "sofa", "storage"],
    condition: "good",
    handoverHost: {
      name: "Kenji",
      occupation: "サーファー / Webデザイナー",
      bio: "週末サーファーから始まり、気づけば湘南に移住して15年。リモートワークしながら毎日海に入れる生活を実現しました。",
      whyChoseThis: [
        { reason: "リビングから見える海。朝日も夕日も最高のロケーション", image: "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/fc7eb3e0-6a7d-4c1d-98c2-4eea0caa1baf.jpeg" },
        { reason: "流木で作ったサーフボードラック。3本まで収納可能", image: "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/25c3fd35-3d3c-43b7-a8d4-5f5cb17f84f0.jpeg" },
        { reason: "海から上がってすぐシャワーを浴びられる導線", image: "https://a0.muscache.com/im/pictures/miso/Hosting-1515284949501830584/original/5ec79b1f-8e2b-417b-a75c-d1f2f53d1a6f.jpeg" },
      ],
      messageToNext: "湘南の海は毎日表情が違います。波がある日も、凪の日も、それぞれの美しさがある。この部屋で海と共に暮らす喜びを味わってください。",
      socialLinks: {
        instagram: "@kenji_shonan_surf",
      },
    },
    handoverDetails: {
      included: ["サーフボードラック", "流木家具一式", "ベッド・ソファ", "アウトドアチェア", "サーフィン用シャワー設備"],
      notIncluded: ["サーフボード", "ウェットスーツ", "個人の衣類"],
      viewingAvailableFrom: "2026年3月1日〜",
      moveInAvailableFrom: "2026年4月1日〜",
    },
  },
  {
    id: "1515284949501830585",
    title: "京町家をリノベした和モダン空間",
    summary: "築100年の町家を現代風にリノベーション。坪庭を眺めながら過ごす静かな京都暮らし。",
    images: [
      "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1034443906084847498/original/e5b1a5c2-8c0e-4f92-a6c1-9c9f8e7d6b5a.jpeg",
      "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1034443906084847498/original/a3d2b1c0-9e8f-4a7b-b5c2-d1e0f9a8b7c6.jpeg",
      "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1034443906084847498/original/c7e6d5f4-3a2b-4c8d-9e0f-1a2b3c4d5e6f.jpeg",
    ],
    furnitureDescription:
      "畳の和室、坪庭、無垢材のダイニングテーブル。伝統とモダンが融合した空間です。",
    status: "public",
    story:
      "京都で着物の仕立て職人をしていました。この町家で10年、四季を感じながら暮らしてきました。東京に戻ることになり、京都の暮らしを愛してくれる方に。",
    conditions: "静かな環境を好む方。町家の作法を大切にできる方。",
    handoverFee: 70000,
    rent: 110000,
    managementFee: 8000,
    deposit: 2,
    keyMoney: 1,
    area: "京都",
    location: { lat: 35.0116, lng: 135.7681, neighborhood: "京都市東山区祇園" },
    layout: "2K",
    style: "japanese",
    furniture: ["bed", "table", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Michiko",
      occupation: "着物仕立て職人",
      bio: "京都で着物の仕立てを20年。この町家の光と静けさの中で、集中して仕事ができました。",
      whyChoseThis: [
        { reason: "坪庭を望む和室。四季折々の景色が楽しめます", image: "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1034443906084847498/original/e5b1a5c2-8c0e-4f92-a6c1-9c9f8e7d6b5a.jpeg" },
        { reason: "リノベーションされた土間キッチン。料理好きにはたまらない", image: "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1034443906084847498/original/a3d2b1c0-9e8f-4a7b-b5c2-d1e0f9a8b7c6.jpeg" },
        { reason: "2階の書斎。祇園の街並みを見下ろせる特等席", image: "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1034443906084847498/original/c7e6d5f4-3a2b-4c8d-9e0f-1a2b3c4d5e6f.jpeg" },
      ],
      messageToNext: "京都の四季は町家の中にも入り込みます。夏の打ち水、秋の紅葉、冬の雪景色。日本の美しさをこの家で感じてください。",
      socialLinks: {
        instagram: "@michiko_kimono_kyoto",
      },
    },
    handoverDetails: {
      included: ["和室の家具一式", "坪庭の手入れ道具", "土間キッチンの調理器具", "座布団・布団一式"],
      notIncluded: ["着物・和装小物", "仕立て道具"],
      viewingAvailableFrom: "2026年2月15日〜",
      moveInAvailableFrom: "2026年3月15日〜",
    },
  },
  {
    id: "1515284949501830586",
    title: "福岡・天神の都心派ミニマリスト",
    summary: "必要なものだけで暮らす。天神駅徒歩3分、ミニマルで機能的な1K。",
    images: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-1234567890123456789/original/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-1234567890123456789/original/b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e.jpeg",
      "https://a0.muscache.com/im/pictures/miso/Hosting-1234567890123456789/original/c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f.jpeg",
    ],
    furnitureDescription:
      "無印良品で統一されたシンプルな家具。ベッド、デスク、収納のみ。余計なものがない快適空間。",
    status: "public",
    story:
      "ミニマリストとして5年。モノを減らすことで、本当に大切なものが見えてきました。転職で東京に行くことになり、同じ価値観の方に。",
    conditions: "ミニマルな暮らしを維持できる方。モノを増やさない方。",
    handoverFee: 35000,
    rent: 68000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 0,
    area: "福岡",
    location: { lat: 33.5902, lng: 130.4017, neighborhood: "福岡市中央区天神" },
    layout: "1K",
    style: "minimal",
    furniture: ["bed", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Ryo",
      occupation: "ITエンジニア",
      bio: "リモートワークのITエンジニア。最小限のモノで最大限の自由を追求しています。",
      whyChoseThis: [
        { reason: "無印のベッドフレーム。シンプルで寝心地も最高", image: "https://a0.muscache.com/im/pictures/miso/Hosting-1234567890123456789/original/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d.jpeg" },
        { reason: "作業用デスク。必要最小限で集中できる環境", image: "https://a0.muscache.com/im/pictures/miso/Hosting-1234567890123456789/original/b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e.jpeg" },
        { reason: "収納はこれだけ。でも十分", image: "https://a0.muscache.com/im/pictures/miso/Hosting-1234567890123456789/original/c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f.jpeg" },
      ],
      messageToNext: "モノが少ないと、掃除も簡単、引っ越しも楽、心も軽い。この部屋でミニマルライフを体験してください。",
      socialLinks: {
        twitter: "@ryo_minimal_life",
      },
    },
    handoverDetails: {
      included: ["無印良品ベッドフレーム", "デスク・チェア", "収納ユニット", "LED照明"],
      notIncluded: ["PC・モニター", "衣類"],
      viewingAvailableFrom: "2026年2月20日〜",
      moveInAvailableFrom: "2026年3月20日〜",
    },
  },
  {
    id: "1515284949501830587",
    title: "北海道・札幌の雪国コージー空間",
    summary: "冬は雪景色、夏は涼しい風。北海道ライフを満喫できる温かみのある2LDK。",
    images: [
      "https://a0.muscache.com/im/pictures/hosting/Hosting-9876543210987654321/original/d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-9876543210987654321/original/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-9876543210987654321/original/f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c.jpeg",
    ],
    furnitureDescription:
      "北欧家具とファブリック、薪ストーブ風ヒーター、厚手のラグ。寒い冬も快適に過ごせる温かい空間。",
    status: "public",
    story:
      "札幌で10年、雪国ライフを楽しんできました。スキー場まで車で30分、夏は涼しく快適。海外赴任が決まり、北海道を愛する方に。",
    conditions: "寒さを楽しめる方。冬の暮らしに興味がある方。",
    handoverFee: 65000,
    rent: 85000,
    managementFee: 6000,
    deposit: 1,
    keyMoney: 1,
    area: "北海道",
    location: { lat: 43.0621, lng: 141.3544, neighborhood: "札幌市中央区円山" },
    layout: "2LDK",
    style: "nordic",
    furniture: ["bed", "sofa", "dining", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Yuki",
      occupation: "スキーインストラクター / カフェ経営",
      bio: "冬はスキーインストラクター、夏はカフェ経営。北海道の四季を全力で楽しんでいます。",
      whyChoseThis: [
        { reason: "大きな窓から見える雪景色。冬の朝は格別", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-9876543210987654321/original/d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a.jpeg" },
        { reason: "北欧スタイルのリビング。厚手のラグで足元も暖か", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-9876543210987654321/original/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b.jpeg" },
        { reason: "ダイニングテーブル。友人を招いて鍋パーティーも", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-9876543210987654321/original/f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c.jpeg" },
      ],
      messageToNext: "北海道の冬は厳しいけど、その分楽しみ方もたくさんある。スキー、温泉、美味しいご飯。この部屋で北海道ライフを始めてください。",
      socialLinks: {
        instagram: "@yuki_hokkaido_life",
      },
    },
    handoverDetails: {
      included: ["北欧家具一式", "薪ストーブ風ヒーター", "厚手ラグ・カーテン", "冬用寝具", "スキー用品収納"],
      notIncluded: ["スキー・スノーボード", "冬用衣類"],
      viewingAvailableFrom: "2026年3月1日〜",
      moveInAvailableFrom: "2026年4月1日〜",
    },
  },
  {
    id: "1515284949501830588",
    title: "名古屋・栄のスタイリッシュ都市生活",
    summary: "名古屋の中心地で暮らす。モダンなインテリアと利便性を兼ね備えた1LDK。",
    images: [
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1122334455667788990/original/a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1122334455667788990/original/b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1122334455667788990/original/c9d0e1f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f.jpeg",
    ],
    furnitureDescription:
      "モダンなソファ、ガラストップのダイニングテーブル、大型テレビ。都会的でスタイリッシュな空間。",
    status: "public",
    story:
      "名古屋で営業職として7年。栄の便利さと、この部屋の居心地の良さが仕事の活力でした。大阪に転勤になり、名古屋ライフを楽しめる方に。",
    conditions: "都会的な暮らしを楽しめる方。綺麗に使ってくれる方。",
    handoverFee: 50000,
    rent: 92000,
    managementFee: 7000,
    deposit: 2,
    keyMoney: 1,
    area: "愛知",
    location: { lat: 35.1706, lng: 136.9066, neighborhood: "名古屋市中区栄" },
    layout: "1LDK",
    style: "modern",
    furniture: ["bed", "sofa", "dining", "tv"],
    condition: "excellent",
    handoverHost: {
      name: "Takuya",
      occupation: "営業職",
      bio: "名古屋で営業として働きながら、週末は東海エリアのグルメ巡りを楽しんでいます。",
      whyChoseThis: [
        { reason: "夜景が見えるリビング。仕事終わりのビールが最高", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1122334455667788990/original/a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d.jpeg" },
        { reason: "広々としたベッドルーム。質の良い睡眠が取れます", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1122334455667788990/original/b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e.jpeg" },
        { reason: "使いやすいキッチン。自炊派にもおすすめ", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1122334455667788990/original/c9d0e1f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f.jpeg" },
      ],
      messageToNext: "栄は名古屋の中心。どこに行くにも便利で、飲み屋もカフェも充実。名古屋ライフを満喫してください。",
      socialLinks: {
        instagram: "@takuya_nagoya",
      },
    },
    handoverDetails: {
      included: ["モダン家具一式", "55インチテレビ", "ダイニングセット", "調理器具"],
      notIncluded: ["個人の衣類", "書籍"],
      viewingAvailableFrom: "2026年2月10日〜",
      moveInAvailableFrom: "2026年3月1日〜",
    },
  },
  {
    id: "1515284949501830589",
    title: "沖縄・那覇のリゾートスタイル",
    summary: "沖縄の青い海と空。リゾート気分で暮らせるアイランドスタイルの1LDK。",
    images: [
      "https://a0.muscache.com/im/pictures/hosting/Hosting-5544332211009988776/original/d0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f5a.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-5544332211009988776/original/e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-5544332211009988776/original/f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c.jpeg",
    ],
    furnitureDescription:
      "籐製の家具、ハンモック、観葉植物。沖縄の風を感じるトロピカルな空間。",
    status: "public",
    story:
      "沖縄移住して8年。海でシュノーケリング、週末はビーチでBBQ。この暮らしが大好きでしたが、家族の事情で本土に戻ることに。沖縄を愛してくれる方に。",
    conditions: "沖縄の自然を大切にできる方。ゆったりした暮らしが好きな方。",
    handoverFee: 45000,
    rent: 72000,
    managementFee: 4000,
    deposit: 1,
    keyMoney: 0,
    area: "沖縄",
    location: { lat: 26.2124, lng: 127.6809, neighborhood: "那覇市首里" },
    layout: "1LDK",
    style: "bohemian",
    furniture: ["bed", "sofa", "storage"],
    condition: "good",
    handoverHost: {
      name: "Mana",
      occupation: "ダイビングインストラクター",
      bio: "沖縄の海に惚れ込んで移住。ダイビングインストラクターとして、海の魅力を伝えています。",
      whyChoseThis: [
        { reason: "風が通り抜けるリビング。エアコンなしでも涼しい日も", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-5544332211009988776/original/d0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f5a.jpeg" },
        { reason: "ベランダのハンモック。昼寝の特等席", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-5544332211009988776/original/e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b.jpeg" },
        { reason: "植物に囲まれた寝室。南国気分で目覚められる", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-5544332211009988776/original/f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c.jpeg" },
      ],
      messageToNext: "沖縄時間でゆったり暮らす幸せ。海、空、風、全部が癒し。この島のパワーを感じながら暮らしてください。",
      socialLinks: {
        instagram: "@mana_okinawa_sea",
      },
    },
    handoverDetails: {
      included: ["籐製家具", "ハンモック", "観葉植物", "シュノーケリング用品収納"],
      notIncluded: ["ダイビング器材", "衣類"],
      viewingAvailableFrom: "2026年3月15日〜",
      moveInAvailableFrom: "2026年4月15日〜",
    },
  },
  {
    id: "1504655411015512190",
    title: "浅草の静かな隠れ家ホテル",
    summary: "浅草の喧騒から離れた静かなエリアに佇む、心落ち着く空間。観光地へのアクセスも良好で、東京の下町情緒を感じながら暮らせます。",
    images: [
      "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/bb21e1bf-0672-4140-8dde-095385e96077.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1504655411015512190/original/9714d4af-7c9e-42e5-95bd-25032a5b30a4.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/485df1be-863c-4e12-b0b6-bd2e6c1366ae.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1504655411015512190/original/9e988292-0ad6-4ffd-9eca-498dc91a1c88.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/f14ce289-8fb1-4c4f-9e67-023b25b4f12b.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/3f33a7c8-3aad-464b-8222-83f969b887ae.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/c9d5d340-a794-44f3-b84e-3dd3552fc458.jpeg",
      "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/fc717b8e-bb1c-4b51-ada0-79220ac55026.jpeg",
    ],
    furnitureDescription:
      "シンプルでモダンな家具が揃った空間。ベッド、デスク、収納など必要なものが一通り揃っています。",
    status: "public",
    story:
      "浅草の下町情緒を感じながら、静かに過ごせる空間を作り上げました。浅草寺や仲見世通りへのアクセスも良く、東京の伝統と現代が融合したエリアでの暮らしを楽しめます。",
    conditions: "浅草の雰囲気を楽しめる方。静かに過ごしたい方に最適です。",
    handoverFee: 50000,
    rent: 95000,
    managementFee: 5000,
    deposit: 1,
    keyMoney: 1,
    area: "東京",
    location: { lat: 35.7192, lng: 139.8003, neighborhood: "台東区浅草" },
    layout: "1K",
    style: "modern",
    furniture: ["bed", "desk", "storage"],
    condition: "excellent",
    handoverHost: {
      name: "Komorebi",
      occupation: "ホテルオーナー",
      bio: "浅草で静かな宿を運営しています。下町の温かさと快適な滞在を両立させた空間づくりを心がけています。",
      whyChoseThis: [
        { reason: "浅草寺まで徒歩圏内。朝の静かな参拝が日課になります", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1504655411015512190/original/9714d4af-7c9e-42e5-95bd-25032a5b30a4.jpeg" },
        { reason: "シンプルで機能的なインテリア。必要なものが全て揃った快適空間", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/485df1be-863c-4e12-b0b6-bd2e6c1366ae.jpeg" },
        { reason: "自然光がたっぷり入る明るい室内。心地よい朝を迎えられます", image: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTUwNDY1NTQxMTAxNTUxMjE5MA==/original/f14ce289-8fb1-4c4f-9e67-023b25b4f12b.jpeg" },
      ],
      messageToNext: "浅草は東京の中でも特別なエリアです。観光地としての賑わいがある一方で、一歩路地に入ると静かな下町の風景が広がります。この部屋で東京の新しい一面を発見してください。",
      socialLinks: {
        instagram: "@komorebi_asakusa",
      },
    },
    propertyDetails: {
      layout: "1K",
    },
    handoverDetails: {
      included: ["ベッド", "デスク", "収納家具", "調理器具", "食器類"],
      notIncluded: ["個人の衣類", "消耗品"],
      viewingAvailableFrom: "2026年5月1日〜",
      moveInAvailableFrom: "2026年5月15日〜",
    },
    faq: [
      {
        question: "浅草寺へのアクセスは？",
        answer: "徒歩約10分です。朝の静かな時間帯の参拝がおすすめです。",
      },
      {
        question: "周辺の治安はどうですか？",
        answer: "観光地ですが、夜も静かで安全なエリアです。",
      },
    ],
  },
]

export function getPropertiesByArea(): Record<string, Property[]> {
  const publicProperties = properties.filter((p) => p.status === "public")
  return publicProperties.reduce(
    (acc, property) => {
      if (!acc[property.area]) {
        acc[property.area] = []
      }
      acc[property.area].push(property)
      return acc
    },
    {} as Record<string, Property[]>,
  )
}

// 家具タイプの日本語ラベル
export const furnitureLabels: Record<LargeFurnitureType, string> = {
  bed: "ベッド",
  sofa: "ソファ",
  desk: "デスク",
  table: "テーブル",
  storage: "収納",
  dining: "ダイニング",
  wardrobe: "ワードローブ",
  tv: "テレビ台",
  fridge: "冷蔵庫",
}

// UserListingをProperty形式に変換
export function convertUserListingToProperty(listing: UserListing): Property {
  const furnitureDescription = listing.furniture
    ?.map((f) => furnitureLabels[f] || f)
    .join("、") || ""

  return {
    id: listing.id,
    title: listing.title || "タイトル未設定",
    summary: listing.story || "",
    images: listing.roomPhotos || [],
    furnitureDescription,
    furniture: listing.furniture,
    status: "public",
    story: listing.story || "",
    conditions: "要相談",
    handoverFee: listing.handoverFee || 50000,
    rent: listing.rent,
    managementFee: listing.managementFee,
    area: listing.area || "東京",
    layout: listing.layout,
    style: listing.roomStyle || undefined,
    propertyDetails: listing.layout ? { layout: listing.layout } : undefined,
    handoverDetails: (listing.viewingAvailableFrom || listing.moveInAvailableFrom) ? {
      included: [],
      notIncluded: [],
      viewingAvailableFrom: listing.viewingAvailableFrom,
      moveInAvailableFrom: listing.moveInAvailableFrom,
    } : undefined,
  }
}

export function getPublicProperties(): Property[] {
  return properties.filter((p) => p.status === "public")
}

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id)
}

// Mock Inquiry Data (引き継ぎ申し込み)
export const inquiries: Inquiry[] = [
  {
    id: "inq_001",
    propertyId: "1",
    propertyTitle: "アートと植物に囲まれたワンルーム",
    status: "pending",
    applicantName: "田中 花子",
    applicantEmail: "tanaka@example.com",
    reason: "植物が大好きで、この部屋の雰囲気に一目惚れしました。レコードプレーヤーもあり、音楽を聴きながら植物の世話をする暮らしに憧れています。",
    questions: "植物の世話について詳しく教えていただけますか？",
    submittedAt: "2026-01-15T10:30:00Z",
    updatedAt: "2026-01-15T10:30:00Z",
  },
  {
    id: "inq_002",
    propertyId: "2",
    propertyTitle: "DJ/プロデューサーの音楽制作空間",
    status: "decided",
    applicantName: "佐藤 太郎",
    applicantEmail: "sato@example.com",
    reason: "DJとして活動しており、この防音環境と機材に魅力を感じました。レコードコレクションを引き継げるのも嬉しいです。",
    submittedAt: "2026-01-12T15:45:00Z",
    updatedAt: "2026-01-14T09:20:00Z",
    notes: "内見完了。引き継ぎ決定。",
  },
  {
    id: "inq_003",
    propertyId: "1",
    propertyTitle: "アートと植物に囲まれたワンルーム",
    status: "pending",
    applicantName: "鈴木 美咲",
    applicantEmail: "suzuki@example.com",
    reason: "グラフィックデザイナーとして、こういう創作意欲が湧く空間を探していました。",
    submittedAt: "2026-01-10T08:15:00Z",
    updatedAt: "2026-01-11T16:30:00Z",
    notes: "内見調整中",
  },
  {
    id: "inq_004",
    propertyId: "3",
    propertyTitle: "北欧ミニマルな1DK",
    status: "completed",
    applicantName: "佐藤 太郎",
    applicantEmail: "sato@example.com",
    reason: "シンプルで落ち着いた空間が気に入りました。",
    submittedAt: "2025-12-28T14:20:00Z",
    updatedAt: "2026-01-05T12:00:00Z",
    notes: "引き継ぎ完了。",
  },
  {
    id: "inq_005",
    propertyId: "4",
    propertyTitle: "ヴィンテージ家具のある部屋",
    status: "pending",
    applicantName: "田中 花子",
    applicantEmail: "tanaka@example.com",
    reason: "ヴィンテージ家具に興味がありました。",
    submittedAt: "2026-01-08T09:00:00Z",
    updatedAt: "2026-01-09T15:00:00Z",
  },
]

// Mock Seller Listing Data
export const hostListings: SellerListing[] = [
  {
    id: "host_001",
    status: "pending",
    sellerName: "山本 太郎",
    sellerEmail: "yamamoto@example.com",
    sellerPhone: "090-1111-2222",
    propertyAddress: "東京都渋谷区",
    moveOutDate: "2026-04-30",
    furnitureDescription: "北欧家具一式、ヴィンテージのダイニングテーブル、観葉植物多数",
    whyListing: "海外転勤が決まり、大切にしてきた家具を次の人に引き継ぎたいです。",
    landlordConsent: true,
    submittedAt: "2026-01-16T11:00:00Z",
    updatedAt: "2026-01-16T11:00:00Z",
  },
  {
    id: "host_002",
    status: "approved",
    sellerName: "高橋 春子",
    sellerEmail: "takahashi@example.com",
    sellerPhone: "090-3333-4444",
    propertyAddress: "東京都世田谷区",
    moveOutDate: "2026-03-31",
    furnitureDescription: "手作りの本棚、アンティーク照明、ベッドフレーム",
    whyListing: "引っ越しすることになり、この部屋での思い出を大切にしてくれる人に譲りたいです。",
    landlordConsent: true,
    submittedAt: "2026-01-08T14:20:00Z",
    updatedAt: "2026-01-10T10:00:00Z",
    notes: "ヒアリング完了。掲載準備中。",
  },
]

// Inquiry functions
export function getAllInquiries(): Inquiry[] {
  return inquiries.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function getInquiriesByProperty(propertyId: string): Inquiry[] {
  return inquiries
    .filter((inq) => inq.propertyId === propertyId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function getInquiryById(id: string): Inquiry | undefined {
  return inquiries.find((inq) => inq.id === id)
}

// Seller Listing functions
export function getAllSellerListings(): SellerListing[] {
  return hostListings.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function getSellerListingById(id: string): SellerListing | undefined {
  return hostListings.find((listing) => listing.id === id)
}
