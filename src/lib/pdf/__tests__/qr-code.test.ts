import { describe, it, expect } from 'vitest';
import { generateQrCodeDataUrl, FAQ_PAGE_URL } from '../qr-code';

describe('qr-code utility', () => {
  it('exports the FAQ page URL constant', () => {
    expect(FAQ_PAGE_URL).toBe('https://tsumugi.com/for-managers');
  });

  it('generates a data URL string for a given URL', async () => {
    const dataUrl = await generateQrCodeDataUrl('https://example.com');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('generates a non-empty base64 payload', async () => {
    const dataUrl = await generateQrCodeDataUrl('https://example.com');
    const base64Part = dataUrl.replace('data:image/png;base64,', '');
    expect(base64Part.length).toBeGreaterThan(0);
  });

  it('generates different data URLs for different inputs', async () => {
    const url1 = await generateQrCodeDataUrl('https://example.com/a');
    const url2 = await generateQrCodeDataUrl('https://example.com/b');
    expect(url1).not.toBe(url2);
  });

  it('uses reasonable QR code options (small size for PDF embedding)', async () => {
    const dataUrl = await generateQrCodeDataUrl('https://example.com');
    // The data URL should be a valid PNG — just verify it's a plausible size
    const base64Part = dataUrl.replace('data:image/png;base64,', '');
    const byteSize = Math.ceil((base64Part.length * 3) / 4);
    // QR code at width 120 should be < 10 KB
    expect(byteSize).toBeLessThan(10_000);
  });
});
