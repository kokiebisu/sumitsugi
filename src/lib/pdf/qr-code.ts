/**
 * QR code generation utility for PDF documents.
 *
 * Generates QR code data URLs suitable for embedding in @react-pdf/renderer
 * Image components. Uses the `qrcode` library for lightweight generation.
 */

import QRCode from 'qrcode';
import { siteConfig } from '@/lib/site-config';

/** The FAQ page URL for management companies */
export const FAQ_PAGE_URL = `${siteConfig.url}/for-managers`;

/**
 * Generates a QR code as a PNG data URL for embedding in PDFs.
 *
 * @param url - The URL to encode in the QR code
 * @returns A data:image/png;base64,... string
 */
export async function generateQrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 120,
    margin: 1,
    color: {
      dark: '#333333',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}
