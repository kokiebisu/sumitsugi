/**
 * 残置物引き継ぎ相談資料PDF生成（Phase 2）
 *
 * 物件データから ConsultationDocument テンプレートに必要な
 * props を構築する。管理会社向けの相談資料PDFに使用。
 */

import type { FurnitureItem } from '../data';
import { furnitureLabels } from '../data';
import { isCoreFurniture, getLayerLabel } from '../furniture-layers';

interface ConsultationFurnitureItem {
  name: string;
  category: string;
  description?: string;
}

interface ConsultationDocumentProps {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: ConsultationFurnitureItem[];
  createdDate: string;
}

interface BuildConsultationDocumentInput {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: FurnitureItem[];
}

/**
 * Maps property furniture items to consultation document format.
 * Each item gets a Japanese label and layer-based category.
 */
export function mapFurnitureToConsultationItems(
  items: FurnitureItem[]
): ConsultationFurnitureItem[] {
  return items.map((item) => {
    const layer = isCoreFurniture(item.type) ? 'core' : 'additional';

    return {
      name: furnitureLabels[item.type] ?? item.type,
      category: getLayerLabel(layer),
      description: item.notes,
    };
  });
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as a Japanese date (YYYY年M月D日).
 */
function formatJapaneseDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Builds complete props for the ConsultationDocument PDF component
 * from property data.
 */
export function buildConsultationDocumentProps(
  input: BuildConsultationDocumentInput
): ConsultationDocumentProps {
  const now = new Date();
  const createdDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    propertyName: input.propertyName,
    propertyAddress: input.propertyAddress,
    moveOutDate: formatJapaneseDate(input.moveOutDate),
    sellerName: input.sellerName,
    furnitureItems: mapFurnitureToConsultationItems(input.furnitureItems),
    createdDate,
  };
}
