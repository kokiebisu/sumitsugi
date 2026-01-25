// Geocoding service for reverse geocoding (coordinates to address)
// Uses GSI (国土地理院) API as primary, Nominatim as fallback

export interface JapaneseAddress {
  country: "日本";
  postalCode: string;
  prefecture: string;
  city: string;
  district: string;
  streetAddress: string;
  buildingInfo?: string;
}

export interface ReverseGeocodeInput {
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  success: boolean;
  address?: JapaneseAddress;
  neighborhood?: string;
  error?: string;
}

// GSI API response type
interface GSIResponse {
  results?: {
    muniCd: string;
    lv01Nm: string;
  };
}

// Nominatim API response type
interface NominatimResponse {
  address?: {
    postcode?: string;
    country?: string;
    state?: string;
    city?: string;
    suburb?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
  };
  error?: string;
}

// Municipality code to prefecture/city mapping
// Format: { prefCode: string, prefName: string, cityName: string }
const MUNICIPALITY_MAP: Record<
  string,
  { prefName: string; cityName: string }
> = {
  // Tokyo (13)
  "13101": { prefName: "東京都", cityName: "千代田区" },
  "13102": { prefName: "東京都", cityName: "中央区" },
  "13103": { prefName: "東京都", cityName: "港区" },
  "13104": { prefName: "東京都", cityName: "新宿区" },
  "13105": { prefName: "東京都", cityName: "文京区" },
  "13106": { prefName: "東京都", cityName: "台東区" },
  "13107": { prefName: "東京都", cityName: "墨田区" },
  "13108": { prefName: "東京都", cityName: "江東区" },
  "13109": { prefName: "東京都", cityName: "品川区" },
  "13110": { prefName: "東京都", cityName: "目黒区" },
  "13111": { prefName: "東京都", cityName: "大田区" },
  "13112": { prefName: "東京都", cityName: "世田谷区" },
  "13113": { prefName: "東京都", cityName: "渋谷区" },
  "13114": { prefName: "東京都", cityName: "中野区" },
  "13115": { prefName: "東京都", cityName: "杉並区" },
  "13116": { prefName: "東京都", cityName: "豊島区" },
  "13117": { prefName: "東京都", cityName: "北区" },
  "13118": { prefName: "東京都", cityName: "荒川区" },
  "13119": { prefName: "東京都", cityName: "板橋区" },
  "13120": { prefName: "東京都", cityName: "練馬区" },
  "13121": { prefName: "東京都", cityName: "足立区" },
  "13122": { prefName: "東京都", cityName: "葛飾区" },
  "13123": { prefName: "東京都", cityName: "江戸川区" },
  // Kanagawa (14)
  "14100": { prefName: "神奈川県", cityName: "横浜市" },
  "14101": { prefName: "神奈川県", cityName: "横浜市鶴見区" },
  "14102": { prefName: "神奈川県", cityName: "横浜市神奈川区" },
  "14103": { prefName: "神奈川県", cityName: "横浜市西区" },
  "14104": { prefName: "神奈川県", cityName: "横浜市中区" },
  "14105": { prefName: "神奈川県", cityName: "横浜市南区" },
  "14106": { prefName: "神奈川県", cityName: "横浜市保土ケ谷区" },
  "14107": { prefName: "神奈川県", cityName: "横浜市磯子区" },
  "14108": { prefName: "神奈川県", cityName: "横浜市金沢区" },
  "14109": { prefName: "神奈川県", cityName: "横浜市港北区" },
  "14110": { prefName: "神奈川県", cityName: "横浜市戸塚区" },
  "14111": { prefName: "神奈川県", cityName: "横浜市港南区" },
  "14112": { prefName: "神奈川県", cityName: "横浜市旭区" },
  "14113": { prefName: "神奈川県", cityName: "横浜市緑区" },
  "14114": { prefName: "神奈川県", cityName: "横浜市瀬谷区" },
  "14115": { prefName: "神奈川県", cityName: "横浜市栄区" },
  "14116": { prefName: "神奈川県", cityName: "横浜市泉区" },
  "14117": { prefName: "神奈川県", cityName: "横浜市青葉区" },
  "14118": { prefName: "神奈川県", cityName: "横浜市都筑区" },
  "14130": { prefName: "神奈川県", cityName: "川崎市" },
  "14131": { prefName: "神奈川県", cityName: "川崎市川崎区" },
  "14132": { prefName: "神奈川県", cityName: "川崎市幸区" },
  "14133": { prefName: "神奈川県", cityName: "川崎市中原区" },
  "14134": { prefName: "神奈川県", cityName: "川崎市高津区" },
  "14135": { prefName: "神奈川県", cityName: "川崎市多摩区" },
  "14136": { prefName: "神奈川県", cityName: "川崎市宮前区" },
  "14137": { prefName: "神奈川県", cityName: "川崎市麻生区" },
  // Osaka (27)
  "27100": { prefName: "大阪府", cityName: "大阪市" },
  "27102": { prefName: "大阪府", cityName: "大阪市都島区" },
  "27103": { prefName: "大阪府", cityName: "大阪市福島区" },
  "27104": { prefName: "大阪府", cityName: "大阪市此花区" },
  "27106": { prefName: "大阪府", cityName: "大阪市西区" },
  "27107": { prefName: "大阪府", cityName: "大阪市港区" },
  "27108": { prefName: "大阪府", cityName: "大阪市大正区" },
  "27109": { prefName: "大阪府", cityName: "大阪市天王寺区" },
  "27111": { prefName: "大阪府", cityName: "大阪市浪速区" },
  "27113": { prefName: "大阪府", cityName: "大阪市西淀川区" },
  "27114": { prefName: "大阪府", cityName: "大阪市東淀川区" },
  "27115": { prefName: "大阪府", cityName: "大阪市東成区" },
  "27116": { prefName: "大阪府", cityName: "大阪市生野区" },
  "27117": { prefName: "大阪府", cityName: "大阪市旭区" },
  "27118": { prefName: "大阪府", cityName: "大阪市城東区" },
  "27119": { prefName: "大阪府", cityName: "大阪市阿倍野区" },
  "27120": { prefName: "大阪府", cityName: "大阪市住吉区" },
  "27121": { prefName: "大阪府", cityName: "大阪市東住吉区" },
  "27122": { prefName: "大阪府", cityName: "大阪市西成区" },
  "27123": { prefName: "大阪府", cityName: "大阪市淀川区" },
  "27124": { prefName: "大阪府", cityName: "大阪市鶴見区" },
  "27125": { prefName: "大阪府", cityName: "大阪市住之江区" },
  "27126": { prefName: "大阪府", cityName: "大阪市平野区" },
  "27127": { prefName: "大阪府", cityName: "大阪市北区" },
  "27128": { prefName: "大阪府", cityName: "大阪市中央区" },
};

// Fetch with timeout helper
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Primary: GSI Reverse Geocoder
async function reverseGeocodeWithGSI(
  input: ReverseGeocodeInput
): Promise<Partial<JapaneseAddress> | null> {
  try {
    const url = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${input.lat}&lon=${input.lng}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return null;
    }

    const data: GSIResponse = await response.json();

    if (!data.results?.muniCd) {
      return null;
    }

    const muniInfo = MUNICIPALITY_MAP[data.results.muniCd];
    if (!muniInfo) {
      // Try to extract prefecture from code (first 2 digits)
      const prefCode = data.results.muniCd.substring(0, 2);
      const prefName = getPrefectureByCode(prefCode);
      return {
        prefecture: prefName || "",
        city: "",
        district: data.results.lv01Nm || "",
      };
    }

    return {
      prefecture: muniInfo.prefName,
      city: muniInfo.cityName,
      district: data.results.lv01Nm || "",
    };
  } catch (error) {
    console.error("GSI reverse geocoding failed:", error);
    return null;
  }
}

// Fallback: Nominatim (OpenStreetMap) for postal code and additional info
async function reverseGeocodeWithNominatim(
  input: ReverseGeocodeInput
): Promise<Partial<JapaneseAddress> | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${input.lat}&lon=${input.lng}&accept-language=ja`;
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Tsumugi-App/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: NominatimResponse = await response.json();

    if (data.error || !data.address) {
      return null;
    }

    const addr = data.address;
    return {
      postalCode: addr.postcode || "",
      prefecture: addr.state || "",
      city: addr.city || addr.suburb || "",
      district: addr.neighbourhood || addr.suburb || "",
      streetAddress: [addr.road, addr.house_number].filter(Boolean).join(" "),
    };
  } catch (error) {
    console.error("Nominatim reverse geocoding failed:", error);
    return null;
  }
}

// Prefecture code mapping
function getPrefectureByCode(code: string): string | null {
  const prefectures: Record<string, string> = {
    "01": "北海道",
    "02": "青森県",
    "03": "岩手県",
    "04": "宮城県",
    "05": "秋田県",
    "06": "山形県",
    "07": "福島県",
    "08": "茨城県",
    "09": "栃木県",
    "10": "群馬県",
    "11": "埼玉県",
    "12": "千葉県",
    "13": "東京都",
    "14": "神奈川県",
    "15": "新潟県",
    "16": "富山県",
    "17": "石川県",
    "18": "福井県",
    "19": "山梨県",
    "20": "長野県",
    "21": "岐阜県",
    "22": "静岡県",
    "23": "愛知県",
    "24": "三重県",
    "25": "滋賀県",
    "26": "京都府",
    "27": "大阪府",
    "28": "兵庫県",
    "29": "奈良県",
    "30": "和歌山県",
    "31": "鳥取県",
    "32": "島根県",
    "33": "岡山県",
    "34": "広島県",
    "35": "山口県",
    "36": "徳島県",
    "37": "香川県",
    "38": "愛媛県",
    "39": "高知県",
    "40": "福岡県",
    "41": "佐賀県",
    "42": "長崎県",
    "43": "熊本県",
    "44": "大分県",
    "45": "宮崎県",
    "46": "鹿児島県",
    "47": "沖縄県",
  };
  return prefectures[code] || null;
}

// Create default empty address
export function createEmptyAddress(): JapaneseAddress {
  return {
    country: "日本",
    postalCode: "",
    prefecture: "",
    city: "",
    district: "",
    streetAddress: "",
    buildingInfo: "",
  };
}

// Main export: Reverse geocode with fallback
export async function reverseGeocode(
  input: ReverseGeocodeInput
): Promise<ReverseGeocodeResult> {
  try {
    // Try GSI first (more accurate for Japan)
    const gsiResult = await reverseGeocodeWithGSI(input);

    // Try Nominatim for postal code and additional info
    const nominatimResult = await reverseGeocodeWithNominatim(input);

    // Merge results, preferring GSI for location data
    if (!gsiResult && !nominatimResult) {
      return {
        success: false,
        error: "住所の取得に失敗しました",
      };
    }

    const address: JapaneseAddress = {
      country: "日本",
      postalCode: nominatimResult?.postalCode || "",
      prefecture: gsiResult?.prefecture || nominatimResult?.prefecture || "",
      city: gsiResult?.city || nominatimResult?.city || "",
      district: gsiResult?.district || nominatimResult?.district || "",
      streetAddress: nominatimResult?.streetAddress || "",
      buildingInfo: "",
    };

    // Generate neighborhood string for backward compatibility
    const neighborhood = [address.city, address.district]
      .filter(Boolean)
      .join("");

    return {
      success: true,
      address,
      neighborhood: neighborhood || address.prefecture,
    };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return {
      success: false,
      error: "住所の取得中にエラーが発生しました",
    };
  }
}

// Export prefecture list for dropdown
export const PREFECTURES = [
  { code: "01", name: "北海道" },
  { code: "02", name: "青森県" },
  { code: "03", name: "岩手県" },
  { code: "04", name: "宮城県" },
  { code: "05", name: "秋田県" },
  { code: "06", name: "山形県" },
  { code: "07", name: "福島県" },
  { code: "08", name: "茨城県" },
  { code: "09", name: "栃木県" },
  { code: "10", name: "群馬県" },
  { code: "11", name: "埼玉県" },
  { code: "12", name: "千葉県" },
  { code: "13", name: "東京都" },
  { code: "14", name: "神奈川県" },
  { code: "15", name: "新潟県" },
  { code: "16", name: "富山県" },
  { code: "17", name: "石川県" },
  { code: "18", name: "福井県" },
  { code: "19", name: "山梨県" },
  { code: "20", name: "長野県" },
  { code: "21", name: "岐阜県" },
  { code: "22", name: "静岡県" },
  { code: "23", name: "愛知県" },
  { code: "24", name: "三重県" },
  { code: "25", name: "滋賀県" },
  { code: "26", name: "京都府" },
  { code: "27", name: "大阪府" },
  { code: "28", name: "兵庫県" },
  { code: "29", name: "奈良県" },
  { code: "30", name: "和歌山県" },
  { code: "31", name: "鳥取県" },
  { code: "32", name: "島根県" },
  { code: "33", name: "岡山県" },
  { code: "34", name: "広島県" },
  { code: "35", name: "山口県" },
  { code: "36", name: "徳島県" },
  { code: "37", name: "香川県" },
  { code: "38", name: "愛媛県" },
  { code: "39", name: "高知県" },
  { code: "40", name: "福岡県" },
  { code: "41", name: "佐賀県" },
  { code: "42", name: "長崎県" },
  { code: "43", name: "熊本県" },
  { code: "44", name: "大分県" },
  { code: "45", name: "宮崎県" },
  { code: "46", name: "鹿児島県" },
  { code: "47", name: "沖縄県" },
];
