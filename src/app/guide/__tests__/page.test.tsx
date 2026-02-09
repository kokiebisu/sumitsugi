// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('@/components/header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('lucide-react', () => {
  const createIcon = (name: string) => {
    const Icon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className} />
    );
    Icon.displayName = name;
    return Icon;
  };
  return {
    Camera: createIcon('Camera'),
    FileText: createIcon('FileText'),
    Building2: createIcon('Building2'),
    Eye: createIcon('Eye'),
    Handshake: createIcon('Handshake'),
    ClipboardCheck: createIcon('ClipboardCheck'),
    Sparkles: createIcon('Sparkles'),
    Key: createIcon('Key'),
    Home: createIcon('Home'),
    Search: createIcon('Search'),
    MessageCircle: createIcon('MessageCircle'),
    CreditCard: createIcon('CreditCard'),
    ShieldCheck: createIcon('ShieldCheck'),
    ArrowRight: createIcon('ArrowRight'),
  };
});

const { default: GuidePage } = await import('../page');

describe('GuidePage', () => {
  describe('layout', () => {
    it('renders header, footer, and page title with description', () => {
      render(<GuidePage />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: '使い方ガイド' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/前の住人・次の住人それぞれの視点/)
      ).toBeInTheDocument();
    });
  });

  describe('tab switcher', () => {
    it('renders both tab buttons with seller active by default', () => {
      render(<GuidePage />);
      const sellerTab = screen.getByRole('button', { name: '前の住人向け' });
      const buyerTab = screen.getByRole('button', { name: '次の住人向け' });
      expect(sellerTab).toBeInTheDocument();
      expect(buyerTab).toBeInTheDocument();
      expect(sellerTab.className).toContain('text-[#FF5A5F]');
    });

    it('switches between tabs', () => {
      render(<GuidePage />);
      const buyerTab = screen.getByRole('button', { name: '次の住人向け' });
      const sellerTab = screen.getByRole('button', { name: '前の住人向け' });

      fireEvent.click(buyerTab);
      expect(buyerTab.className).toContain('text-[#FF5A5F]');

      fireEvent.click(sellerTab);
      expect(sellerTab.className).toContain('text-[#FF5A5F]');
    });
  });

  describe('seller steps', () => {
    const sellerStepTitles = [
      '家具を登録',
      '管理会社に相談',
      'オーナー承認',
      '内見・確認',
      '合意・契約',
      '引き渡し準備',
      'クリーニング',
      '鍵の引き渡し',
      '決済完了',
    ];

    it('renders all 9 seller steps with step numbers', () => {
      render(<GuidePage />);
      for (const title of sellerStepTitles) {
        expect(screen.getByText(title)).toBeInTheDocument();
      }
      for (let i = 1; i <= 9; i++) {
        expect(screen.getByText(`STEP ${i}`)).toBeInTheDocument();
      }
    });

    it('displays durations for seller steps', () => {
      render(<GuidePage />);
      expect(screen.getByText('約15分')).toBeInTheDocument();
      expect(screen.getByText('3〜5日')).toBeInTheDocument();
      expect(screen.getByText('日程調整次第')).toBeInTheDocument();
      expect(screen.getByText('退去前')).toBeInTheDocument();
      expect(screen.getByText('入居後3日以内')).toBeInTheDocument();
      expect(screen.getAllByText('1〜2日')).toHaveLength(2);
      expect(screen.getAllByText('1日')).toHaveLength(2);
    });

    it('displays descriptions and icons for seller steps', () => {
      render(<GuidePage />);
      expect(
        screen.getByText('残したい家具の写真と状態を登録します。')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/管理会社経由でオーナーの承認を得ます/)
      ).toBeInTheDocument();
      expect(
        screen.getByText('エスクローから引越し費用が支払われます。')
      ).toBeInTheDocument();
      expect(screen.getByTestId('icon-Camera')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Building2')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Key')).toBeInTheDocument();
    });
  });

  describe('buyer steps', () => {
    const buyerStepTitles = [
      '物件を探す',
      '問い合わせ',
      '内見',
      '合意・契約',
      '引越し費用の支払い',
      '入居前確認',
      '鍵の受け取り',
      '入居開始',
      '確認・決済完了',
    ];

    it('renders all 9 buyer steps with step numbers after tab switch', () => {
      render(<GuidePage />);
      fireEvent.click(screen.getByRole('button', { name: '次の住人向け' }));

      for (const title of buyerStepTitles) {
        expect(screen.getByText(title)).toBeInTheDocument();
      }
      for (let i = 1; i <= 9; i++) {
        expect(screen.getByText(`STEP ${i}`)).toBeInTheDocument();
      }
    });

    it('displays buyer step durations', () => {
      render(<GuidePage />);
      fireEvent.click(screen.getByRole('button', { name: '次の住人向け' }));

      expect(screen.getByText('自由')).toBeInTheDocument();
      expect(screen.getByText('日程調整次第')).toBeInTheDocument();
      expect(screen.getByText('クリーニング後')).toBeInTheDocument();
      expect(screen.getByText('入居後3日以内')).toBeInTheDocument();
      expect(screen.getAllByText('即日')).toHaveLength(2);
      expect(screen.getAllByText('入居日')).toHaveLength(2);
    });

    it('displays buyer step descriptions', () => {
      render(<GuidePage />);
      fireEvent.click(screen.getByRole('button', { name: '次の住人向け' }));

      expect(
        screen.getByText('tsumugiで家具付き物件を探します。')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'エスクローに引越し費用を預けます。安全に保管されます。'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('家具付きの新しい暮らしがスタートします。')
      ).toBeInTheDocument();
    });

    it('hides seller steps when buyer tab is active', () => {
      render(<GuidePage />);
      fireEvent.click(screen.getByRole('button', { name: '次の住人向け' }));

      expect(screen.queryByText('家具を登録')).not.toBeInTheDocument();
      expect(screen.queryByText('管理会社に相談')).not.toBeInTheDocument();
    });
  });

  describe('landlord approval step (大家承認)', () => {
    it('includes landlord approval with tsumugi document support', () => {
      render(<GuidePage />);
      expect(screen.getByText('オーナー承認')).toBeInTheDocument();
      expect(
        screen.getByText(/管理会社経由でオーナーの承認を得ます/)
      ).toBeInTheDocument();
      expect(screen.getByText(/tsumugiが説明資料を作成/)).toBeInTheDocument();
      expect(screen.getByText('3〜5日')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Building2')).toBeInTheDocument();
    });
  });

  describe('cost explanation section', () => {
    it('renders cost heading and all three cost cards', () => {
      render(<GuidePage />);
      expect(
        screen.getByRole('heading', { name: '費用の仕組み' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: '引越し費用' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'エスクロー決済' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'クリーニング費用' })
      ).toBeInTheDocument();
    });

    it('renders cost card descriptions', () => {
      render(<GuidePage />);
      expect(
        screen.getByText(/次の住人が前の住人に支払う家具の引き継ぎ費用/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/支払いはエスクローで安全に管理/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/退去後のクリーニング費用は引越し費用に含まれます/)
      ).toBeInTheDocument();
    });
  });

  describe('FAQ link section', () => {
    it('renders FAQ heading and help center link', () => {
      render(<GuidePage />);
      expect(
        screen.getByRole('heading', { name: 'よくある質問' })
      ).toBeInTheDocument();
      const link = screen.getByRole('link', { name: /ヘルプセンターへ/ });
      expect(link).toHaveAttribute('href', '/help/emergency-options');
    });
  });

  describe('responsive design', () => {
    it('uses responsive classes for title and cost grid', () => {
      render(<GuidePage />);
      const title = screen.getByRole('heading', { name: '使い方ガイド' });
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('md:text-4xl');

      const costSection = screen
        .getByRole('heading', { name: '費用の仕組み' })
        .closest('section');
      const grid = costSection?.querySelector('.grid');
      expect(grid?.className).toContain('md:grid-cols-3');
    });
  });

  describe('timeline UI', () => {
    it('renders timeline connectors and step icons with accent color', () => {
      const { container } = render(<GuidePage />);
      const timelineLines = container.querySelectorAll('.bg-gray-200');
      // 8 connector lines between 9 steps
      expect(timelineLines.length).toBe(8);

      const iconCircles = container.querySelectorAll('.bg-\\[\\#FF5A5F\\]');
      expect(iconCircles.length).toBeGreaterThanOrEqual(9);
    });
  });
});
