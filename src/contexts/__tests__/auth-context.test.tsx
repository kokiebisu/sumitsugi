// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock better-auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: null,
      isPending: false,
    }),
    signIn: {
      magicLink: vi.fn().mockResolvedValue({ error: null }),
    },
    signOut: vi.fn(),
  },
}));

// Mock data
vi.mock('@/lib/data', () => ({
  inquiries: [],
}));

const { AuthProvider, useAuth } = await import('../auth-context');

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="has-user">{String(!!auth.user)}</span>
      <span data-testid="is-loading">{String(auth.isLoading)}</span>
      <span data-testid="context-keys">
        {Object.keys(auth).sort().join(',')}
      </span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not expose addListing function', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).not.toContain('addListing');
  });

  it('does not expose listings state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).not.toContain('listings');
  });

  it('does not expose updateListing function', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).not.toContain('updateListing');
  });

  it('does not expose deleteListing function', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).not.toContain('deleteListing');
  });

  it('does not expose publishListing function', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).not.toContain('publishListing');
  });

  it('still provides session management via Better-auth', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).toContain('user');
    expect(keys).toContain('isLoading');
    expect(keys).toContain('login');
    expect(keys).toContain('logout');
    expect(keys).toContain('sendMagicLink');
    expect(keys).toContain('updateUser');
    expect(keys).toContain('becomeSeller');
  });

  it('still provides inquiry management', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const keys = screen.getByTestId('context-keys').textContent!.split(',');
    expect(keys).toContain('inquiries');
    expect(keys).toContain('addInquiry');
  });

  it('does not use localStorage for property storage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Verify no localStorage calls related to listings/properties
    const getItemCalls = getItemSpy.mock.calls.map((call) => call[0]);
    const setItemCalls = setItemSpy.mock.calls.map((call) => call[0]);

    const listingKeys = [...getItemCalls, ...setItemCalls].filter(
      (key) =>
        key.includes('listing') ||
        key.includes('property') ||
        key.includes('properties')
    );

    expect(listingKeys).toHaveLength(0);

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});
