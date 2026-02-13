import { describe, it, expect } from 'vitest';
import { buildOwnerExplanationProps } from '../owner-explanation-generator';

describe('buildOwnerExplanationProps', () => {
  it('should build props from property data', () => {
    const props = buildOwnerExplanationProps({
      propertyName: 'グランメゾン渋谷',
      propertyAddress: '東京都渋谷区渋谷1-1-1',
      sellerName: '山田太郎',
      moveOutDate: '2026-03-31',
      furnitureItems: [
        {
          type: 'sofa',
          condition: 'good',
          notes: '3人掛けソファ',
        },
        {
          type: 'dining-table',
          condition: 'good',
          notes: '4人用ダイニングテーブル',
        },
      ],
    });

    expect(props.propertyName).toBe('グランメゾン渋谷');
    expect(props.propertyAddress).toBe('東京都渋谷区渋谷1-1-1');
    expect(props.sellerName).toBe('山田太郎');
    expect(props.moveOutDate).toBe('2026年3月31日');
    expect(props.furnitureItems).toHaveLength(2);
    expect(props.furnitureItems[0].name).toBe('ソファ');
    expect(props.createdDate).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
  });

  it('should format furniture items correctly', () => {
    const props = buildOwnerExplanationProps({
      propertyName: 'テストマンション',
      propertyAddress: '東京都港区1-1-1',
      sellerName: 'テスト太郎',
      moveOutDate: '2026-04-15',
      furnitureItems: [
        {
          type: 'sofa',
          condition: 'good',
          notes: '',
        },
      ],
    });

    expect(props.furnitureItems[0]).toEqual({
      name: 'ソファ',
      category: 'コアセット（基本セット）',
      description: '',
    });
  });

  it('should handle empty furniture list', () => {
    const props = buildOwnerExplanationProps({
      propertyName: 'テストマンション',
      propertyAddress: '東京都港区1-1-1',
      sellerName: 'テスト太郎',
      moveOutDate: '2026-04-15',
      furnitureItems: [],
    });

    expect(props.furnitureItems).toEqual([]);
  });
});
