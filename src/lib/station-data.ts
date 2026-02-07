// 東京近郊の主要駅データ
// 実際のプロダクションでは駅すぱあとAPIやNavitimeAPIなどを使用することを推奨

export interface Station {
  name: string;
  line: string;
  area: string;
}

export const TOKYO_STATIONS: Station[] = [
  // JR山手線
  { name: '渋谷', line: 'JR山手線', area: '渋谷区' },
  { name: '原宿', line: 'JR山手線', area: '渋谷区' },
  { name: '代々木', line: 'JR山手線', area: '渋谷区' },
  { name: '新宿', line: 'JR山手線', area: '新宿区' },
  { name: '新大久保', line: 'JR山手線', area: '新宿区' },
  { name: '高田馬場', line: 'JR山手線', area: '新宿区' },
  { name: '目白', line: 'JR山手線', area: '豊島区' },
  { name: '池袋', line: 'JR山手線', area: '豊島区' },
  { name: '大塚', line: 'JR山手線', area: '豊島区' },
  { name: '巣鴨', line: 'JR山手線', area: '豊島区' },
  { name: '駒込', line: 'JR山手線', area: '豊島区' },
  { name: '田端', line: 'JR山手線', area: '北区' },
  { name: '西日暮里', line: 'JR山手線', area: '荒川区' },
  { name: '日暮里', line: 'JR山手線', area: '荒川区' },
  { name: '鶯谷', line: 'JR山手線', area: '台東区' },
  { name: '上野', line: 'JR山手線', area: '台東区' },
  { name: '御徒町', line: 'JR山手線', area: '台東区' },
  { name: '秋葉原', line: 'JR山手線', area: '千代田区' },
  { name: '神田', line: 'JR山手線', area: '千代田区' },
  { name: '東京', line: 'JR山手線', area: '千代田区' },
  { name: '有楽町', line: 'JR山手線', area: '千代田区' },
  { name: '新橋', line: 'JR山手線', area: '港区' },
  { name: '浜松町', line: 'JR山手線', area: '港区' },
  { name: '田町', line: 'JR山手線', area: '港区' },
  { name: '高輪ゲートウェイ', line: 'JR山手線', area: '港区' },
  { name: '品川', line: 'JR山手線', area: '港区' },
  { name: '大崎', line: 'JR山手線', area: '品川区' },
  { name: '五反田', line: 'JR山手線', area: '品川区' },
  { name: '目黒', line: 'JR山手線', area: '品川区' },
  { name: '恵比寿', line: 'JR山手線', area: '渋谷区' },

  // 東京メトロ銀座線
  { name: '表参道', line: '東京メトロ銀座線', area: '港区' },
  { name: '外苑前', line: '東京メトロ銀座線', area: '港区' },
  { name: '青山一丁目', line: '東京メトロ銀座線', area: '港区' },
  { name: '赤坂見附', line: '東京メトロ銀座線', area: '港区' },
  { name: '溜池山王', line: '東京メトロ銀座線', area: '港区' },
  { name: '虎ノ門', line: '東京メトロ銀座線', area: '港区' },
  { name: '銀座', line: '東京メトロ銀座線', area: '中央区' },
  { name: '京橋', line: '東京メトロ銀座線', area: '中央区' },
  { name: '日本橋', line: '東京メトロ銀座線', area: '中央区' },
  { name: '三越前', line: '東京メトロ銀座線', area: '中央区' },
  { name: '末広町', line: '東京メトロ銀座線', area: '千代田区' },
  { name: '上野広小路', line: '東京メトロ銀座線', area: '台東区' },
  { name: '稲荷町', line: '東京メトロ銀座線', area: '台東区' },
  { name: '田原町', line: '東京メトロ銀座線', area: '台東区' },
  { name: '浅草', line: '東京メトロ銀座線', area: '台東区' },

  // 東京メトロ日比谷線
  { name: '中目黒', line: '東京メトロ日比谷線', area: '目黒区' },
  { name: '恵比寿', line: '東京メトロ日比谷線', area: '渋谷区' },
  { name: '広尾', line: '東京メトロ日比谷線', area: '渋谷区' },
  { name: '六本木', line: '東京メトロ日比谷線', area: '港区' },
  { name: '神谷町', line: '東京メトロ日比谷線', area: '港区' },
  { name: '霞ケ関', line: '東京メトロ日比谷線', area: '千代田区' },
  { name: '日比谷', line: '東京メトロ日比谷線', area: '千代田区' },
  { name: '茅場町', line: '東京メトロ日比谷線', area: '中央区' },
  { name: '人形町', line: '東京メトロ日比谷線', area: '中央区' },
  { name: '小伝馬町', line: '東京メトロ日比谷線', area: '中央区' },
  { name: '秋葉原', line: '東京メトロ日比谷線', area: '千代田区' },
  { name: '仲御徒町', line: '東京メトロ日比谷線', area: '台東区' },
  { name: '入谷', line: '東京メトロ日比谷線', area: '台東区' },
  { name: '三ノ輪', line: '東京メトロ日比谷線', area: '台東区' },
  { name: '南千住', line: '東京メトロ日比谷線', area: '荒川区' },
  { name: '北千住', line: '東京メトロ日比谷線', area: '足立区' },

  // 東京メトロ副都心線
  { name: '渋谷', line: '東京メトロ副都心線', area: '渋谷区' },
  { name: '明治神宮前', line: '東京メトロ副都心線', area: '渋谷区' },
  { name: '北参道', line: '東京メトロ副都心線', area: '渋谷区' },
  { name: '新宿三丁目', line: '東京メトロ副都心線', area: '新宿区' },
  { name: '東新宿', line: '東京メトロ副都心線', area: '新宿区' },
  { name: '西早稲田', line: '東京メトロ副都心線', area: '新宿区' },
  { name: '雑司が谷', line: '東京メトロ副都心線', area: '豊島区' },
  { name: '池袋', line: '東京メトロ副都心線', area: '豊島区' },

  // 東急東横線
  { name: '渋谷', line: '東急東横線', area: '渋谷区' },
  { name: '代官山', line: '東急東横線', area: '渋谷区' },
  { name: '中目黒', line: '東急東横線', area: '目黒区' },
  { name: '祐天寺', line: '東急東横線', area: '目黒区' },
  { name: '学芸大学', line: '東急東横線', area: '目黒区' },
  { name: '都立大学', line: '東急東横線', area: '目黒区' },
  { name: '自由が丘', line: '東急東横線', area: '目黒区' },
  { name: '田園調布', line: '東急東横線', area: '大田区' },
  { name: '多摩川', line: '東急東横線', area: '大田区' },
  { name: '新丸子', line: '東急東横線', area: '川崎市' },
  { name: '武蔵小杉', line: '東急東横線', area: '川崎市' },
  { name: '元住吉', line: '東急東横線', area: '川崎市' },
  { name: '日吉', line: '東急東横線', area: '横浜市' },
  { name: '綱島', line: '東急東横線', area: '横浜市' },
  { name: '大倉山', line: '東急東横線', area: '横浜市' },
  { name: '菊名', line: '東急東横線', area: '横浜市' },
  { name: '妙蓮寺', line: '東急東横線', area: '横浜市' },
  { name: '白楽', line: '東急東横線', area: '横浜市' },
  { name: '東白楽', line: '東急東横線', area: '横浜市' },
  { name: '反町', line: '東急東横線', area: '横浜市' },
  { name: '横浜', line: '東急東横線', area: '横浜市' },

  // 東急田園都市線
  { name: '渋谷', line: '東急田園都市線', area: '渋谷区' },
  { name: '池尻大橋', line: '東急田園都市線', area: '世田谷区' },
  { name: '三軒茶屋', line: '東急田園都市線', area: '世田谷区' },
  { name: '駒沢大学', line: '東急田園都市線', area: '世田谷区' },
  { name: '桜新町', line: '東急田園都市線', area: '世田谷区' },
  { name: '用賀', line: '東急田園都市線', area: '世田谷区' },
  { name: '二子玉川', line: '東急田園都市線', area: '世田谷区' },
  { name: '二子新地', line: '東急田園都市線', area: '川崎市' },
  { name: '高津', line: '東急田園都市線', area: '川崎市' },
  { name: '溝の口', line: '東急田園都市線', area: '川崎市' },
  { name: '梶が谷', line: '東急田園都市線', area: '川崎市' },
  { name: '宮崎台', line: '東急田園都市線', area: '川崎市' },
  { name: '宮前平', line: '東急田園都市線', area: '川崎市' },
  { name: '鷺沼', line: '東急田園都市線', area: '川崎市' },
  { name: 'たまプラーザ', line: '東急田園都市線', area: '横浜市' },
  { name: 'あざみ野', line: '東急田園都市線', area: '横浜市' },

  // 京王線
  { name: '新宿', line: '京王線', area: '新宿区' },
  { name: '笹塚', line: '京王線', area: '渋谷区' },
  { name: '代田橋', line: '京王線', area: '杉並区' },
  { name: '明大前', line: '京王線', area: '世田谷区' },
  { name: '下高井戸', line: '京王線', area: '世田谷区' },
  { name: '桜上水', line: '京王線', area: '世田谷区' },
  { name: '上北沢', line: '京王線', area: '世田谷区' },
  { name: '八幡山', line: '京王線', area: '世田谷区' },
  { name: '芦花公園', line: '京王線', area: '世田谷区' },
  { name: '千歳烏山', line: '京王線', area: '世田谷区' },
  { name: '仙川', line: '京王線', area: '調布市' },
  { name: 'つつじヶ丘', line: '京王線', area: '調布市' },
  { name: '柴崎', line: '京王線', area: '調布市' },
  { name: '国領', line: '京王線', area: '調布市' },
  { name: '布田', line: '京王線', area: '調布市' },
  { name: '調布', line: '京王線', area: '調布市' },

  // 京王井の頭線
  { name: '渋谷', line: '京王井の頭線', area: '渋谷区' },
  { name: '神泉', line: '京王井の頭線', area: '渋谷区' },
  { name: '駒場東大前', line: '京王井の頭線', area: '目黒区' },
  { name: '池ノ上', line: '京王井の頭線', area: '世田谷区' },
  { name: '下北沢', line: '京王井の頭線', area: '世田谷区' },
  { name: '新代田', line: '京王井の頭線', area: '世田谷区' },
  { name: '東松原', line: '京王井の頭線', area: '世田谷区' },
  { name: '明大前', line: '京王井の頭線', area: '世田谷区' },
  { name: '永福町', line: '京王井の頭線', area: '杉並区' },
  { name: '西永福', line: '京王井の頭線', area: '杉並区' },
  { name: '浜田山', line: '京王井の頭線', area: '杉並区' },
  { name: '高井戸', line: '京王井の頭線', area: '杉並区' },
  { name: '富士見ヶ丘', line: '京王井の頭線', area: '杉並区' },
  { name: '久我山', line: '京王井の頭線', area: '杉並区' },
  { name: '三鷹台', line: '京王井の頭線', area: '三鷹市' },
  { name: '井の頭公園', line: '京王井の頭線', area: '三鷹市' },
  { name: '吉祥寺', line: '京王井の頭線', area: '武蔵野市' },

  // 小田急線
  { name: '新宿', line: '小田急線', area: '新宿区' },
  { name: '南新宿', line: '小田急線', area: '渋谷区' },
  { name: '参宮橋', line: '小田急線', area: '渋谷区' },
  { name: '代々木八幡', line: '小田急線', area: '渋谷区' },
  { name: '代々木上原', line: '小田急線', area: '渋谷区' },
  { name: '東北沢', line: '小田急線', area: '世田谷区' },
  { name: '下北沢', line: '小田急線', area: '世田谷区' },
  { name: '世田谷代田', line: '小田急線', area: '世田谷区' },
  { name: '梅ヶ丘', line: '小田急線', area: '世田谷区' },
  { name: '豪徳寺', line: '小田急線', area: '世田谷区' },
  { name: '経堂', line: '小田急線', area: '世田谷区' },
  { name: '千歳船橋', line: '小田急線', area: '世田谷区' },
  { name: '祖師ヶ谷大蔵', line: '小田急線', area: '世田谷区' },
  { name: '成城学園前', line: '小田急線', area: '世田谷区' },
  { name: '喜多見', line: '小田急線', area: '世田谷区' },
  { name: '狛江', line: '小田急線', area: '狛江市' },
  { name: '和泉多摩川', line: '小田急線', area: '狛江市' },
  { name: '登戸', line: '小田急線', area: '川崎市' },

  // JR中央線
  { name: '東京', line: 'JR中央線', area: '千代田区' },
  { name: '神田', line: 'JR中央線', area: '千代田区' },
  { name: '御茶ノ水', line: 'JR中央線', area: '千代田区' },
  { name: '水道橋', line: 'JR中央線', area: '千代田区' },
  { name: '飯田橋', line: 'JR中央線', area: '千代田区' },
  { name: '市ケ谷', line: 'JR中央線', area: '千代田区' },
  { name: '四ツ谷', line: 'JR中央線', area: '新宿区' },
  { name: '信濃町', line: 'JR中央線', area: '新宿区' },
  { name: '千駄ケ谷', line: 'JR中央線', area: '渋谷区' },
  { name: '代々木', line: 'JR中央線', area: '渋谷区' },
  { name: '新宿', line: 'JR中央線', area: '新宿区' },
  { name: '大久保', line: 'JR中央線', area: '新宿区' },
  { name: '東中野', line: 'JR中央線', area: '中野区' },
  { name: '中野', line: 'JR中央線', area: '中野区' },
  { name: '高円寺', line: 'JR中央線', area: '杉並区' },
  { name: '阿佐ケ谷', line: 'JR中央線', area: '杉並区' },
  { name: '荻窪', line: 'JR中央線', area: '杉並区' },
  { name: '西荻窪', line: 'JR中央線', area: '杉並区' },
  { name: '吉祥寺', line: 'JR中央線', area: '武蔵野市' },
  { name: '三鷹', line: 'JR中央線', area: '三鷹市' },

  // 都営大江戸線
  { name: '新宿西口', line: '都営大江戸線', area: '新宿区' },
  { name: '東新宿', line: '都営大江戸線', area: '新宿区' },
  { name: '若松河田', line: '都営大江戸線', area: '新宿区' },
  { name: '牛込柳町', line: '都営大江戸線', area: '新宿区' },
  { name: '牛込神楽坂', line: '都営大江戸線', area: '新宿区' },
  { name: '飯田橋', line: '都営大江戸線', area: '千代田区' },
  { name: '春日', line: '都営大江戸線', area: '文京区' },
  { name: '本郷三丁目', line: '都営大江戸線', area: '文京区' },
  { name: '上野御徒町', line: '都営大江戸線', area: '台東区' },
  { name: '新御徒町', line: '都営大江戸線', area: '台東区' },
  { name: '蔵前', line: '都営大江戸線', area: '台東区' },
  { name: '両国', line: '都営大江戸線', area: '墨田区' },
  { name: '森下', line: '都営大江戸線', area: '江東区' },
  { name: '清澄白河', line: '都営大江戸線', area: '江東区' },
  { name: '門前仲町', line: '都営大江戸線', area: '江東区' },
  { name: '月島', line: '都営大江戸線', area: '中央区' },
  { name: '勝どき', line: '都営大江戸線', area: '中央区' },
  { name: '築地市場', line: '都営大江戸線', area: '中央区' },
  { name: '汐留', line: '都営大江戸線', area: '港区' },
  { name: '大門', line: '都営大江戸線', area: '港区' },
  { name: '赤羽橋', line: '都営大江戸線', area: '港区' },
  { name: '麻布十番', line: '都営大江戸線', area: '港区' },
  { name: '六本木', line: '都営大江戸線', area: '港区' },
  { name: '青山一丁目', line: '都営大江戸線', area: '港区' },
  { name: '国立競技場', line: '都営大江戸線', area: '新宿区' },
  { name: '代々木', line: '都営大江戸線', area: '渋谷区' },
  { name: '新宿', line: '都営大江戸線', area: '新宿区' },
  { name: '都庁前', line: '都営大江戸線', area: '新宿区' },
  { name: '西新宿五丁目', line: '都営大江戸線', area: '新宿区' },
  { name: '中野坂上', line: '都営大江戸線', area: '中野区' },
  { name: '東中野', line: '都営大江戸線', area: '中野区' },
  { name: '中井', line: '都営大江戸線', area: '新宿区' },
  { name: '落合南長崎', line: '都営大江戸線', area: '新宿区' },
  { name: '新江古田', line: '都営大江戸線', area: '中野区' },
  { name: '練馬', line: '都営大江戸線', area: '練馬区' },
  { name: '豊島園', line: '都営大江戸線', area: '練馬区' },
  { name: '練馬春日町', line: '都営大江戸線', area: '練馬区' },
  { name: '光が丘', line: '都営大江戸線', area: '練馬区' },

  // 東京メトロ半蔵門線
  { name: '渋谷', line: '東京メトロ半蔵門線', area: '渋谷区' },
  { name: '表参道', line: '東京メトロ半蔵門線', area: '港区' },
  { name: '青山一丁目', line: '東京メトロ半蔵門線', area: '港区' },
  { name: '永田町', line: '東京メトロ半蔵門線', area: '千代田区' },
  { name: '半蔵門', line: '東京メトロ半蔵門線', area: '千代田区' },
  { name: '九段下', line: '東京メトロ半蔵門線', area: '千代田区' },
  { name: '神保町', line: '東京メトロ半蔵門線', area: '千代田区' },
  { name: '大手町', line: '東京メトロ半蔵門線', area: '千代田区' },
  { name: '三越前', line: '東京メトロ半蔵門線', area: '中央区' },
  { name: '水天宮前', line: '東京メトロ半蔵門線', area: '中央区' },
  { name: '清澄白河', line: '東京メトロ半蔵門線', area: '江東区' },
  { name: '住吉', line: '東京メトロ半蔵門線', area: '江東区' },
  { name: '錦糸町', line: '東京メトロ半蔵門線', area: '墨田区' },
  { name: '押上', line: '東京メトロ半蔵門線', area: '墨田区' },
];

// 駅名で検索（部分一致）
export function searchStations(query: string, limit = 10): Station[] {
  if (!query || query.length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // 完全一致を優先
  const exactMatches = TOKYO_STATIONS.filter(
    (station) => station.name.toLowerCase() === normalizedQuery
  );

  // 前方一致
  const prefixMatches = TOKYO_STATIONS.filter(
    (station) =>
      station.name.toLowerCase().startsWith(normalizedQuery) &&
      !exactMatches.includes(station)
  );

  // 部分一致
  const partialMatches = TOKYO_STATIONS.filter(
    (station) =>
      station.name.toLowerCase().includes(normalizedQuery) &&
      !exactMatches.includes(station) &&
      !prefixMatches.includes(station)
  );

  // 重複を除去（同じ駅名は1つだけ表示）
  const seen = new Set<string>();
  const uniqueResults: Station[] = [];

  for (const station of [
    ...exactMatches,
    ...prefixMatches,
    ...partialMatches,
  ]) {
    if (!seen.has(station.name)) {
      seen.add(station.name);
      uniqueResults.push(station);
    }
    if (uniqueResults.length >= limit) break;
  }

  return uniqueResults;
}
