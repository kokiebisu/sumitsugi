import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import { MoveOutOneMonthNotification } from '../templates/move-out-one-month';

describe('MoveOutOneMonthNotification', () => {
  const defaultProps = {
    hostName: '田中太郎',
    propertyTitle: 'アートと植物に囲まれたワンルーム',
    moveOutDate: '2026年3月15日',
    daysRemaining: 30,
    dashboardUrl: 'https://sumitsugi.app/dashboard',
    disposalGuideUrl: 'https://sumitsugi.app/guide/disposal',
  };

  it('renders without crashing', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toBeTruthy();
  });

  it('includes host name', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toContain('田中太郎');
  });

  it('includes property title', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toContain('アートと植物に囲まれたワンルーム');
  });

  it('includes days remaining', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toContain('30日');
  });

  it('includes honest messaging about disposal', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toContain('処分');
    expect(html).toContain('引き取り');
  });

  it('includes actionable options', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toContain('価格を見直す');
    expect(html).toContain('処分・引き取りガイド');
  });

  it('includes dashboard link', async () => {
    const html = await render(
      <MoveOutOneMonthNotification {...defaultProps} />
    );
    expect(html).toContain('https://sumitsugi.app/dashboard');
  });
});
