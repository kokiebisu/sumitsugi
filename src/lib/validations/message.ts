import zod from 'zod';
const z = zod;

// MessageType enum (§7.9)
export const messageTypeSchema = z.enum(['text', 'template', 'system']);

// Create message schema (§7.9)
export const createMessageSchema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(2000),
  messageType: messageTypeSchema.default('text'),
  metadata: z.record(z.unknown()).optional(),
});

// Create thread schema (§7.8)
export const createThreadSchema = z.object({
  propertyId: z.string().min(1),
  sellerId: z.string().min(1),
  buyerId: z.string().min(1),
});

export type MessageTypeInput = zod.infer<typeof messageTypeSchema>;
export type CreateMessageInput = zod.infer<typeof createMessageSchema>;
export type CreateThreadInput = zod.infer<typeof createThreadSchema>;
