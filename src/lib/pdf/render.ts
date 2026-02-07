import { renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from './fonts';

export async function renderPdf(
  document: Parameters<typeof renderToBuffer>[0]
): Promise<Buffer> {
  registerFonts();
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
