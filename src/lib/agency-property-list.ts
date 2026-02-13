/**
 * Agency Property List Generator
 *
 * Generates area-filtered property lists for real estate agencies (B2B).
 * Phase A: Manual sharing via spreadsheet.
 *
 * Features:
 * - Filter properties by area
 * - Flag "immediately available" properties (within 14 days)
 * - Export property data for agency sharing
 */

import type { Property } from './types';

/**
 * Information for a property to be shared with real estate agencies
 */
export interface AgencyPropertyInfo {
  propertyName: string;
  area: string;
  layout: string;
  furnitureList: string;
  handoverFee: number;
  moveInAvailableFrom: string;
  isImmediatelyAvailable: boolean;
}

/**
 * Filter properties by area and public status
 *
 * @param properties - All properties
 * @param area - Target area (e.g., "中目黒", "渋谷")
 * @returns Public properties in the specified area
 */
export function filterPropertiesByArea(
  properties: Property[],
  area: string
): Property[] {
  return properties.filter(
    (property) => property.area === area && property.status === 'public'
  );
}

/**
 * Check if a property is immediately available (within 14 days)
 *
 * @param property - Property to check
 * @returns true if available within 14 days, false otherwise
 */
export function isImmediateMoveInAvailable(property: Property): boolean {
  const moveInDate = property.handoverDetails?.moveInAvailableFrom;

  if (!moveInDate) {
    return false;
  }

  const today = new Date();
  const availableDate = new Date(moveInDate);
  const diffInDays = Math.ceil(
    (availableDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffInDays <= 14 && diffInDays >= 0;
}

/**
 * Generate property list data for agency sharing
 *
 * @param properties - All properties
 * @param area - Target area
 * @returns Array of property information for agency sharing
 */
export function generateAgencyPropertyListData(
  properties: Property[],
  area: string
): AgencyPropertyInfo[] {
  const filteredProperties = filterPropertiesByArea(properties, area);

  return filteredProperties.map((property) => {
    const furnitureList =
      property.handoverDetails?.included?.join('、') ||
      (property.furniture?.length ? property.furniture.join('、') : 'なし');

    return {
      propertyName: property.title,
      area: property.area,
      layout: property.layout || '未設定',
      furnitureList,
      handoverFee: property.handoverFee,
      moveInAvailableFrom:
        property.handoverDetails?.moveInAvailableFrom || '未定',
      isImmediatelyAvailable: isImmediateMoveInAvailable(property),
    };
  });
}

/**
 * Get all unique areas from properties
 *
 * @param properties - All properties
 * @returns Array of unique area names
 */
export function getAllAreas(properties: Property[]): string[] {
  const publicProperties = properties.filter((p) => p.status === 'public');
  const areas = new Set(publicProperties.map((p) => p.area));
  return Array.from(areas).sort();
}
