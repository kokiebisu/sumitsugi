// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileReviews } from '../profile-reviews';

describe('ProfileReviews', () => {
  it('shows empty state when user has no reviews', () => {
    const { container } = render(<ProfileReviews userId="nonexistent-user" />);
    expect(container.textContent).toContain('まだレビューはありません');
  });

  it('shows heading text', () => {
    const { container } = render(<ProfileReviews userId="nonexistent-user" />);
    expect(container.textContent).toContain('受けたレビュー');
  });

  it('shows reviews for user with reviews', () => {
    // user-takuma has reviews from user-sato and user-tanaka in mock data
    const { container } = render(<ProfileReviews userId="user-takuma" />);
    expect(container.textContent).toContain('2件');
    expect(container.textContent).not.toContain('まだレビューはありません');
  });

  it('displays review comments', () => {
    const { container } = render(<ProfileReviews userId="user-takuma" />);
    expect(container.textContent).toContain(
      '植物の手入れのコツまで丁寧に教えていただきました'
    );
  });

  it('shows review type label', () => {
    const { container } = render(<ProfileReviews userId="user-takuma" />);
    expect(container.textContent).toContain('内見者から');
  });

  it('shows reviewer name', () => {
    const { container } = render(<ProfileReviews userId="user-takuma" />);
    expect(container.textContent).toContain('内見者');
  });

  it('shows review date', () => {
    const { container } = render(<ProfileReviews userId="user-takuma" />);
    expect(container.textContent).toContain('2026年1月');
  });
});
