'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  title?: string;
  subtitle?: string;
  minDate?: Date;
}

interface SingleDatePickerProps {
  selectedDate: Date | null;
  endDate?: Date | null;
  onDateChange: (date: Date | null, endDate?: Date | null) => void;
  title?: string;
  subtitle?: string;
  minDate?: Date;
}

// 月の日本語名
const MONTH_NAMES = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

// 月のデータを生成
function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  return { year, month, daysInMonth, startingDay };
}

// 日付を比較（日付のみ）
function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// 日付が範囲内かチェック
function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

// 日付が過去かチェック
function isPast(date: Date, minDate: Date): boolean {
  const today = new Date(minDate);
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  title,
  subtitle,
  minDate = new Date(),
}: DateRangePickerProps) {
  // 表示開始月（現在の月から開始）
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 3ヶ月分のデータを生成
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      let year = baseMonth.year;
      let month = baseMonth.month + i;
      if (month > 11) {
        month -= 12;
        year += 1;
      }
      result.push(getMonthData(year, month));
    }
    return result;
  }, [baseMonth]);

  // 前の月へ
  const handlePrevMonth = () => {
    setBaseMonth((prev) => {
      let month = prev.month - 1;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      return { year, month };
    });
  };

  // 次の月へ
  const handleNextMonth = () => {
    setBaseMonth((prev) => {
      let month = prev.month + 1;
      let year = prev.year;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  };

  // 日付をクリック
  const handleDateClick = (year: number, month: number, day: number) => {
    const clickedDate = new Date(year, month, day);

    // 過去の日付は選択不可
    if (isPast(clickedDate, minDate)) return;

    if (!startDate || (startDate && endDate)) {
      // 新しい選択を開始
      onDateChange(clickedDate, null);
    } else {
      // 終了日を設定
      if (clickedDate < startDate) {
        // クリックした日付が開始日より前なら、入れ替え
        onDateChange(clickedDate, startDate);
      } else {
        onDateChange(startDate, clickedDate);
      }
    }
  };

  // 日付をクリア
  const handleClear = () => {
    onDateChange(null, null);
  };

  // タイトル・サブタイトルを生成
  const displayTitle =
    title ||
    (startDate && endDate
      ? `${startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`
      : startDate
        ? '終了日を選択'
        : '日程を選択');

  const displaySubtitle =
    subtitle ||
    (startDate && endDate
      ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}日間`
      : '開始日と終了日を選択してください');

  return (
    <div className="bg-white rounded-2xl p-8 space-y-6">
      {/* ヘッダー */}
      <div>
        <h3 className="text-2xl font-semibold text-foreground">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{displaySubtitle}</p>
      </div>

      {/* カレンダーコンテナ */}
      <div className="relative">
        {/* 前へボタン */}
        <button
          onClick={handlePrevMonth}
          className="absolute left-0 top-0 z-10 p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="前の月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 次へボタン */}
        <button
          onClick={handleNextMonth}
          className="absolute right-0 top-0 z-10 p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="次の月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 3ヶ月カレンダー */}
        <div className="grid grid-cols-3 gap-16">
          {months.map((monthData, index) => (
            <div
              key={`${monthData.year}-${monthData.month}`}
              className="min-w-[280px]"
            >
              {/* 月タイトル */}
              <div className="text-center mb-4">
                <span className="text-base font-semibold">
                  {monthData.year}年{MONTH_NAMES[monthData.month]}
                </span>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-y-1">
                {/* 空のセル（月初の曜日調整） */}
                {Array.from({ length: monthData.startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12" />
                ))}

                {/* 日付セル */}
                {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(monthData.year, monthData.month, day);
                  const isDisabled = isPast(date, minDate);
                  const isStart = isSameDay(date, startDate);
                  const isEnd = isSameDay(date, endDate);
                  const isSelected = isStart || isEnd;
                  const inRange = isInRange(date, startDate, endDate);

                  return (
                    <button
                      key={day}
                      onClick={() =>
                        handleDateClick(monthData.year, monthData.month, day)
                      }
                      disabled={isDisabled}
                      className={cn(
                        'h-12 w-full text-base font-medium transition-colors relative',
                        isDisabled &&
                          'text-muted-foreground/40 cursor-not-allowed line-through',
                        !isDisabled &&
                          !isSelected &&
                          !inRange &&
                          'hover:bg-muted rounded-full',
                        isSelected &&
                          'bg-foreground text-white rounded-full z-10',
                        inRange && 'bg-muted/80',
                        isStart &&
                          endDate &&
                          'rounded-l-full rounded-r-none bg-foreground text-white',
                        isEnd &&
                          startDate &&
                          'rounded-r-full rounded-l-none bg-foreground text-white',
                        isStart && !endDate && 'rounded-full'
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="キーボードショートカット"
        >
          <Keyboard className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          onClick={handleClear}
          className="text-sm font-semibold text-foreground underline hover:no-underline"
        >
          日付をクリア
        </button>
      </div>
    </div>
  );
}

// 柔軟な日付選択コンポーネント（単体または範囲）
// 1つ選択 → 「〇〇以降」、2つ選択 → 範囲
export function SingleDatePicker({
  selectedDate,
  endDate,
  onDateChange,
  title,
  subtitle,
  minDate = new Date(),
}: SingleDatePickerProps) {
  // 表示開始月（現在の月から開始）
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 3ヶ月分のデータを生成
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      let year = baseMonth.year;
      let month = baseMonth.month + i;
      if (month > 11) {
        month -= 12;
        year += 1;
      }
      result.push(getMonthData(year, month));
    }
    return result;
  }, [baseMonth]);

  // 前の月へ
  const handlePrevMonth = () => {
    setBaseMonth((prev) => {
      let month = prev.month - 1;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      return { year, month };
    });
  };

  // 次の月へ
  const handleNextMonth = () => {
    setBaseMonth((prev) => {
      let month = prev.month + 1;
      let year = prev.year;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  };

  // 日付をクリック
  const handleDateClick = (year: number, month: number, day: number) => {
    const clickedDate = new Date(year, month, day);

    // 過去の日付は選択不可
    if (isPast(clickedDate, minDate)) return;

    if (!selectedDate) {
      // 最初の選択: 単体（以降）として設定
      onDateChange(clickedDate, null);
    } else if (selectedDate && !endDate) {
      // 2つ目の選択: 範囲に変換
      if (isSameDay(clickedDate, selectedDate)) {
        // 同じ日付をクリックしたら選択解除
        onDateChange(null, null);
      } else if (clickedDate < selectedDate) {
        // クリックした日付が開始日より前なら、入れ替え
        onDateChange(clickedDate, selectedDate);
      } else {
        onDateChange(selectedDate, clickedDate);
      }
    } else {
      // 既に範囲が選択されている場合: リセットして新しい選択を開始
      onDateChange(clickedDate, null);
    }
  };

  // 日付をクリア
  const handleClear = () => {
    onDateChange(null, null);
  };

  // タイトル・サブタイトルを生成
  const generateDefaultTitle = () => {
    if (selectedDate && endDate) {
      // 範囲が選択されている
      return `${selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`;
    } else if (selectedDate) {
      // 単体が選択されている（以降）
      return `${selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}以降`;
    }
    return '日程を選択';
  };

  const generateDefaultSubtitle = () => {
    if (selectedDate && endDate) {
      const days = Math.ceil(
        (endDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${days}日間`;
    } else if (selectedDate) {
      return 'この日以降（終了日を追加で選択可能）';
    }
    return '開始日を選択してください';
  };

  const displayTitle = title || generateDefaultTitle();
  const displaySubtitle = subtitle || generateDefaultSubtitle();

  return (
    <div className="bg-white rounded-2xl p-8 space-y-6">
      {/* ヘッダー */}
      <div>
        <h3 className="text-2xl font-semibold text-foreground">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{displaySubtitle}</p>
      </div>

      {/* カレンダーコンテナ */}
      <div className="relative">
        {/* 前へボタン */}
        <button
          onClick={handlePrevMonth}
          className="absolute left-0 top-0 z-10 p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="前の月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 次へボタン */}
        <button
          onClick={handleNextMonth}
          className="absolute right-0 top-0 z-10 p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="次の月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 3ヶ月カレンダー */}
        <div className="grid grid-cols-3 gap-16">
          {months.map((monthData) => (
            <div
              key={`${monthData.year}-${monthData.month}`}
              className="min-w-[280px]"
            >
              {/* 月タイトル */}
              <div className="text-center mb-4">
                <span className="text-base font-semibold">
                  {monthData.year}年{MONTH_NAMES[monthData.month]}
                </span>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-y-1">
                {/* 空のセル（月初の曜日調整） */}
                {Array.from({ length: monthData.startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12" />
                ))}

                {/* 日付セル */}
                {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(monthData.year, monthData.month, day);
                  const isDisabled = isPast(date, minDate);
                  const isStart = isSameDay(date, selectedDate);
                  const isEnd = isSameDay(date, endDate ?? null);
                  const isSelected = isStart || isEnd;
                  const inRange = isInRange(
                    date,
                    selectedDate,
                    endDate ?? null
                  );

                  return (
                    <button
                      key={day}
                      onClick={() =>
                        handleDateClick(monthData.year, monthData.month, day)
                      }
                      disabled={isDisabled}
                      className={cn(
                        'h-12 w-full text-base font-medium transition-colors relative',
                        isDisabled &&
                          'text-muted-foreground/40 cursor-not-allowed line-through',
                        !isDisabled &&
                          !isSelected &&
                          !inRange &&
                          'hover:bg-muted rounded-full',
                        // 単体モード（endDateがない場合）
                        isStart &&
                          !endDate &&
                          'bg-foreground text-white rounded-full',
                        // 範囲モード（endDateがある場合）
                        isStart &&
                          endDate &&
                          'rounded-l-full rounded-r-none bg-foreground text-white',
                        isEnd &&
                          selectedDate &&
                          'rounded-r-full rounded-l-none bg-foreground text-white',
                        inRange && 'bg-muted/80'
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="キーボードショートカット"
        >
          <Keyboard className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          onClick={handleClear}
          className="text-sm font-semibold text-foreground underline hover:no-underline"
        >
          日付をクリア
        </button>
      </div>
    </div>
  );
}

// コンパクト版（フォーム用）
export function DateRangeInput({
  startDate,
  endDate,
  onDateChange,
  label,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const displayValue =
    startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : startDate
        ? `${formatDate(startDate)} -`
        : '日程を選択';

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-border rounded-xl text-base text-left focus:outline-none focus:ring-2 focus:ring-foreground"
      >
        <span
          className={startDate ? 'text-foreground' : 'text-muted-foreground'}
        >
          {displayValue}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-50 shadow-2xl rounded-2xl border border-border">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={(start, end) => {
                onDateChange(start, end);
                if (start && end) {
                  setIsOpen(false);
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
