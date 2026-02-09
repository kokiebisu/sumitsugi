import zod from 'zod';
import { furnitureCategorySchema } from './property';

const z = zod;

// Furniture categories with Japanese labels (for UI)
export const FURNITURE_CATEGORY_OPTIONS: ReadonlyArray<{
  value: zod.infer<typeof furnitureCategorySchema>;
  label: string;
}> = [
  { value: 'sofa', label: 'ソファ' },
  { value: 'dining_table', label: 'ダイニングテーブル' },
  { value: 'bed_frame', label: 'ベッドフレーム' },
  { value: 'desk', label: 'デスク' },
  { value: 'storage', label: '収納' },
  { value: 'chair', label: 'チェア' },
  { value: 'lighting', label: '照明' },
  { value: 'rug', label: 'ラグ' },
  { value: 'other', label: 'その他' },
] as const;

// Default new prices by furniture category (yen)
export const DEFAULT_NEW_PRICES: Record<
  zod.infer<typeof furnitureCategorySchema>,
  number
> = {
  sofa: 50000,
  dining_table: 40000,
  bed_frame: 35000,
  desk: 25000,
  storage: 20000,
  chair: 15000,
  lighting: 10000,
  rug: 8000,
  other: 10000,
};

// Form-level schema for a single furniture item input
export const furnitureFormItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '家具名は必須です'),
  category: z.enum(['core', 'additional']),
  furnitureCategory: furnitureCategorySchema,
  description: z.string().optional(),
  photoUrl: z
    .string()
    .url('有効なURLを入力してください')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .int('整数で入力してください')
    .nonnegative('0以上の金額を入力してください')
    .optional(),
  brand: z.string().optional(),
  newPrice: z
    .number()
    .int('整数で入力してください')
    .nonnegative('0以上の金額を入力してください')
    .optional(),
  yearsUsed: z.number().nonnegative('0以上の数値を入力してください').optional(),
});

// Schema for the entire furniture form (list of items)
export const furnitureFormSchema = z.object({
  items: z.array(furnitureFormItemSchema),
});

// Inferred types
export type FurnitureFormItem = zod.infer<typeof furnitureFormItemSchema>;
export type FurnitureFormData = zod.infer<typeof furnitureFormSchema>;

// Helper: get default new price for a furniture category
export function getDefaultNewPrice(
  category: zod.infer<typeof furnitureCategorySchema>
): number {
  return DEFAULT_NEW_PRICES[category];
}

// Helper: create a blank furniture item with defaults
export function createBlankFurnitureItem(
  category: 'core' | 'additional' = 'additional'
): FurnitureFormItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    category,
    furnitureCategory: 'other',
    description: '',
    photoUrl: '',
    brand: '',
    yearsUsed: undefined,
    price: undefined,
    newPrice: DEFAULT_NEW_PRICES.other,
  };
}
