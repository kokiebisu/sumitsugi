export interface Amenity {
  type: string // "coffee", "records", "dj", etc.
  details?: string // 機種名や詳細情報
}

// HostProfile (クリエイタープロフィール) データ型
export interface HostProfile {
  occupation: string
  bio: string
  socialLinks?: {
    instagram?: string
    twitter?: string
    website?: string
    youtube?: string
    tiktok?: string
  }
  rating?: number
  reviewCount?: number
  yearsHosting?: number
  hostSince: string // ISO日付文字列
}

// User (ユーザー) データ型
// Airbnb風: 全ユーザーは入居希望者、ホスト登録でisHost=trueに
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
  isHost: boolean
  isAdmin?: boolean

  // ホストプロフィール（isHost=trueの場合のみ）
  hostProfile?: HostProfile
}

// Inquiry (問い合わせ) データ型
export interface Inquiry {
  id: string
  propertyId: string
  propertyTitle: string
  status: "pending" | "approved" | "viewing_scheduled" | "completed" | "rejected"
  applicantName: string
  applicantEmail: string
  reason: string // 興味を持った理由
  duration?: string // 契約期間
  questions?: string // 質問
  viewingDate?: string // 内見日時
  submittedAt: string
  updatedAt: string
  notes?: string // 運営メモ
}

// Host Listing (物件掲載申込) データ型
export interface HostListing {
  id: string
  status: "pending" | "approved" | "published" | "rejected"
  hostName: string
  hostEmail: string
  hostPhone: string
  propertyAddress: string
  monthlyRent: number
  moveOutDate: string
  furnitureDescription: string
  whyListing: string
  landlordConsent: boolean
  submittedAt: string
  updatedAt: string
  notes?: string // 運営メモ
  publishedPropertyId?: string // 公開された物件ID
}

// User Listing (ユーザーが作成したリスティング) データ型
export interface UserListing {
  id: string
  userId: string
  status: "draft" | "published"
  title: string
  lifestyles: string[]
  roomStyle: string | null
  story: string
  amenities: string[]
  furniture: string[]
  furnitureDetails?: Record<string, { brand: string; model: string }>
  roomPhotos: string[]
  interiorPhotos: Array<{
    id: string
    photo?: string
    caption: string
  }>
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface Property {
  id: string
  title: string
  summary: string
  images: string[]
  furnitureDescription: string
  estimatedDuration: string
  status: "draft" | "public"
  story: string
  conditions: string
  landlordRules?: string
  monthlyRent: number
  interiorFee: number
  area: string
  style?: string // e.g., "scandinavian", "industrial", "bohemian", "minimal", "vintage", "modern", etc.
  basicAmenities?: string[] // 基本的な設備（冷蔵庫、洗濯機など）
  condition?: "excellent" | "good" | "used" // インテリア・家具の状態
  amenities?: Amenity[] // こだわりの機材・家具の詳細
  fees?: {
    deposit?: number // 敷金
    keyMoney?: number // 礼金
    managementFee?: number // 管理費・共益費
    guaranteeFee?: number // 保証会社利用料
    cleaningFee?: number // クリーニング代
  }
  host?: {
    name: string
    occupation: string
    bio: string
    avatar?: string
    rating?: number // 1-5の評価
    reviewCount?: number // レビュー数
    yearsHosting?: number // 活動歴（年数）
    whyChoseThis?: Array<{ reason: string; image?: string }> // この部屋を選んだ理由（3つのポイント）
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
    size: number // 専有面積（㎡）
    floor: string // 階数（例：3階/5階建）
    buildYear: number // 築年（例：2015）
    facilities?: string[] // 設備（例：バス・トイレ別、独立洗面台）
  }
  // エリア情報
  locationInfo?: {
    nearestStation: string // 最寄り駅
    walkingMinutes: number // 徒歩分数
    areaDescription?: string // エリアの雰囲気説明
    nearbyPlaces?: Array<{ name: string; distance: string }> // 周辺施設
    creatorRecommendations?: string[] // クリエイターのおすすめスポット
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "グラフィックデザイナーとして活動しながら、この部屋を自分だけのギャラリーのように育ててきました。窓辺の植物たちに水をやり、好きなレコードをかけながら作業する日々。海外での仕事が決まり、この空間を大切にしてくれる方に引き継ぎたいと思っています。",
    conditions: "植物の世話ができる方。アートやカルチャーが好きな方だと嬉しいです。",
    landlordRules: "ペット不可。楽器演奏は20時まで。ゴミ出しは指定日に。",
    monthlyRent: 95000,
    interiorFee: 150000,
    area: "東京",
    style: "bohemian",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "plants" },
      { type: "records", details: "Technics SL-1200MK7" },
      { type: "art" },
      { type: "skateboard" },
    ],
    fees: {
      deposit: 95000,
      keyMoney: 0,
      managementFee: 8000,
      cleaningFee: 30000,
    },
    host: {
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
      size: 25,
      floor: "3階/5階建",
      buildYear: 2018,
      facilities: ["バス・トイレ別", "独立洗面台", "フローリング", "室内洗濯機置場"],
    },
    locationInfo: {
      nearestStation: "中目黒駅",
      walkingMinutes: 7,
      areaDescription: "目黒川沿いの閑静な住宅街。春は桜、カフェやギャラリーが点在する文化的なエリアです。",
      nearbyPlaces: [
        { name: "スーパー", distance: "徒歩3分" },
        { name: "コンビニ", distance: "徒歩2分" },
        { name: "目黒川", distance: "徒歩5分" },
        { name: "代官山駅", distance: "徒歩12分" },
      ],
      creatorRecommendations: ["Onibus Coffee", "蔦屋書店", "目黒川沿いの散歩道"],
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "DJとして活動しながら、週末は自宅でイベントを開催してきました。コンクリートの音響と、機材を囲んだ空間が最高です。海外ツアーが決まり、同じように音楽を愛する方に使ってもらえたら嬉しいです。レコードコレクションも一部そのまま使えます。",
    conditions: "音楽制作をする方歓迎。深夜の音出しOK（防音済み）。機材の扱いに慣れている方優先。",
    landlordRules: "22時以降の大音量は控えめに。共用部分は清潔に保つこと。来客時は事前連絡。",
    monthlyRent: 120000,
    interiorFee: 150000,
    area: "東京",
    style: "industrial",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "防音設備"],
    condition: "excellent",
    amenities: [
      { type: "dj", details: "Pioneer DJ XDJ-RX3" },
      { type: "music", details: "Ableton Live 11 Suite" },
      { type: "records", details: "Technics SL-1200MK7 x2" },
      { type: "coffee", details: "La Marzocco Linea Mini" },
      { type: "workspace", details: "Herman Miller Aeron Chair" },
    ],
    fees: {
      deposit: 120000,
      keyMoney: 120000,
      managementFee: 10000,
      cleaningFee: 35000,
    },
    host: {
      name: "Takeshi",
      occupation: "DJ / Music Producer",
      bio: "週末はクラブでDJをしながら、平日は自宅で楽曲制作をしています。音楽と共に生きる毎日。海外ツアーに行くので、この空間を音楽仲間に託したいです。",
      rating: 4.95,
      reviewCount: 38,
      yearsHosting: 3,
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
      size: 32,
      floor: "2階/4階建",
      buildYear: 2015,
      facilities: ["バス・トイレ別", "防音壁", "コンクリート打ちっぱなし", "フローリング", "室内洗濯機置場"],
    },
    locationInfo: {
      nearestStation: "中目黒駅",
      walkingMinutes: 9,
      areaDescription: "音楽好きが集まるクリエイティブなエリア。深夜まで営業するバーやレコードショップが点在し、カルチャーを感じる街です。",
      nearbyPlaces: [
        { name: "ファミリーマート", distance: "徒歩1分" },
        { name: "スーパー", distance: "徒歩4分" },
        { name: "レコードショップ", distance: "徒歩6分" },
        { name: "クラブ・ライブハウス", distance: "徒歩8分" },
      ],
      creatorRecommendations: ["Lighthouse Records", "Contact Tokyo", "中目黒高架下"],
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "古着屋を営みながら、仕事帰りに少しずつ集めた家具たち。この部屋で過ごす時間が一番落ち着きます。店舗を移転することになり、この空間を気に入ってくれる方に譲りたいです。",
    conditions: "ヴィンテージ品を大切にしてくれる方。喫煙不可。",
    landlordRules: "ペット不可。楽器不可。火気厳禁。",
    monthlyRent: 88000,
    interiorFee: 120000,
    area: "東京",
    style: "vintage",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン"],
    condition: "used",
    amenities: [
      { type: "books" },
      { type: "vintage" },
      { type: "workspace" },
    ],
    fees: {
      deposit: 88000,
      keyMoney: 88000,
      managementFee: 6000,
      cleaningFee: 25000,
    },
    host: {
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "画家として活動しながら、この広い空間でインスピレーションを得てきました。光の入り方、天井の高さ、すべてが創作に向いている部屋です。レジデンスプログラムで海外に行くことになり、同じくアーティストの方に引き継いでもらえたらと思っています。",
    conditions: "創作活動をされている方優先。作品制作に使っていただいて構いません。",
    landlordRules: "制作時の音や匂いは近隣に配慮を。共用部への作品保管は禁止。",
    monthlyRent: 135000,
    interiorFee: 200000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "食器洗い機"],
    condition: "good",
    amenities: [
      { type: "art" },
      { type: "workspace", details: "IKEA BEKANT デスク" },
      { type: "plants" },
    ],
    fees: {
      deposit: 135000,
      keyMoney: 135000,
      managementFee: 12000,
      cleaningFee: 40000,
    },
    host: {
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
    estimatedDuration: "2〜5ヶ月",
    status: "public",
    story:
      "プロダクトデザイナーとして、このインダストリアルな空間でプロトタイプを作ってきました。天井高があるので、大きな作品も制作可能。新しいアトリエに移ることになり、ものづくりが好きな方に使ってほしいです。",
    conditions: "DIYや制作活動OK。音が出る作業は要相談。",
    landlordRules: "危険物の持ち込み禁止。工具使用は21時まで。",
    monthlyRent: 110000,
    interiorFee: 90000,
    area: "東京",
    style: "industrial",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "workspace", details: "無垢材の作業台" },
      { type: "tools", details: "Bosch 電動工具セット" },
      { type: "coffee", details: "Bialetti モカエキスプレス" },
    ],
    fees: {
      deposit: 110000,
      keyMoney: 0,
      managementFee: 8000,
      cleaningFee: 30000,
    },
    host: {
      name: "Kento",
      occupation: "プロダクトデザイナー",
      bio: "プロダクトデザイナーとして、このインダストリアルな空間でプロトタイプを作ってきました。天井高があるので、大きな作品も制作可能。",
      whyChoseThis: [
        { reason: "アイアンフレームのベッド。無骨さが気に入っています", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_01-2.jpeg" },
        { reason: "工業用照明。本物の工場で使われていたものを再利用", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_02-1.jpg" },
        { reason: "古い作業台をリメイクしたデスク。長時間の作業にも耐える頑丈さ", image: "https://www.mensnonno.jp/wp-content/uploads/2025/09/room_20250927_03-1.jpg" },
      ],
      messageToNext: "ものづくりをする人にとって、この空間は最高の環境だと思います。無骨なコンクリートの壁が、かえって創造力を刺激してくれる。次の方も、ここで素晴らしい作品を生み出してください。",
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
    estimatedDuration: "1〜3ヶ月",
    status: "public",
    story:
      "IT企業で働きながら、頭をクリアに保つためにものを減らしてきました。この部屋にいると集中できる。海外転勤が決まり、同じようにシンプルな暮らしを求める方に引き継ぎたいです。",
    conditions: "ミニマルな状態を維持できる方。整理整頓が好きな方向け。",
    landlordRules: "ペット不可。物の増やしすぎに注意。定期清掃あり。",
    monthlyRent: 145000,
    interiorFee: 60000,
    area: "東京",
    style: "minimal",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "浄水器"],
    condition: "excellent",
    amenities: [
      { type: "workspace", details: "無印良品 パイン材デスク" },
      { type: "minimal" },
    ],
    fees: {
      deposit: 145000,
      keyMoney: 145000,
      managementFee: 15000,
      cleaningFee: 35000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "フリーランスのライターとして世界を旅しながら、気に入ったものを少しずつ持ち帰ってきました。高円寺の街の雰囲気とこの部屋がぴったり合っています。長期の取材旅行に出るため、旅好きな方に託したいです。",
    conditions: "エスニック雑貨を大切にしてくれる方。猫を飼っていた名残があります。",
    landlordRules: "小型ペット相談可。火気注意。共用部での喫煙禁止。",
    monthlyRent: 78000,
    interiorFee: 100000,
    area: "東京",
    style: "bohemian",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "used",
    amenities: [
      { type: "books" },
      { type: "travel" },
      { type: "plants" },
      { type: "pets" },
    ],
    fees: {
      deposit: 78000,
      keyMoney: 0,
      managementFee: 5000,
      cleaningFee: 20000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "インテリアショップで働きながら、少しずつ集めてきた北欧家具たち。この部屋は私のショールームでもありました。転勤で手放すことになりましたが、家具を大切にしてくれる方に引き継ぎたいです。",
    conditions: "家具を大切に扱える方。北欧デザインが好きな方優先。",
    landlordRules: "ペット不可。喫煙不可。",
    monthlyRent: 155000,
    interiorFee: 350000,
    area: "東京",
    style: "scandinavian",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "床暖房"],
    condition: "excellent",
    amenities: [
      { type: "vintage", details: "北欧ヴィンテージ家具" },
      { type: "workspace", details: "USMシェルフ" },
    ],
    fees: {
      deposit: 155000,
      keyMoney: 155000,
      managementFee: 12000,
      cleaningFee: 40000,
    },
    host: {
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
      size: 48,
      floor: "5階/8階建",
      buildYear: 2019,
      facilities: ["バス・トイレ別", "独立洗面台", "床暖房", "宅配ボックス"],
    },
    locationInfo: {
      nearestStation: "目黒駅",
      walkingMinutes: 8,
      areaDescription: "閑静な住宅街。目黒川も近く、春は桜が楽しめます。",
      nearbyPlaces: [
        { name: "成城石井", distance: "徒歩3分" },
        { name: "目黒川", distance: "徒歩5分" },
      ],
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
    estimatedDuration: "1〜3ヶ月",
    status: "public",
    story:
      "映像クリエイターとして、機材以外はできるだけシンプルに暮らしてきました。ロフトは寝室、下は作業スペースと完全に分けています。仕事の拠点を移すことになり、同じく制作活動をされている方にぴったりの空間です。",
    conditions: "ミニマルな暮らしを維持できる方。在宅ワークの方にもおすすめ。",
    landlordRules: "ペット不可。楽器不可。",
    monthlyRent: 72000,
    interiorFee: 50000,
    area: "東京",
    style: "minimal",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "workspace" },
      { type: "minimal" },
    ],
    fees: {
      deposit: 72000,
      keyMoney: 72000,
      managementFee: 5000,
      cleaningFee: 25000,
    },
    host: {
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
    estimatedDuration: "2〜5ヶ月",
    status: "public",
    story:
      "建築事務所で働いていたころから、いつかこういう空間に住みたいと思っていました。内見して即契約。4年間大切に暮らしてきた空間です。海外プロジェクトに参加することになり、引き継ぎ先を探しています。",
    conditions: "素材感を大切にできる方。インテリアが好きな方歓迎。",
    landlordRules: "ペット相談可。喫煙不可。",
    monthlyRent: 168000,
    interiorFee: 200000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "食器洗い機"],
    condition: "excellent",
    amenities: [
      { type: "workspace" },
      { type: "coffee", details: "Kalita コーヒーセット" },
    ],
    fees: {
      deposit: 168000,
      keyMoney: 168000,
      managementFee: 15000,
      cleaningFee: 45000,
    },
    host: {
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
      size: 52,
      floor: "3階/5階建",
      buildYear: 2020,
      facilities: ["バス・トイレ別", "独立洗面台", "モルタル仕上げ", "無垢フローリング"],
    },
    locationInfo: {
      nearestStation: "代々木上原駅",
      walkingMinutes: 6,
      areaDescription: "代々木公園が近く、緑豊かな住環境。おしゃれなカフェやレストランも多いエリア。",
      nearbyPlaces: [
        { name: "代々木公園", distance: "徒歩8分" },
        { name: "スーパー", distance: "徒歩4分" },
      ],
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "陶芸家として独立してから5年。この部屋で多くの作品を生み出してきました。窯は近くの共同アトリエを使っています。地方に拠点を移すことになり、同じくものづくりをする方に使ってほしいです。",
    conditions: "制作活動をする方優先。DIY好きな方歓迎。",
    landlordRules: "原状回復可能な範囲でDIY可。23時以降の作業音は控えめに。",
    monthlyRent: 85000,
    interiorFee: 80000,
    area: "東京",
    style: "industrial",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン"],
    condition: "used",
    amenities: [
      { type: "workspace", details: "DIY作業台" },
      { type: "tools" },
      { type: "art" },
    ],
    fees: {
      deposit: 85000,
      keyMoney: 0,
      managementFee: 5000,
      cleaningFee: 25000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "アパレルブランドのデザイナーとして、色の力を信じています。この部屋は私の色彩感覚の実験場でした。海外ブランドとのコラボで渡航することになり、同じく色を楽しめる方に引き継ぎたいです。",
    conditions: "カラフルなインテリアを楽しめる方。センスのある方優先。",
    landlordRules: "ペット不可。喫煙不可。壁への直接ペイント禁止。",
    monthlyRent: 142000,
    interiorFee: 180000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "art" },
      { type: "workspace" },
    ],
    fees: {
      deposit: 142000,
      keyMoney: 142000,
      managementFee: 12000,
      cleaningFee: 35000,
    },
    host: {
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
    estimatedDuration: "1〜3ヶ月",
    status: "public",
    story:
      "外資系コンサルで働きながら、仕事後にリラックスできる空間を追求してきました。白い空間は頭をクリアにしてくれます。転職を機に引っ越すことになり、同じように仕事に集中したい方におすすめです。",
    conditions: "清潔感を保てる方。在宅ワークの方にも最適。",
    landlordRules: "ペット不可。喫煙不可。",
    monthlyRent: 175000,
    interiorFee: 150000,
    area: "東京",
    style: "minimal",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "浄水器"],
    condition: "excellent",
    amenities: [
      { type: "workspace" },
      { type: "minimal" },
    ],
    fees: {
      deposit: 175000,
      keyMoney: 175000,
      managementFee: 18000,
      cleaningFee: 45000,
    },
    host: {
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "リノベーション会社で働きながら、実験的にこの物件を改修しました。自分で壁を塗り、床を張り替え、3ヶ月かけて完成させた愛着のある空間です。新しいプロジェクトのため、この部屋を次の方に託します。",
    conditions: "DIYやリノベーションに興味がある方。古いものを愛せる方。",
    landlordRules: "大家さんと良好な関係を維持。原状回復不要（相談済）。",
    monthlyRent: 98000,
    interiorFee: 120000,
    area: "東京",
    style: "vintage",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "vintage" },
      { type: "tools" },
      { type: "workspace" },
    ],
    fees: {
      deposit: 98000,
      keyMoney: 0,
      managementFee: 6000,
      cleaningFee: 30000,
    },
    host: {
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
      size: 42,
      floor: "2階/4階建",
      buildYear: 1985,
      facilities: ["バス・トイレ別", "リノベーション済", "古材フローリング"],
    },
    locationInfo: {
      nearestStation: "学芸大学駅",
      walkingMinutes: 7,
      areaDescription: "商店街が活気のある街。古着屋やカフェも多く、のんびりした雰囲気。",
      nearbyPlaces: [
        { name: "学芸大学駅前商店街", distance: "徒歩2分" },
        { name: "スーパー", distance: "徒歩3分" },
      ],
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "植物園で働きながら、自宅もジャングルのようにしてしまいました。朝起きて植物に水をやる時間が一番好き。海外の植物園に研修に行くことになり、植物好きな方に託したいです。",
    conditions: "植物の世話ができる方必須。水やりスケジュールをお伝えします。",
    landlordRules: "ペット不可。喫煙不可。",
    monthlyRent: 105000,
    interiorFee: 180000,
    area: "東京",
    style: "bohemian",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "plants", details: "観葉植物100鉢以上" },
      { type: "vintage" },
    ],
    fees: {
      deposit: 105000,
      keyMoney: 105000,
      managementFee: 8000,
      cleaningFee: 30000,
    },
    host: {
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "フォトグラファーとして独立後、自宅をスタジオ兼住居として使ってきました。窓からの光が最高で、ポートレート撮影に最適です。海外を拠点にすることになり、同じく写真を仕事にしている方に使ってほしいです。",
    conditions: "撮影やクリエイティブな仕事をしている方優先。",
    landlordRules: "商用撮影OK。深夜の来客は要相談。",
    monthlyRent: 158000,
    interiorFee: 120000,
    area: "東京",
    style: "minimal",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "excellent",
    amenities: [
      { type: "workspace", details: "撮影スタジオ" },
      { type: "camera" },
    ],
    fees: {
      deposit: 158000,
      keyMoney: 158000,
      managementFee: 12000,
      cleaningFee: 40000,
    },
    host: {
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
    estimatedDuration: "2〜5ヶ月",
    status: "public",
    story:
      "家具デザインを学んだあと、ヴィンテージ家具の買い付けを仕事にしてきました。この部屋は私のコレクションの一部です。独立してショップを開くため、引き継ぎ先を探しています。",
    conditions: "ヴィンテージ家具を大切にできる方。家具の価値がわかる方優先。",
    landlordRules: "ペット不可。喫煙不可。",
    monthlyRent: 185000,
    interiorFee: 500000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "excellent",
    amenities: [
      { type: "vintage", details: "ミッドセンチュリー家具" },
      { type: "art" },
    ],
    fees: {
      deposit: 185000,
      keyMoney: 185000,
      managementFee: 15000,
      cleaningFee: 45000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "スタートアップで働きながら、この開放的な空間でアイデアを練ってきました。天井の高さが思考を広げてくれる気がします。会社の移転に伴い、同じく自由な発想を大切にする方に。",
    conditions: "開放的な空間を楽しめる方。ロフトの上り下りが苦にならない方。",
    landlordRules: "ペット相談可。DIY相談可。",
    monthlyRent: 138000,
    interiorFee: 100000,
    area: "東京",
    style: "industrial",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "workspace" },
      { type: "hammock" },
    ],
    fees: {
      deposit: 138000,
      keyMoney: 138000,
      managementFee: 10000,
      cleaningFee: 35000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "茶道を習いながら、和の暮らしを実践してきました。この部屋で点てるお茶は格別です。京都に移住することになり、同じく日本文化を愛する方に引き継ぎたいです。",
    conditions: "畳の部屋を大切にできる方。和の暮らしに興味がある方。",
    landlordRules: "ペット不可。土足厳禁。",
    monthlyRent: 125000,
    interiorFee: 80000,
    area: "東京",
    style: "minimal",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン"],
    condition: "excellent",
    amenities: [
      { type: "tea", details: "茶道具一式" },
      { type: "traditional" },
    ],
    fees: {
      deposit: 125000,
      keyMoney: 125000,
      managementFee: 10000,
      cleaningFee: 30000,
    },
    host: {
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
    estimatedDuration: "2〜5ヶ月",
    status: "public",
    story:
      "YouTubeでDIY動画を配信しながら、この部屋を実験台にしてきました。賃貸でもここまでできる！という証明です。次の物件でまた挑戦するため、DIY好きな方に引き継ぎます。",
    conditions: "DIYを継続できる方。現状維持でもOKです。",
    landlordRules: "原状回復可能なDIYのみ。大きな穴あけ禁止。",
    monthlyRent: 68000,
    interiorFee: 60000,
    area: "東京",
    style: "industrial",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "workspace" },
      { type: "tools", details: "DIY工具" },
    ],
    fees: {
      deposit: 68000,
      keyMoney: 0,
      managementFee: 5000,
      cleaningFee: 20000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "バリスタとして働きながら、自宅でも本格的なコーヒーが淹れられる環境を整えてきました。朝のコーヒータイムが一日のハイライト。開業準備のため、コーヒー好きな方にこの空間を。",
    conditions: "コーヒー好きな方。器具の扱いに慣れている方優先。",
    landlordRules: "焙煎時は換気必須。火気注意。",
    monthlyRent: 118000,
    interiorFee: 200000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "excellent",
    amenities: [
      { type: "coffee", details: "La Marzocco GS3" },
      { type: "roaster", details: "Aillio Bullet R1" },
    ],
    fees: {
      deposit: 118000,
      keyMoney: 118000,
      managementFee: 10000,
      cleaningFee: 35000,
    },
    host: {
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
    estimatedDuration: "2〜5ヶ月",
    status: "public",
    story:
      "映画評論の仕事をしながら、自宅を最高の視聴環境にしてきました。週末は友人を呼んで上映会。転職で拠点を移すことになり、映画愛のある方に託します。",
    conditions: "映画好きな方。機材を大切に扱える方。",
    landlordRules: "深夜の大音量は禁止。近隣への配慮を。",
    monthlyRent: 135000,
    interiorFee: 250000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "excellent",
    amenities: [
      { type: "theater", details: "EPSON EH-TW9400" },
      { type: "audio", details: "Bose Lifestyle 650" },
    ],
    fees: {
      deposit: 135000,
      keyMoney: 135000,
      managementFee: 12000,
      cleaningFee: 40000,
    },
    host: {
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "料理教室を主宰しながら、自宅キッチンを作り込んできました。このキッチンで何百ものレシピが生まれました。海外で修行することになり、料理を仕事にしている方に使ってほしいです。",
    conditions: "料理を仕事にしている方優先。撮影利用も可。",
    landlordRules: "換気扇は常時使用。油汚れは都度清掃。",
    monthlyRent: 165000,
    interiorFee: 300000,
    area: "東京",
    style: "modern",
    basicAmenities: ["業務用冷蔵庫", "洗濯機", "大型オーブン", "エアコン", "Wi-Fi", "食器洗い機"],
    condition: "excellent",
    amenities: [
      { type: "kitchen", details: "業務用キッチン" },
      { type: "cooking" },
    ],
    fees: {
      deposit: 165000,
      keyMoney: 165000,
      managementFee: 15000,
      cleaningFee: 50000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "編集者として働きながら、ひたすら本を集めてきました。この部屋で過ごす静かな時間が宝物です。地方の出版社に転職することになり、同じく本を愛する方に。",
    conditions: "本を大切にできる方。静かな環境を好む方。",
    landlordRules: "楽器不可。大きな音を出す作業禁止。",
    monthlyRent: 128000,
    interiorFee: 150000,
    area: "東京",
    style: "vintage",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "books", details: "蔵書3000冊" },
      { type: "workspace" },
    ],
    fees: {
      deposit: 128000,
      keyMoney: 128000,
      managementFee: 10000,
      cleaningFee: 35000,
    },
    host: {
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
    estimatedDuration: "1〜3ヶ月",
    status: "public",
    story:
      "ヨガインストラクターとして、この部屋で毎朝プラクティスを続けてきました。東向きの窓から入る朝日が最高。海外でヨガを学ぶため、心身を整える暮らしを求める方に。",
    conditions: "静かな暮らしを好む方。ヨガや瞑想に興味がある方。",
    landlordRules: "ペット不可。喫煙不可。",
    monthlyRent: 112000,
    interiorFee: 50000,
    area: "東京",
    style: "minimal",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi", "浄水器"],
    condition: "excellent",
    amenities: [
      { type: "yoga" },
      { type: "meditation" },
      { type: "minimal" },
    ],
    fees: {
      deposit: 112000,
      keyMoney: 112000,
      managementFee: 8000,
      cleaningFee: 25000,
    },
    host: {
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
    estimatedDuration: "3〜6ヶ月",
    status: "public",
    story:
      "週末はバイクをいじり、平日は眺めて過ごす。そんなバイク中心の生活を送ってきました。転勤で手放すことになり、同じくバイクを愛する方に最高の環境を引き継ぎます。",
    conditions: "バイク乗りの方優先。ガレージを大切に使える方。",
    landlordRules: "深夜のエンジン音禁止。オイル等の廃棄は適切に。",
    monthlyRent: 145000,
    interiorFee: 100000,
    area: "東京",
    style: "industrial",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "good",
    amenities: [
      { type: "garage", details: "バイク2台可" },
      { type: "tools", details: "整備工具一式" },
    ],
    fees: {
      deposit: 145000,
      keyMoney: 145000,
      managementFee: 12000,
      cleaningFee: 35000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "獣医として働きながら、犬1匹と猫2匹と暮らしてきました。この部屋はペットのために作った空間です。海外の動物病院で研修することになり、ペットと暮らす方に引き継ぎたいです。",
    conditions: "ペットと暮らしている方優先。動物好きな方。",
    landlordRules: "犬猫合計3匹まで。定期的な清掃必須。",
    monthlyRent: 158000,
    interiorFee: 80000,
    area: "東京",
    style: "scandinavian",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "used",
    amenities: [
      { type: "pets", details: "ペット可（犬猫OK）" },
      { type: "catWalk" },
    ],
    fees: {
      deposit: 158000,
      keyMoney: 0,
      managementFee: 12000,
      cleaningFee: 40000,
    },
    host: {
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
    estimatedDuration: "2〜5ヶ月",
    status: "public",
    story:
      "マーケターとして働きながら、週末はテラスでBBQパーティーを開催してきました。夜景を見ながらのビールは最高です。海外赴任のため、この開放的な空間を楽しめる方に。",
    conditions: "アウトドア好きな方。テラスを活用できる方。",
    landlordRules: "BBQは月2回まで。22時以降は静かに。",
    monthlyRent: 178000,
    interiorFee: 120000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "Wi-Fi"],
    condition: "excellent",
    amenities: [
      { type: "terrace", details: "20㎡のルーフテラス" },
      { type: "bbq", details: "Weber グリル" },
    ],
    fees: {
      deposit: 178000,
      keyMoney: 178000,
      managementFee: 15000,
      cleaningFee: 45000,
    },
    host: {
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
    estimatedDuration: "2〜4ヶ月",
    status: "public",
    story:
      "プロゲーマーとして活動しながら、配信環境を完璧に整えてきました。この部屋で何千時間もプレイしてきた愛着のある空間です。チーム移籍で引っ越すため、ゲーム好きな方に。",
    conditions: "ゲームや配信をする方優先。機材を大切に扱える方。",
    landlordRules: "深夜の大声禁止。回線は光回線1Gbps。",
    monthlyRent: 142000,
    interiorFee: 350000,
    area: "東京",
    style: "modern",
    basicAmenities: ["冷蔵庫", "洗濯機", "電子レンジ", "エアコン", "光回線1Gbps"],
    condition: "excellent",
    amenities: [
      { type: "gaming", details: "RTX 4090搭載PC" },
      { type: "streaming", details: "配信機材一式" },
    ],
    fees: {
      deposit: 142000,
      keyMoney: 142000,
      managementFee: 12000,
      cleaningFee: 35000,
    },
    host: {
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

export function getPublicProperties(): Property[] {
  return properties.filter((p) => p.status === "public")
}

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id)
}

// Mock Inquiry Data
export const inquiries: Inquiry[] = [
  {
    id: "inq_001",
    propertyId: "1",
    propertyTitle: "アートと植物に囲まれたワンルーム",
    status: "pending",
    applicantName: "田中 花子",
    applicantEmail: "tanaka@example.com",
    reason: "植物が大好きで、この部屋の雰囲気に一目惚れしました。レコードプレーヤーもあり、音楽を聴きながら植物の世話をする暮らしに憧れています。",
    duration: "3〜4ヶ月",
    questions: "植物の世話について詳しく教えていただけますか？",
    submittedAt: "2026-01-15T10:30:00Z",
    updatedAt: "2026-01-15T10:30:00Z",
  },
  {
    id: "inq_002",
    propertyId: "2",
    propertyTitle: "DJ/プロデューサーの音楽制作空間",
    status: "viewing_scheduled",
    applicantName: "佐藤 太郎",
    applicantEmail: "sato@example.com",
    reason: "DJとして活動しており、この防音環境と機材に魅力を感じました。レコードコレクションを引き継げるのも嬉しいです。",
    duration: "6ヶ月程度",
    viewingDate: "2026-01-20T14:00:00Z",
    submittedAt: "2026-01-12T15:45:00Z",
    updatedAt: "2026-01-14T09:20:00Z",
    notes: "内見日時確定。クリエイターから高評価。",
  },
  {
    id: "inq_003",
    propertyId: "1",
    propertyTitle: "アートと植物に囲まれたワンルーム",
    status: "approved",
    applicantName: "鈴木 美咲",
    applicantEmail: "suzuki@example.com",
    reason: "グラフィックデザイナーとして、こういう創作意欲が湧く空間を探していました。",
    duration: "2〜3ヶ月",
    submittedAt: "2026-01-10T08:15:00Z",
    updatedAt: "2026-01-11T16:30:00Z",
    notes: "内見調整中",
  },
]

// Mock Host Listing Data
export const hostListings: HostListing[] = [
  {
    id: "host_001",
    status: "pending",
    hostName: "山本 太郎",
    hostEmail: "yamamoto@example.com",
    hostPhone: "090-1111-2222",
    propertyAddress: "東京都渋谷区",
    monthlyRent: 120000,
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
    hostName: "高橋 春子",
    hostEmail: "takahashi@example.com",
    hostPhone: "090-3333-4444",
    propertyAddress: "東京都世田谷区",
    monthlyRent: 95000,
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

// Host Listing functions
export function getAllHostListings(): HostListing[] {
  return hostListings.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function getHostListingById(id: string): HostListing | undefined {
  return hostListings.find((listing) => listing.id === id)
}
