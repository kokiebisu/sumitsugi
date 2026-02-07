'use client';

import { useState } from 'react';
import { ChevronDown, Lock, ChevronRight } from 'lucide-react';
import { type JapaneseAddress, PREFECTURES } from '@/lib/geocoding-service';

interface AddressFormProps {
  address: JapaneseAddress;
  onChange: (address: JapaneseAddress) => void;
  isLoading?: boolean;
}

export function AddressForm({
  address,
  onChange,
  isLoading = false,
}: AddressFormProps) {
  const [showDetailedAddress, setShowDetailedAddress] = useState(false);

  const handleFieldChange = (field: keyof JapaneseAddress, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  const inputClasses = `
    w-full px-4 py-2 bg-background border-0
    text-base focus:outline-none
    placeholder:text-muted-foreground
    ${isLoading ? 'animate-pulse bg-muted' : ''}
  `;

  const labelClasses = 'text-xs text-muted-foreground mb-1';

  // エリアレベルの住所が入力されているかチェック
  const hasBasicAddress = address.prefecture && address.city;

  return (
    <div className="space-y-4">
      {/* Privacy Note */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
        <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          エリア情報のみ公開されます。番地・建物名は内覧調整時にのみ共有されます。
        </p>
      </div>

      {/* Step 1: Basic Address (Area Level) */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-sm font-medium text-foreground">
            エリア情報
          </span>
        </div>

        <div className="divide-y divide-border">
          {/* Country (Fixed) */}
          <div className="px-4 py-2">
            <label className={labelClasses}>国/地域</label>
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">日本 - JP</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Prefecture */}
          <div className="px-4 py-2">
            <label className={labelClasses}>都道府県</label>
            <select
              value={address.prefecture}
              onChange={(e) => handleFieldChange('prefecture', e.target.value)}
              className={`${inputClasses} appearance-none cursor-pointer`}
              disabled={isLoading}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (
                <option key={pref.code} value={pref.name}>
                  {pref.name}
                </option>
              ))}
            </select>
          </div>

          {/* City/Ward */}
          <div className="px-4 py-2">
            <label className={labelClasses}>市/郡/区</label>
            <input
              type="text"
              placeholder="渋谷区"
              value={address.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className={inputClasses}
              disabled={isLoading}
            />
          </div>

          {/* District/Town */}
          <div className="px-4 py-2">
            <label className={labelClasses}>地区/町/村（任意）</label>
            <input
              type="text"
              placeholder="恵比寿"
              value={address.district}
              onChange={(e) => handleFieldChange('district', e.target.value)}
              className={inputClasses}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Step 2: Detailed Address (Expandable) */}
      {hasBasicAddress && (
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetailedAddress(!showDetailedAddress)}
            className="w-full px-4 py-3 flex items-center justify-between bg-background hover:bg-muted/30 transition-colors"
          >
            <div className="text-left">
              <span className="text-sm font-medium text-foreground">
                詳細住所を追加（任意）
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                内覧調整と引き継ぎ可否判断のために使用。一般公開されません。
              </p>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                showDetailedAddress ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showDetailedAddress && (
            <div className="divide-y divide-border border-t border-border">
              {/* Postal Code */}
              <div className="px-4 py-2">
                <label className={labelClasses}>郵便番号</label>
                <input
                  type="text"
                  placeholder="123-4567"
                  value={address.postalCode}
                  onChange={(e) =>
                    handleFieldChange('postalCode', e.target.value)
                  }
                  className={inputClasses}
                  maxLength={8}
                  disabled={isLoading}
                />
              </div>

              {/* Street Address */}
              <div className="px-4 py-2">
                <label className={labelClasses}>番地/街区</label>
                <input
                  type="text"
                  placeholder="1-2-3"
                  value={address.streetAddress}
                  onChange={(e) =>
                    handleFieldChange('streetAddress', e.target.value)
                  }
                  className={inputClasses}
                  disabled={isLoading}
                />
              </div>

              {/* Building Info (Optional) */}
              <div className="px-4 py-2">
                <label className={labelClasses}>アパート名、階数、建物名</label>
                <input
                  type="text"
                  placeholder="○○マンション 101号室"
                  value={address.buildingInfo || ''}
                  onChange={(e) =>
                    handleFieldChange('buildingInfo', e.target.value)
                  }
                  className={inputClasses}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
