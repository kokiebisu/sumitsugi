'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyCard } from '@/components/property-card';
import { getPublicProperties, Property } from '@/lib/data';
import {
  isUrgentMoveIn,
  getDaysUntilMoveOut,
  isAvailableFromMonth,
} from '@/lib/utils';
import { useMemo, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

// neighborhoodから区名を抽出する関数
function extractDistrict(neighborhood?: string): string {
  if (!neighborhood) return 'その他';
  // 「目黒区中目黒」→「目黒区」、「大阪市浪速区新今宮」→「浪速区」
  const match = neighborhood.match(/(.+?区)/);
  return match ? match[1] : 'その他';
}

// 横スクロールセクションコンポーネント
function ScrollSection({
  title,
  properties,
}: {
  title: string;
  properties: Property[];
}) {
  if (properties.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mx-auto max-w-7xl px-6 mb-5">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div
          className="overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft:
              'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
          }}
        >
          <div
            className="flex gap-5"
            style={{
              paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
            }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex-shrink-0 w-72"
                style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
            {/* 右側の余白を確保するための見えない要素 */}
            <div
              className="flex-shrink-0"
              style={{
                width: 'max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// 表示する区の順番（人気エリア順）
const DISTRICT_ORDER = [
  '渋谷区',
  '目黒区',
  '港区',
  '世田谷区',
  '新宿区',
  '杉並区',
  '文京区',
  '台東区',
  '墨田区',
  '豊島区',
  '中野区',
  '練馬区',
  '北区',
  '荒川区',
  '板橋区',
];

// 入居可能月フィルター用の選択肢を生成（今月〜6ヶ月先）
function generateMonthOptions(): Array<{
  year: number;
  month: number;
  label: string;
}> {
  const options: Array<{ year: number; month: number; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
    });
  }
  return options;
}

export default function HomePage() {
  const [moveInFilter, setMoveInFilter] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const properties = useMemo(() => {
    return getPublicProperties();
  }, []);

  // 東京の物件のみをフィルタリング + 入居可能日フィルター（F-508）
  const tokyoProperties = properties.filter((p) => {
    if (p.area !== '東京') return false;
    if (moveInFilter) {
      return isAvailableFromMonth(
        p.moveOutDate,
        moveInFilter.year,
        moveInFilter.month
      );
    }
    return true;
  });

  // 区ごとにグループ化し、即入居可能物件を優先表示（F-507）
  const propertiesByDistrict = useMemo(() => {
    const grouped: Record<string, Property[]> = {};

    tokyoProperties.forEach((property) => {
      const district = extractDistrict(property.location?.neighborhood);
      if (!grouped[district]) {
        grouped[district] = [];
      }
      grouped[district].push(property);
    });

    // 各区内で即入居可能物件を先頭にソート
    for (const district of Object.keys(grouped)) {
      grouped[district] = [...grouped[district]].sort((a, b) => {
        const aUrgent = isUrgentMoveIn(a.moveOutDate);
        const bUrgent = isUrgentMoveIn(b.moveOutDate);

        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;

        // 両方urgent: 退去日が近い順
        if (aUrgent && bUrgent) {
          return (
            getDaysUntilMoveOut(a.moveOutDate!) -
            getDaysUntilMoveOut(b.moveOutDate!)
          );
        }

        return 0;
      });
    }

    return grouped;
  }, [tokyoProperties]);

  // 表示順序に従ってソートされた区のリスト
  const sortedDistricts = DISTRICT_ORDER.filter(
    (district) => propertiesByDistrict[district]?.length > 0
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* 入居可能日フィルター（F-508） */}
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>入居可能月</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {monthOptions.map((opt) => {
                const isActive =
                  moveInFilter?.year === opt.year &&
                  moveInFilter?.month === opt.month;
                return (
                  <button
                    key={`${opt.year}-${opt.month}`}
                    onClick={() =>
                      setMoveInFilter(
                        isActive ? null : { year: opt.year, month: opt.month }
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.month}月
                  </button>
                );
              })}
            </div>
            {moveInFilter && (
              <button
                onClick={() => setMoveInFilter(null)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                クリア
              </button>
            )}
          </div>
        </div>

        <div className="py-8">
          {tokyoProperties.length > 0 ? (
            <>
              {sortedDistricts.map((district) => (
                <ScrollSection
                  key={district}
                  title={district}
                  properties={propertiesByDistrict[district]}
                />
              ))}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                現在、公開中の物件はありません
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
