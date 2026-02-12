import { describe, it, expect } from 'vitest';
import { render } from '@react-email/components';
import { InquiryNotification } from '../templates/inquiry-notification';
import { ViewingScheduled } from '../templates/viewing-scheduled';
import { ChecklistConfirmed } from '../templates/checklist-confirmed';

describe('InquiryNotification (F-204)', () => {
  it('renders seller notification with buyer info', async () => {
    const html = await render(
      <InquiryNotification
        sellerName="田中太郎"
        buyerName="山田花子"
        propertyTitle="世田谷の家具付き物件"
        dashboardUrl="https://sumitsugi.jp/dashboard"
        message="内見を希望しています"
      />
    );
    expect(html).toContain('田中太郎');
    expect(html).toContain('山田花子');
    expect(html).toContain('世田谷の家具付き物件');
    expect(html).toContain('問い合わせが届きました');
    expect(html).toContain('内見を希望しています');
  });

  it('renders without message', async () => {
    const html = await render(
      <InquiryNotification
        sellerName="田中"
        buyerName="山田"
        propertyTitle="テスト物件"
        dashboardUrl="https://sumitsugi.jp/dashboard"
      />
    );
    expect(html).toContain('田中');
    expect(html).not.toContain('メッセージ');
  });
});

describe('ViewingScheduled', () => {
  it('renders viewing date and property info', async () => {
    const html = await render(
      <ViewingScheduled
        recipientName="田中太郎"
        otherPartyName="山田花子"
        propertyTitle="世田谷の物件"
        viewingDate="2026年2月15日 10:00"
        propertyUrl="https://sumitsugi.jp/listings/1"
      />
    );
    expect(html).toContain('田中太郎');
    expect(html).toContain('2026年2月15日 10:00');
    expect(html).toContain('世田谷の物件');
    expect(html).toContain('内見日程が確定しました');
  });
});

describe('ChecklistConfirmed', () => {
  it('renders confirmed items count and parties', async () => {
    const html = await render(
      <ChecklistConfirmed
        recipientName="山田花子"
        propertyTitle="世田谷の物件"
        keepCount={3}
        takeAwayCount={1}
        dashboardUrl="https://sumitsugi.jp/dashboard"
      />
    );
    expect(html).toContain('山田花子');
    expect(html).toContain('世田谷の物件');
    expect(html).toContain('3');
    expect(html).toContain('引き継ぎ');
  });
});
