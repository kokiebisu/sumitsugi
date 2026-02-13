import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { buildOwnerExplanationProps } from '../owner-explanation-generator';
import { OwnerExplanationDocument } from '../templates/owner-explanation-document';
import { renderPdf } from '../render';

describe('Owner Explanation PDF E2E', () => {
  it('should generate a valid PDF buffer', async () => {
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
        {
          type: 'bed',
          condition: 'excellent',
          notes: 'セミダブルベッド',
        },
      ],
    });

    const element = createElement(OwnerExplanationDocument, props);
    const buffer = await renderPdf(element);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // PDF files start with '%PDF'
    expect(buffer.toString('utf-8', 0, 4)).toBe('%PDF');
  });

  it('should generate PDF with empty furniture list', async () => {
    const props = buildOwnerExplanationProps({
      propertyName: 'テストマンション',
      propertyAddress: '東京都港区1-1-1',
      sellerName: 'テスト太郎',
      moveOutDate: '2026-04-15',
      furnitureItems: [],
    });

    const element = createElement(OwnerExplanationDocument, props);
    const buffer = await renderPdf(element);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString('utf-8', 0, 4)).toBe('%PDF');
  });
});
