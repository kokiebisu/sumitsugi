import zod from 'zod';
const z = zod;

// Inquiry-specific validation fields (§7.2)
export const inquiryFieldsSchema = z.object({
  duration: z.string().max(100).optional(),
  agreedFurnitureIds: z.array(z.string()).optional(),
  viewingDate: z.string().datetime().optional(),
});

export type InquiryFieldsInput = zod.infer<typeof inquiryFieldsSchema>;
