import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import { ManagementCompanyAgreement } from '../templates/management-company-agreement';

describe('ManagementCompanyAgreement template', () => {
  it('should render with all props', async () => {
    const html = await render(
      ManagementCompanyAgreement({
        managementCompanyName: '株式会社ABC管理',
        propertyAddress: '東京都世田谷区三軒茶屋1-1-1',
        sellerName: '田中太郎',
        pdfDownloadUrl: 'https://example.com/pdf/123',
        roomNumber: '301号室',
      })
    );

    expect(html).toContain('残置物同意書');
    expect(html).toContain('株式会社ABC管理');
    expect(html).toContain('東京都世田谷区三軒茶屋1-1-1 301号室');
    expect(html).toContain('田中太郎');
    expect(html).toContain('https://example.com/pdf/123');
  });

  it('should render without room number', async () => {
    const html = await render(
      ManagementCompanyAgreement({
        managementCompanyName: '管理会社テスト',
        propertyAddress: '渋谷区神南1-1-1',
        sellerName: '山田花子',
        pdfDownloadUrl: 'https://example.com/pdf/456',
      })
    );

    expect(html).toContain('渋谷区神南1-1-1');
    expect(html).not.toContain('undefined');
  });

  it('should have PreviewProps', () => {
    expect(ManagementCompanyAgreement.PreviewProps).toBeDefined();
    expect(
      ManagementCompanyAgreement.PreviewProps.managementCompanyName
    ).toBeDefined();
  });
});
