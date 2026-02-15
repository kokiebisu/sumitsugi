import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentPreparationChecklist } from './document-preparation-checklist';

describe('DocumentPreparationChecklist', () => {
  it('renders all checklist items', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    expect(screen.getByText('本人確認書類')).toBeInTheDocument();
    expect(screen.getByText('銀行口座情報')).toBeInTheDocument();
  });

  it('renders required labels for all items', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const requiredLabels = screen.getAllByText(/（必須）/);
    expect(requiredLabels).toHaveLength(2);
  });

  it('renders examples for identity document', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    expect(screen.getByText('運転免許証（両面）')).toBeInTheDocument();
    expect(
      screen.getByText('マイナンバーカード（表面のみ）')
    ).toBeInTheDocument();
    expect(screen.getByText('パスポート（顔写真ページ）')).toBeInTheDocument();
  });

  it('renders examples for bank account', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    expect(screen.getByText('金融機関名')).toBeInTheDocument();
    expect(screen.getByText('支店名')).toBeInTheDocument();
    expect(screen.getByText('口座種別（普通/当座）')).toBeInTheDocument();
  });

  it('disables complete button initially', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const completeButton = screen.getByRole('button', { name: /準備完了/ });
    expect(completeButton).toBeDisabled();
  });

  it('enables complete button when all required items are checked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const identityCheckbox = screen.getByLabelText(/本人確認書類/);
    const bankCheckbox = screen.getByLabelText(/銀行口座情報/);
    const completeButton = screen.getByRole('button', { name: /準備完了/ });

    expect(completeButton).toBeDisabled();

    await user.click(identityCheckbox);
    expect(completeButton).toBeDisabled();

    await user.click(bankCheckbox);
    expect(completeButton).toBeEnabled();
  });

  it('calls onComplete when complete button is clicked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const identityCheckbox = screen.getByLabelText(/本人確認書類/);
    const bankCheckbox = screen.getByLabelText(/銀行口座情報/);

    await user.click(identityCheckbox);
    await user.click(bankCheckbox);

    const completeButton = screen.getByRole('button', { name: /準備完了/ });
    await user.click(completeButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows unchecking items', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const identityCheckbox = screen.getByLabelText(/本人確認書類/);
    const bankCheckbox = screen.getByLabelText(/銀行口座情報/);
    const completeButton = screen.getByRole('button', { name: /準備完了/ });

    await user.click(identityCheckbox);
    await user.click(bankCheckbox);
    expect(completeButton).toBeEnabled();

    await user.click(identityCheckbox);
    expect(completeButton).toBeDisabled();
  });

  it('shows success message when all items are checked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const identityCheckbox = screen.getByLabelText(/本人確認書類/);
    const bankCheckbox = screen.getByLabelText(/銀行口座情報/);

    await user.click(identityCheckbox);
    await user.click(bankCheckbox);

    expect(screen.getByText(/準備が整いました/)).toBeInTheDocument();
  });

  it('renders skip button when onSkip is provided', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <DocumentPreparationChecklist onComplete={onComplete} onSkip={onSkip} />
    );

    const skipButton = screen.getByRole('button', {
      name: /あとで準備する/,
    });
    expect(skipButton).toBeInTheDocument();
  });

  it('does not render skip button when onSkip is not provided', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    const skipButton = screen.queryByRole('button', {
      name: /あとで準備する/,
    });
    expect(skipButton).not.toBeInTheDocument();
  });

  it('calls onSkip when skip button is clicked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <DocumentPreparationChecklist onComplete={onComplete} onSkip={onSkip} />
    );

    const skipButton = screen.getByRole('button', {
      name: /あとで準備する/,
    });
    await user.click(skipButton);

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('renders informational notice', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    expect(screen.getByText(/本人確認と口座登録について/)).toBeInTheDocument();
    expect(
      screen.getByText(/Stripeによる本人確認が必要です/)
    ).toBeInTheDocument();
  });

  it('renders precautions section', () => {
    const onComplete = vi.fn();
    render(<DocumentPreparationChecklist onComplete={onComplete} />);

    expect(screen.getByText('注意事項：')).toBeInTheDocument();
    expect(
      screen.getByText(/本人確認書類は有効期限内のものをご用意ください/)
    ).toBeInTheDocument();
  });
});
