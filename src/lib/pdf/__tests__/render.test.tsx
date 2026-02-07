import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';

const mockRenderToBuffer = vi.fn();

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: mockRenderToBuffer,
  Font: { register: vi.fn() },
  Document: ({ children }: { children: React.ReactNode }) =>
    createElement('document', null, children),
  Page: ({ children }: { children: React.ReactNode }) =>
    createElement('page', null, children),
  Text: ({ children }: { children: React.ReactNode }) =>
    createElement('text', null, children),
  View: ({ children }: { children: React.ReactNode }) =>
    createElement('view', null, children),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T) => styles,
  },
}));

const { renderPdf } = await import('../render');

describe('renderPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls renderToBuffer with the document element', async () => {
    const fakeBuffer = new Uint8Array([37, 80, 68, 70]);
    mockRenderToBuffer.mockResolvedValueOnce(fakeBuffer);

    const doc = createElement('div', null, 'test') as never;
    const result = await renderPdf(doc);

    expect(mockRenderToBuffer).toHaveBeenCalledWith(doc);
    expect(result).toBeInstanceOf(Buffer);
    expect(result[0]).toBe(37); // '%' - start of PDF magic bytes
  });

  it('returns a Buffer from the rendered output', async () => {
    const content = new TextEncoder().encode('PDF content');
    mockRenderToBuffer.mockResolvedValueOnce(content);

    const doc = createElement('div', null, 'test') as never;
    const result = await renderPdf(doc);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('PDF content');
  });
});
