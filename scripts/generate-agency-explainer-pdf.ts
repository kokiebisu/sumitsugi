#!/usr/bin/env bun
/**
 * Generate agency explainer PDF
 *
 * Creates a one-page A4 PDF explaining sumitsugi to real estate agencies.
 * Outputs to docs/pitch/agency-explainer.pdf
 *
 * Usage: bun scripts/generate-agency-explainer-pdf.ts
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { renderPdf } from '../src/lib/pdf/render';
import { AgencyExplainer } from '../src/lib/pdf/templates/agency-explainer';

async function main() {
  const createdDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  console.log('🎨 Generating agency explainer PDF...');

  const pdfBuffer = await renderPdf(
    AgencyExplainer({
      createdDate,
      contactEmail: 'hello@sumitsugi.jp',
    })
  );

  const outputPath = resolve(__dirname, '../docs/pitch/agency-explainer.pdf');
  writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ PDF generated successfully: ${outputPath}`);
  console.log(`📄 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
}

main().catch((error) => {
  console.error('❌ Error generating PDF:', error);
  process.exit(1);
});
