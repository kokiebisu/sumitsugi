export { registerFonts } from './fonts';
export { renderPdf } from './render';
export { SampleDocument } from './templates/sample';
export { ConsultationDocument } from './templates/consultation-document';
export { ConsentForm } from './templates/consent-form';
export { ScheduleTemplate } from './templates/schedule-template';
export { ManagementFaq } from './templates/management-faq';
export {
  buildConsentFormProps,
  mapChecklistToConsentItems,
  generateConsentPdf,
  generateAndUploadConsentPdf,
} from './consent-generator';
export { buildAgreementPdfProps, generateAgreementPdf } from './agreement-pdf';
export {
  buildConsultationDocumentProps,
  mapFurnitureToConsultationItems,
} from './consultation-generator';
export { generateQrCodeDataUrl, FAQ_PAGE_URL } from './qr-code';
