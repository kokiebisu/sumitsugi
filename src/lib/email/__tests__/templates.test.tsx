import { describe, it, expect } from 'vitest';
import { render } from '@react-email/components';
import { InquiryConfirmation } from '../templates/inquiry-confirmation';

describe('InquiryConfirmation', () => {
  const defaultProps = {
    buyerName: '山田太郎',
    propertyTitle: '渋谷区 1LDK',
    propertyUrl: 'https://tsumugi.com/properties/test-1',
  };

  it('renders with required props', async () => {
    const html = await render(InquiryConfirmation(defaultProps));
    expect(html).toContain('山田太郎');
    expect(html).toContain('渋谷区 1LDK');
    expect(html).toContain('問い合わせを受け付けました');
  });

  it('includes property link', async () => {
    const html = await render(InquiryConfirmation(defaultProps));
    expect(html).toContain('https://tsumugi.com/properties/test-1');
  });

  it('renders message when provided', async () => {
    const html = await render(
      InquiryConfirmation({
        ...defaultProps,
        message: '内見希望です',
      })
    );
    expect(html).toContain('内見希望です');
    expect(html).toContain('送信メッセージ');
  });

  it('omits message section when not provided', async () => {
    const html = await render(InquiryConfirmation(defaultProps));
    expect(html).not.toContain('送信メッセージ');
  });

  it('includes tsumugi branding from base layout', async () => {
    const html = await render(InquiryConfirmation(defaultProps));
    expect(html).toContain('tsumugi');
    expect(html).toContain('住人の暮らしを引き継ぐ');
  });

  it('includes footer with contact info', async () => {
    const html = await render(InquiryConfirmation(defaultProps));
    expect(html).toContain('info@tsumugi.com');
  });
});
