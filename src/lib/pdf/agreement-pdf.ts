/**
 * 残置物同意書PDF生成（引き継ぎ合意書からPDF出力）
 *
 * 署名済みのHandoverAgreementRecordからConsentFormテンプレートの
 * propsを構築し、PDFバッファを生成する。
 */

import { createElement } from 'react';
import { getAgreement } from '../handover-agreement';
import { getChecklist } from '../furniture-checklist';
import { buildConsentFormProps } from './consent-generator';
import { ConsentForm } from './templates/consent-form';
import { renderPdf } from './render';

interface AgreementPdfProps {
  propertyAddress: string;
  roomNumber?: string;
  sellerName: string;
  buyerName?: string;
  furnitureItems: Array<{
    name: string;
    category: string;
    condition?: string;
    remarks?: string;
  }>;
  createdDate: string;
}

/**
 * Builds consent form PDF props from a signed agreement.
 * The agreement must be in 'signed' status.
 */
export function buildAgreementPdfProps(agreementId: string): AgreementPdfProps {
  const agreement = getAgreement(agreementId);
  if (!agreement) {
    throw new Error('合意書が見つかりません');
  }

  if (agreement.status !== 'signed') {
    throw new Error('署名済みの合意書のみPDFを生成できます');
  }

  const checklist = getChecklist(agreement.checklistId);
  if (!checklist) {
    throw new Error('チェックリストが見つかりません');
  }

  return buildConsentFormProps({
    propertyAddress: agreement.propertyAddress ?? '',
    sellerName: agreement.sellerName,
    buyerName: agreement.buyerName,
    checklistItems: checklist.items,
  });
}

/**
 * Generates a PDF buffer for a signed handover agreement.
 */
export async function generateAgreementPdf(
  agreementId: string
): Promise<Buffer> {
  const props = buildAgreementPdfProps(agreementId);
  const element = createElement(ConsentForm, props);
  return renderPdf(element);
}
