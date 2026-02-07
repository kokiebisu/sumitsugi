import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRegister = vi.fn();

vi.mock('@react-pdf/renderer', () => ({
  Font: { register: mockRegister },
}));

describe('registerFonts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('registers Noto Sans JP font family', async () => {
    const { registerFonts } = await import('../fonts');
    registerFonts();

    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        family: 'Noto Sans JP',
        fonts: expect.arrayContaining([
          expect.objectContaining({ fontWeight: 400 }),
          expect.objectContaining({ fontWeight: 700 }),
        ]),
      })
    );
  });

  it('uses CDN URLs for font sources', async () => {
    const { registerFonts } = await import('../fonts');
    registerFonts();

    const call = mockRegister.mock.calls[0][0];
    for (const font of call.fonts) {
      expect(font.src).toContain('cdn.jsdelivr.net');
      expect(font.src).toContain('noto-sans-jp');
    }
  });

  it('only registers fonts once (idempotent)', async () => {
    const { registerFonts } = await import('../fonts');
    registerFonts();
    registerFonts();
    registerFonts();

    expect(mockRegister).toHaveBeenCalledTimes(1);
  });
});
