/**
 * Generate PPTX slides from pitch deck markdown files.
 *
 * Parses the "スライドコンテンツ" code blocks (not the presentation scripts)
 * and converts them into PowerPoint slides.
 *
 * Usage: bun scripts/generate-slides.ts [seller|buyer|management|agency|all]
 */
import PptxGenJS from 'pptxgenjs';
import { readFileSync } from 'fs';

const CORAL = 'FF5A5F';
const DARK = '484848';
const GRAY = '767676';
const WHITE = 'FFFFFF';
const BG = 'FFFAF9';

type SlideConfig = {
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  layout: 'title' | 'content' | 'accent' | 'comparison';
  note?: string;
};

// ── Markdown Parser ──

type ParsedSlide = {
  slideTitle: string;
  slideNumber: number;
  content: string;
  script: string;
};

function parseMarkdownPitchDeck(filePath: string): ParsedSlide[] {
  const md = readFileSync(filePath, 'utf-8');
  const slides: ParsedSlide[] = [];

  // Split by slide headings: ## スライド N: Title
  const slideRegex = /^## スライド\s*(\d+)\s*[:：]\s*(.+)$/gm;
  const slideMatches: { index: number; number: number; title: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = slideRegex.exec(md)) !== null) {
    slideMatches.push({
      index: match.index,
      number: parseInt(match[1]),
      title: match[2].trim(),
    });
  }

  for (let i = 0; i < slideMatches.length; i++) {
    const start = slideMatches[i].index;
    const end =
      i + 1 < slideMatches.length ? slideMatches[i + 1].index : md.length;
    const section = md.slice(start, end);

    // Extract スライドコンテンツ code block
    const contentMatch = section.match(
      /### スライドコンテンツ\s*\n+```\n([\s\S]*?)```/
    );
    const content = contentMatch ? contentMatch[1].trim() : '';

    // Extract プレゼンテーションスクリプト
    const scriptMatch = section.match(
      /### プレゼンテーションスクリプト\s*\n+([\s\S]*?)(?=\n### |$)/
    );
    const script = scriptMatch ? scriptMatch[1].trim() : '';

    slides.push({
      slideNumber: slideMatches[i].number,
      slideTitle: slideMatches[i].title,
      content,
      script,
    });
  }

  return slides;
}

// ── Content to SlideConfig Converter ──

function contentToSlideConfig(parsed: ParsedSlide): SlideConfig {
  const { slideNumber, slideTitle, content } = parsed;
  const lines = content.split('\n');

  // Slide 1 is always title layout
  if (slideNumber === 1) {
    const nonEmpty = lines.filter((l) => l.trim() !== '');
    const title = nonEmpty[0] || slideTitle;
    const subtitle = nonEmpty.slice(1).join('\n') || '';
    return { layout: 'title', title, subtitle };
  }

  // Detect accent slides: CTA, key messages with short content
  const isCTA = slideTitle.includes('CTA') || slideTitle.includes('行動喚起');
  const isAccent =
    isCTA ||
    (lines.filter((l) => l.trim() !== '').length <= 8 &&
      content.includes('✓') &&
      !content.includes('✗'));

  // Detect comparison layout
  const hasBeforeAfter =
    content.includes('【従来】') || content.includes('【sumitsugi】');
  const hasArrowTable =
    content.includes('→') && lines.filter((l) => l.includes('→')).length >= 3;
  const isComparison =
    hasBeforeAfter ||
    hasArrowTable ||
    slideTitle.includes('ポジショニング') ||
    slideTitle.includes('経済的メリット') ||
    slideTitle.includes('数字で見る');

  if (isAccent && !isComparison) {
    const nonEmpty = lines.filter((l) => l.trim() !== '');
    const accentTitle = nonEmpty[0] || slideTitle;
    const body = nonEmpty.slice(1).join('\n');
    return { layout: 'accent', title: accentTitle, body };
  }

  if (isComparison) {
    return parseComparisonSlide(slideTitle, content);
  }

  return parseContentSlide(slideTitle, content);
}

function parseComparisonSlide(title: string, content: string): SlideConfig {
  const lines = content.split('\n').filter((l) => l.trim() !== '');

  // Before/after cost comparison
  if (content.includes('【従来】') && content.includes('【sumitsugi】')) {
    const headers = ['', '従来', 'sumitsugi'];
    const rows: string[][] = [];
    const sections = content.split(/【/);

    for (const section of sections) {
      if (!section.trim()) continue;
      const sectionLines = section.split('\n').filter((l) => l.trim() !== '');
      const sectionLabel = sectionLines[0]?.replace('】', '').trim() || '';

      for (let i = 1; i < sectionLines.length; i++) {
        const line = sectionLines[i].trim();
        if (line.match(/^[━─═]+$/) || line.startsWith('※')) continue;

        const parts = line.split(/\s{2,}/);
        if (parts.length >= 2) {
          const label = parts[0].trim();
          const value = parts.slice(1).join(' ').trim();
          const existing = rows.find((r) => r[0] === label);
          if (existing) {
            existing[2] = value;
          } else if (sectionLabel === '従来') {
            rows.push([label, value, '']);
          } else {
            rows.push([label, '', value]);
          }
        }
      }
    }

    const note = content.match(/※.+/)?.[0];
    const footerLines = lines.filter(
      (l) => l.startsWith('差額') || l.startsWith('申込金')
    );

    return {
      layout: 'comparison',
      title,
      table: rows.length > 0 ? { headers, rows } : { headers: [], rows: [] },
      body: footerLines.join('\n') || undefined,
      note: note || undefined,
    };
  }

  // Arrow-style positioning table
  const arrowLines = lines.filter((l) => l.includes('→'));
  if (arrowLines.length >= 2) {
    const headers = ['サービス', '提供するもの'];
    const rows: string[][] = [];

    for (const line of lines) {
      const arrowMatch = line.match(/^(.+?)→(.+)$/);
      if (arrowMatch) {
        rows.push([arrowMatch[1].trim(), arrowMatch[2].trim()]);
      }
    }

    if (rows.length > 0) {
      const bodyLines = lines.filter(
        (l) => !l.includes('→') && l.trim() !== title
      );
      return {
        layout: 'comparison',
        title,
        table: { headers, rows },
        body: bodyLines.join('\n') || undefined,
      };
    }
  }

  return parseContentSlide(title, content);
}

function parseContentSlide(title: string, content: string): SlideConfig {
  const lines = content.split('\n');
  const nonEmpty = lines.filter((l) => l.trim() !== '');

  const bulletPatterns = [
    /^[✗✓•‣▸▹◦◆●○]\s/,
    /^\d+\.\s/,
    /^[🔒📄📋✓📅🏠]\s/u,
    /^Q\.\s/,
  ];

  const bulletLines: string[] = [];
  const bodyLines: string[] = [];
  const noteLines: string[] = [];
  let currentBullet = '';

  for (const line of nonEmpty) {
    const trimmed = line.trim();
    if (trimmed === title) continue;
    if (trimmed.match(/^[━─═]+$/)) continue;

    if (trimmed.startsWith('※')) {
      noteLines.push(trimmed);
      continue;
    }

    const isBullet = bulletPatterns.some((p) => p.test(trimmed));

    if (isBullet) {
      if (currentBullet) bulletLines.push(currentBullet);
      currentBullet = trimmed;
    } else if (currentBullet && line.startsWith('  ')) {
      currentBullet += ' ' + trimmed.trim();
    } else {
      if (currentBullet) {
        bulletLines.push(currentBullet);
        currentBullet = '';
      }
      bodyLines.push(trimmed);
    }
  }
  if (currentBullet) bulletLines.push(currentBullet);

  const config: SlideConfig = { layout: 'content', title };

  if (bulletLines.length > 0) {
    config.bullets = bulletLines;
    if (bodyLines.length > 0) {
      config.body = bodyLines.join('\n');
    }
  } else {
    config.body = bodyLines.join('\n');
  }

  if (noteLines.length > 0) {
    config.note = noteLines.join('\n');
  }

  return config;
}

// ── Slide Generator ──

function createPresentation(title: string, slides: SlideConfig[]): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'sumitsugi';
  pptx.subject = title;
  pptx.title = title;

  pptx.defineSlideMaster({
    title: 'CONTENT',
    background: { color: BG },
    objects: [
      {
        text: {
          text: 'sumitsugi',
          options: {
            x: 0.5,
            y: 7.0,
            w: 2,
            h: 0.4,
            fontSize: 10,
            color: GRAY,
          },
        },
      },
    ],
  });

  for (const config of slides) {
    const slide = pptx.addSlide({ masterName: 'CONTENT' });

    if (config.layout === 'title') {
      slide.background = { color: BG };
      if (config.title) {
        slide.addText(config.title, {
          x: 0.8,
          y: 2.0,
          w: 11.5,
          h: 1.5,
          fontSize: 44,
          fontFace: 'Helvetica',
          color: CORAL,
          bold: true,
          align: 'center',
        });
      }
      if (config.subtitle) {
        slide.addText(config.subtitle, {
          x: 0.8,
          y: 3.8,
          w: 11.5,
          h: 1.0,
          fontSize: 22,
          fontFace: 'Helvetica',
          color: GRAY,
          align: 'center',
        });
      }
    } else if (config.layout === 'accent') {
      slide.background = { color: CORAL };
      if (config.title) {
        slide.addText(config.title, {
          x: 0.8,
          y: 1.5,
          w: 11.5,
          h: 1.2,
          fontSize: 36,
          fontFace: 'Helvetica',
          color: WHITE,
          bold: true,
          align: 'center',
        });
      }
      if (config.body) {
        slide.addText(config.body, {
          x: 1.5,
          y: 3.2,
          w: 10,
          h: 3.0,
          fontSize: 22,
          fontFace: 'Helvetica',
          color: WHITE,
          align: 'center',
          lineSpacingMultiple: 1.5,
        });
      }
    } else if (config.layout === 'comparison' && config.table) {
      if (config.title) {
        slide.addText(config.title, {
          x: 0.8,
          y: 0.5,
          w: 11.5,
          h: 0.8,
          fontSize: 28,
          fontFace: 'Helvetica',
          color: CORAL,
          bold: true,
        });
      }

      if (config.table.headers.length > 0) {
        const tableRows: PptxGenJS.TableRow[] = [
          config.table.headers.map((h) => ({
            text: h,
            options: {
              bold: true,
              color: WHITE,
              fill: { color: CORAL },
              fontSize: 14,
              align: 'center' as const,
            },
          })),
          ...config.table.rows.map((row) =>
            row.map((cell) => ({
              text: cell,
              options: {
                fontSize: 13,
                color: DARK,
                align: 'center' as const,
              },
            }))
          ),
        ];

        slide.addTable(tableRows, {
          x: 1.0,
          y: 1.8,
          w: 11,
          colW: config.table.headers.map(
            () => 11 / config.table!.headers.length
          ),
          border: { type: 'solid', pt: 0.5, color: 'DDDDDD' },
          rowH: [0.5, ...config.table.rows.map(() => 0.5)],
        });
      }

      if (config.body) {
        const tableHeight =
          config.table.headers.length > 0
            ? 0.5 * (1 + config.table.rows.length) + 0.5
            : 0;
        slide.addText(config.body, {
          x: 1.0,
          y: 1.8 + tableHeight,
          w: 11,
          h: 2.0,
          fontSize: 16,
          fontFace: 'Helvetica',
          color: DARK,
          lineSpacingMultiple: 1.4,
        });
      }
    } else {
      // content layout
      if (config.title) {
        slide.addText(config.title, {
          x: 0.8,
          y: 0.5,
          w: 11.5,
          h: 0.8,
          fontSize: 28,
          fontFace: 'Helvetica',
          color: CORAL,
          bold: true,
        });
      }

      let yPos = 1.6;

      if (config.body) {
        slide.addText(config.body, {
          x: 0.8,
          y: yPos,
          w: 11.5,
          h: config.bullets ? 1.5 : 4.5,
          fontSize: 16,
          fontFace: 'Helvetica',
          color: DARK,
          lineSpacingMultiple: 1.5,
        });
        yPos += config.bullets ? 1.8 : 4.5;
      }

      if (config.bullets) {
        const bulletText = config.bullets.map((b) => ({
          text: b,
          options: {
            fontSize: 16,
            color: DARK,
            bullet: { code: '2022' },
            lineSpacingMultiple: 1.6,
          },
        }));
        slide.addText(bulletText, {
          x: 1.0,
          y: yPos,
          w: 11,
          h: 4.0,
          fontFace: 'Helvetica',
        });
      }

      if (config.note) {
        slide.addText(config.note, {
          x: 0.8,
          y: 6.5,
          w: 11.5,
          h: 0.4,
          fontSize: 11,
          fontFace: 'Helvetica',
          color: GRAY,
          italic: true,
        });
      }
    }
  }

  return pptx;
}

// ── Deck Definitions ──

type DeckDef = {
  key: string;
  title: string;
  src: string;
  out: string;
};

const DECKS: DeckDef[] = [
  {
    key: 'seller',
    title: 'sumitsugi - 前の住人向けピッチ',
    src: 'docs/pitch/pitch-deck-seller.md',
    out: 'docs/pitch/slides-seller.pptx',
  },
  {
    key: 'buyer',
    title: 'sumitsugi - 次の住人向けピッチ',
    src: 'docs/pitch/pitch-deck-buyer.md',
    out: 'docs/pitch/slides-buyer.pptx',
  },
  {
    key: 'management',
    title: 'sumitsugi - 管理会社向けピッチ',
    src: 'docs/pitch/pitch-deck-management.md',
    out: 'docs/pitch/slides-management.pptx',
  },
  {
    key: 'agency',
    title: 'sumitsugi - 仲介会社向けピッチ',
    src: 'docs/pitch/pitch-deck-agency.md',
    out: 'docs/pitch/slides-agency.pptx',
  },
];

// ── Main ──

async function main() {
  const target = process.argv[2] || 'all';

  for (const deck of DECKS) {
    if (target !== 'all' && target !== deck.key) continue;

    console.log(`Parsing: ${deck.src}`);
    const parsed = parseMarkdownPitchDeck(deck.src);
    const slideConfigs = parsed.map(contentToSlideConfig);

    console.log(`  → ${slideConfigs.length} slides`);

    const pptx = createPresentation(deck.title, slideConfigs);
    await pptx.writeFile({ fileName: deck.out });
    console.log(`  → Generated: ${deck.out}`);
  }
}

main().catch(console.error);
