import { describe, it, expect } from 'vitest';
import { render } from '@react-email/components';
import { ViewingFollowup } from '../templates/viewing-followup';

describe('ViewingFollowup', () => {
  const defaultProps = {
    recipientName: '山田太郎',
    propertyTitle: '世田谷区の家具付き物件',
    viewingDate: '2026年2月15日（日）10:00',
    deadlineDate: '2026年2月22日（土）',
    checklistUrl: 'https://tsumugi.com/viewings/vw-1/checklist',
  };

  it('renders with required props', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).toContain('山田太郎');
    expect(html).toContain('世田谷区の家具付き物件');
    expect(html).toContain('内見ありがとうございました');
  });

  it('includes viewing date', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).toContain('2026年2月15日（日）10:00');
  });

  it('displays 7-day deadline', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).toContain('2026年2月22日（土）');
    expect(html).toContain('7日以内');
  });

  it('includes checklist link button', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).toContain('https://tsumugi.com/viewings/vw-1/checklist');
    expect(html).toContain('チェックリストに回答する');
  });

  it('includes tsumugi branding from base layout', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).toContain('tsumugi');
    expect(html).toContain('住人の暮らしを引き継ぐ');
  });

  it('includes footer with contact info', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).toContain('info@tsumugi.com');
  });

  it('renders furniture items when provided', async () => {
    const html = await render(
      ViewingFollowup({
        ...defaultProps,
        furnitureNames: ['ソファ', 'ベッド', 'デスク'],
      })
    );
    expect(html).toContain('ソファ');
    expect(html).toContain('ベッド');
    expect(html).toContain('デスク');
  });

  it('omits furniture section when not provided', async () => {
    const html = await render(ViewingFollowup(defaultProps));
    expect(html).not.toContain('引き継ぎ対象の家具');
  });
});
