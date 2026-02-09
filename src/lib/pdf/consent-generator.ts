/**
 * 残置物同意書PDF自動生成（F-612）
 *
 * agreedFurnitureIdsが確定した時点で呼び出し、
 * ConsentFormテンプレートに必要なpropsを構築する。
 */

import { createElement } from 'react';
import type { ChecklistItem } from '../furniture-checklist';
import { furnitureLabels } from '../data';
import { CONDITION_LABELS } from '../pricing-guidance';
import { isCoreFurniture, getLayerLabel } from '../furniture-layers';
import { uploadImage, isStorageConfigured } from '../storage';
import { ConsentForm } from './templates/consent-form';
import { renderPdf } from './render';

interface ConsentFurnitureItem {
  name: string;
  category: string;
  condition?: string;
  remarks?: string;
}

interface ConsentFormProps {
  propertyAddress: string;
  roomNumber?: string;
  sellerName: string;
  buyerName?: string;
  furnitureItems: ConsentFurnitureItem[];
  createdDate: string;
}

interface BuildConsentFormInput {
  propertyAddress: string;
  roomNumber?: string;
  sellerName: string;
  buyerName?: string;
  checklistItems: ChecklistItem[];
}

/**
 * Maps checklist items (keep only) to consent form furniture items.
 */
export function mapChecklistToConsentItems(
  items: ChecklistItem[]
): ConsentFurnitureItem[] {
  return items
    .filter((item) => item.disposition === 'keep')
    .map((item) => {
      const layer = isCoreFurniture(item.furnitureType) ? 'core' : 'additional';
      const conditionLabel = item.condition
        ? CONDITION_LABELS[item.condition]
        : undefined;

      return {
        name: furnitureLabels[item.furnitureType] ?? item.furnitureType,
        category: getLayerLabel(layer),
        condition: conditionLabel,
        remarks: item.notes,
      };
    });
}

/**
 * Builds complete props for the ConsentForm PDF component.
 */
export function buildConsentFormProps(
  input: BuildConsentFormInput
): ConsentFormProps {
  const now = new Date();
  const createdDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    propertyAddress: input.propertyAddress,
    roomNumber: input.roomNumber,
    sellerName: input.sellerName,
    buyerName: input.buyerName,
    furnitureItems: mapChecklistToConsentItems(input.checklistItems),
    createdDate,
  };
}

/**
 * Generates a PDF buffer for the consent form.
 */
export async function generateConsentPdf(
  input: BuildConsentFormInput
): Promise<Buffer> {
  const props = buildConsentFormProps(input);
  const element = createElement(ConsentForm, props);
  return renderPdf(element);
}

/**
 * Generates a consent form PDF and uploads it to R2 storage.
 * Returns the public URL of the uploaded PDF.
 */
export async function generateAndUploadConsentPdf(
  input: BuildConsentFormInput
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('ストレージが設定されていません');
  }

  const buffer = await generateConsentPdf(input);
  return uploadImage(buffer, 'application/pdf');
}
