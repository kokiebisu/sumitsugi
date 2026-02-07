import type { ReactElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from './fonts';

export async function renderPdf(document: ReactElement): Promise<Buffer> {
  registerFonts();
  const buffer = await renderToBuffer(
    document as Parameters<typeof renderToBuffer>[0]
  );
  return Buffer.from(buffer);
}
