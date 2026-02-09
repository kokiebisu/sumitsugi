import zod from 'zod';
const z = zod;

// ConsentStatus enum (§7.4)
export const consentStatusSchema = z.enum([
  'pending',
  'approved',
  'conditional',
  'rejected',
  'expired',
]);

// MoveOutReason enum (§7.6)
export const moveOutReasonSchema = z.enum([
  'job_transfer',
  'job_change',
  'marriage',
  'family',
  'upgrade',
  'downsize',
  'end_of_contract',
  'other',
]);

// FurnitureCategory enum (§7.7.1)
export const furnitureCategorySchema = z.enum([
  'sofa',
  'dining_table',
  'bed_frame',
  'desk',
  'storage',
  'chair',
  'lighting',
  'rug',
  'other',
]);

// FurnitureItem pin location on room photo
export const furniturePinSchema = z.object({
  photoIndex: z.number().int().nonnegative(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

// FurnitureItem structure (§7.7)
export const furnitureItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['core', 'additional']),
  furnitureCategory: furnitureCategorySchema,
  description: z.string().optional(),
  photoUrl: z.string().url().optional(),
  price: z.number().int().nonnegative().optional(),
  brand: z.string().optional(),
  newPrice: z.number().int().nonnegative().optional(),
  yearsUsed: z.number().nonnegative().optional(),
  pin: furniturePinSchema.optional(),
});

// LandlordConsent structure (§7.4)
export const landlordConsentSchema = z.object({
  status: consentStatusSchema,
  approvedItems: z.array(z.string()).optional(),
  rejectedItems: z.array(z.string()).optional(),
  conditions: z.string().optional(),
  restorationTerms: z.string().optional(),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
});

// TasteCategory enum (interior style categories)
export const tasteCategorySchema = z.enum([
  'minimal',
  'natural',
  'modern',
  'japanese',
  'industrial',
  'vintage',
]);

// Property status
export const propertyStatusSchema = z.enum(['draft', 'public']);

// Listing form validation schema (required/optional field separation)
export const listingFormSchema = z.object({
  // Required fields
  title: z.string().min(1, 'タイトルは必須です'),
  images: z.array(z.string().url()).min(1, '画像は1枚以上必要です'),
  area: z.string().min(1, 'エリアは必須です'),

  // Status with default
  status: propertyStatusSchema.default('draft'),

  // Optional fields
  tasteCategory: tasteCategorySchema.optional(),
  moveOutReason: moveOutReasonSchema.optional(),
  managementCompanyName: z.string().optional(),
  summary: z.string().optional(),
  story: z.string().optional(),
  furnitureDescription: z.string().optional(),
  conditions: z.string().optional(),
});

// Inferred types (for use outside DB schema context)
export type ConsentStatusInput = zod.infer<typeof consentStatusSchema>;
export type MoveOutReasonInput = zod.infer<typeof moveOutReasonSchema>;
export type FurnitureCategoryInput = zod.infer<typeof furnitureCategorySchema>;
export type FurnitureItemInput = zod.infer<typeof furnitureItemSchema>;
export type LandlordConsentInput = zod.infer<typeof landlordConsentSchema>;
export type TasteCategoryInput = zod.infer<typeof tasteCategorySchema>;
export type PropertyStatusInput = zod.infer<typeof propertyStatusSchema>;
export type ListingFormInput = zod.infer<typeof listingFormSchema>;
