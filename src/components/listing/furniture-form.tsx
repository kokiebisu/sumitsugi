'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FURNITURE_CATEGORY_OPTIONS,
  createBlankFurnitureItem,
  getDefaultNewPrice,
  type FurnitureFormItem,
} from '@/lib/validations/furniture';
import type { FurnitureCategoryInput } from '@/lib/validations/property';

interface FurnitureFormProps {
  items: readonly FurnitureFormItem[];
  onChange: (items: FurnitureFormItem[]) => void;
  className?: string;
}

const GROUP_OPTIONS: ReadonlyArray<{
  value: 'core' | 'additional';
  label: string;
}> = [
  { value: 'core', label: 'コアセット' },
  { value: 'additional', label: '追加家具' },
] as const;

function FurnitureItemCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: FurnitureFormItem;
  onUpdate: (updated: FurnitureFormItem) => void;
  onRemove: () => void;
}) {
  const handleFieldChange = (
    field: keyof FurnitureFormItem,
    value: string | number | undefined
  ) => {
    onUpdate({ ...item, [field]: value });
  };

  const handleCategoryChange = (newCategory: FurnitureCategoryInput) => {
    onUpdate({
      ...item,
      furnitureCategory: newCategory,
      newPrice: getDefaultNewPrice(newCategory),
    });
  };

  const handleNumericChange = (
    field: 'price' | 'newPrice' | 'yearsUsed',
    rawValue: string
  ) => {
    if (rawValue === '') {
      handleFieldChange(field, undefined);
      return;
    }
    const parsed = Number(rawValue);
    if (!Number.isNaN(parsed)) {
      handleFieldChange(field, parsed);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">家具名</Label>
            <Input
              value={item.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="家具の名前"
              className="rounded-lg"
            />
          </div>

          {/* Furniture Category */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">カテゴリ</Label>
            <select
              value={item.furnitureCategory}
              onChange={(e) =>
                handleCategoryChange(e.target.value as FurnitureCategoryInput)
              }
              className={cn(
                'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
                'ring-offset-background focus-visible:outline-none focus-visible:ring-1',
                'focus-visible:ring-ring'
              )}
            >
              {FURNITURE_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="家具を削除"
          className="text-muted-foreground hover:text-destructive shrink-0 mt-5"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Group (core/additional) */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">グループ</Label>
        <select
          value={item.category}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          className={cn(
            'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-1',
            'focus-visible:ring-ring'
          )}
        >
          {GROUP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand & Years Used */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ブランド</Label>
          <Input
            value={item.brand ?? ''}
            onChange={(e) => handleFieldChange('brand', e.target.value)}
            placeholder="ブランド名（任意）"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">使用年数</Label>
          <Input
            type="number"
            min={0}
            value={item.yearsUsed ?? ''}
            onChange={(e) => handleNumericChange('yearsUsed', e.target.value)}
            placeholder="使用年数"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">新品参考価格</Label>
          <Input
            type="number"
            min={0}
            value={item.newPrice ?? ''}
            onChange={(e) => handleNumericChange('newPrice', e.target.value)}
            placeholder="新品価格（円）"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">希望価格</Label>
          <Input
            type="number"
            min={0}
            value={item.price ?? ''}
            onChange={(e) => handleNumericChange('price', e.target.value)}
            placeholder="希望価格（円）"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">説明</Label>
        <Textarea
          value={item.description ?? ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="家具の状態や特徴を記入"
          rows={2}
          className="rounded-lg"
        />
      </div>

      {/* Photo placeholder */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">写真</Label>
        <div
          className={cn(
            'flex items-center justify-center h-20 rounded-lg border-2 border-dashed',
            'border-muted-foreground/25 text-muted-foreground/50',
            'hover:border-muted-foreground/50 transition-colors cursor-pointer'
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            <ImagePlus className="h-4 w-4" />
            <span>写真を追加</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FurnitureForm({
  items,
  onChange,
  className,
}: FurnitureFormProps) {
  const coreItems = items.filter((item) => item.category === 'core');
  const additionalItems = items.filter(
    (item) => item.category === 'additional'
  );

  const handleAdd = () => {
    const newItem = createBlankFurnitureItem('additional');
    onChange([...items, newItem]);
  };

  const handleUpdate = (updatedItem: FurnitureFormItem) => {
    const newItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onChange([...newItems]);
  };

  const handleRemove = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    onChange([...newItems]);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Core Set Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">コアセット</h3>
        <p className="text-sm text-muted-foreground mb-4">
          生活に必要な基本家具（ベッド、ソファ、テーブルなど）
        </p>
        {coreItems.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">
            コアセットの家具はまだありません
          </p>
        ) : (
          <div className="space-y-4">
            {coreItems.map((item) => (
              <FurnitureItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Additional Furniture Section */}
      <section>
        <h3 className="text-lg font-semibold mb-3">追加家具</h3>
        <p className="text-sm text-muted-foreground mb-4">
          その他のインテリア・家電
        </p>
        {additionalItems.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">
            追加家具はまだありません
          </p>
        ) : (
          <div className="space-y-4">
            {additionalItems.map((item) => (
              <FurnitureItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Add Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAdd}
        className="w-full rounded-lg border-dashed"
      >
        <Plus className="mr-2 h-4 w-4" />
        家具を追加
      </Button>
    </div>
  );
}
