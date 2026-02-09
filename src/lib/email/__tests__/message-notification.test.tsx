import { describe, it, expect } from 'vitest';
import { render } from '@react-email/components';
import { MessageNotification } from '../templates/message-notification';

describe('MessageNotification', () => {
  const defaultProps = {
    recipientName: '田中太郎',
    senderName: '山田花子',
    propertyTitle: '世田谷区の家具付き物件',
    messagePreview: 'こんにちは、内見の件でご連絡しました。',
    threadUrl: 'https://tsumugi.com/messages/thread-1',
  };

  it('renders recipient name', async () => {
    const html = await render(<MessageNotification {...defaultProps} />);
    expect(html).toContain('田中太郎');
  });

  it('renders sender name', async () => {
    const html = await render(<MessageNotification {...defaultProps} />);
    expect(html).toContain('山田花子');
  });

  it('renders property title', async () => {
    const html = await render(<MessageNotification {...defaultProps} />);
    expect(html).toContain('世田谷区の家具付き物件');
  });

  it('renders message preview text', async () => {
    const html = await render(<MessageNotification {...defaultProps} />);
    expect(html).toContain('こんにちは、内見の件でご連絡しました。');
  });

  it('renders thread link button', async () => {
    const html = await render(<MessageNotification {...defaultProps} />);
    expect(html).toContain('https://tsumugi.com/messages/thread-1');
    expect(html).toContain('メッセージを確認する');
  });

  it('renders heading about new message', async () => {
    const html = await render(<MessageNotification {...defaultProps} />);
    expect(html).toContain('新着メッセージが届きました');
  });

  it('truncates long message preview', async () => {
    const longMessage = 'あ'.repeat(250);
    const html = await render(
      <MessageNotification {...defaultProps} messagePreview={longMessage} />
    );
    expect(html).not.toContain(longMessage);
    expect(html).toContain('…');
  });
});
