export {
  consentStatusSchema,
  moveOutReasonSchema,
  furnitureCategorySchema,
  furniturePinSchema,
  furnitureItemSchema,
  landlordConsentSchema,
} from './property';
export type {
  ConsentStatusInput,
  MoveOutReasonInput,
  FurnitureCategoryInput,
  FurnitureItemInput,
  LandlordConsentInput,
} from './property';

export { inquiryFieldsSchema } from './inquiry';
export type { InquiryFieldsInput } from './inquiry';

export {
  messageTypeSchema,
  createMessageSchema,
  createThreadSchema,
} from './message';
export type {
  MessageTypeInput,
  CreateMessageInput,
  CreateThreadInput,
} from './message';
