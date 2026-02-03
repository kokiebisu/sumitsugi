#!/usr/bin/env bun

/**
 * Daily Knowledge Update Script - Ralph Loop
 *
 * 毎日、各役員が10トピックずつClaudeの知識ベースから洞察を生成し、
 * docs/team/{role}/knowledge/YYYY-MM-DD.md に追記
 *
 * 全役員合計: 50トピック/日
 * （Claude Code CLI使用・Max subscription対応版）
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { format } from 'date-fns';
import { $ } from 'bun';

const ROLES = ['ceo', 'cmo', 'cfo', 'cto', 'clo'] as const;
type Role = (typeof ROLES)[number];

// 各役員が毎日検索するトピック（10個ずつ）
const SEARCH_TOPICS: Record<Role, string[]> = {
  ceo: [
    'startup funding trends Japan 2026',
    'marketplace business model success 2026',
    'product market fit indicators 2026',
    'go-to-market strategy B2C 2026',
    'network effects platform business 2026',
    'cold start problem marketplace solution 2026',
    'startup traction metrics KPI 2026',
    'investor pitch deck best practices 2026',
    'subscription economy bundling trends 2026',
    'platform ecosystem strategy 2026',
  ],
  cmo: [
    'UGC marketing ROI Instagram 2026',
    'influencer marketing micro creators 2026',
    'Gen Z social media trends 2026',
    'referral program marketplace 2026',
    'content marketing authenticity 2026',
    'viral growth loops product-led 2026',
    'TikTok algorithm engagement 2026',
    'brand storytelling authenticity 2026',
    'community building loyalty 2026',
    'social commerce trends 2026',
  ],
  cfo: [
    'marketplace unit economics 2026',
    'CAC LTV optimization startup 2026',
    'SaaS financial modeling 2026',
    'startup runway management 2026',
    'embedded finance BaaS Japan 2026',
    'burn rate investor expectations 2026',
    'marketplace take rate benchmarks 2026',
    'gross margin contribution margin 2026',
    'revenue forecasting methods 2026',
    'startup valuation metrics 2026',
  ],
  cto: [
    'Next.js performance optimization 2026',
    'React Server Components streaming 2026',
    'API design REST GraphQL tRPC 2026',
    'serverless edge computing 2026',
    'authentication security best practices 2026',
    'database architecture Prisma Supabase 2026',
    'WebAssembly Rust performance 2026',
    'Next.js App Router patterns 2026',
    'Vercel Edge Functions optimization 2026',
    'TypeScript type safety patterns 2026',
  ],
  clo: [
    'プラットフォーム事業 特定商取引法 2026',
    '資金決済法 エスクロー 規制 2026',
    '個人情報保護法 データ保持期間 2026',
    '利用規約 免責事項 プラットフォーム 2026',
    'AI生成コンテンツ 著作権 日本 2026',
    '消費者契約法 改正 プラットフォーム 2026',
    '電子契約 法的効力 日本 2026',
    'Cookie規制 プライバシーサンドボックス 2026',
    '匿名加工情報 個人情報保護法 2026',
    '取引デジタルプラットフォーム消費者保護法 2026',
  ],
};

const ROLE_CONTEXT: Record<Role, string> = {
  ceo: '戦略的視点から、スタートアップの成長・投資・ビジネスモデルに関する洞察',
  cmo: 'マーケティング視点から、ユーザー獲得・ブランディング・成長戦略に関する洞察',
  cfo: '財務視点から、ユニットエコノミクス・収益性・資金管理に関する洞察',
  cto: '技術視点から、アーキテクチャ・パフォーマンス・開発ベストプラクティスに関する洞察',
  clo: '法務視点から、規制・コンプライアンス・リスク管理に関する洞察',
};

/**
 * Claude Code CLIを使用して洞察を生成
 * Max subscription のトークンを使用
 */
async function generateInsights(query: string, role: Role): Promise<string> {
  const prompt = `あなたは${role.toUpperCase()}（${ROLE_CONTEXT[role]}）です。

トピック: "${query}"

このトピックについて、最新のトレンドや重要なポイントを3-5つの箇条書きで日本語で説明してください。
各ポイントは簡潔に（1-2文）、実用的な洞察を含めてください。

フォーマット:
- **ポイント1:** 説明
- **ポイント2:** 説明
- **ポイント3:** 説明`;

  try {
    // Claude Code CLI in print mode (uses Max subscription token)
    const result = await $`claude -p ${prompt} --no-config`.text();
    return result.trim() || '洞察を生成できませんでした';
  } catch (error) {
    throw new Error(`Claude CLI failed: ${error}`);
  }
}

/**
 * 既存のknowledgeファイルに追記
 */
function appendToKnowledgeFile(role: Role, date: string, content: string) {
  const dir = `docs/team/${role}/knowledge`;
  const filePath = `${dir}/${date}.md`;

  // ディレクトリが存在しなければ作成
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // ファイルが存在しなければ新規作成、存在すれば追記
  let existingContent = '';
  if (existsSync(filePath)) {
    existingContent = readFileSync(filePath, 'utf-8');
  } else {
    existingContent = `# ${role.toUpperCase()} Knowledge - ${date}\n\n`;
  }

  // 追記
  const updatedContent = existingContent + content;
  writeFileSync(filePath, updatedContent, 'utf-8');

  console.log(`✅ Appended to ${filePath}`);
}

/**
 * 役員ごとに洞察を生成（10トピックずつ）
 */
async function processRole(role: Role, date: string) {
  console.log(`\n👤 Processing ${role.toUpperCase()}...`);

  const topics = SEARCH_TOPICS[role];
  let markdown = `\n## Daily Update (${date})\n\n`;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`  [${i + 1}/10] 🔍 ${topic}`);

    try {
      const insights = await generateInsights(topic, role);
      markdown += `### ${i + 1}. ${topic}\n\n${insights}\n\n`;

      // Rate limiting対策（2秒待機）
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      markdown += `### ${i + 1}. ${topic}\n\n**Error**: ${error}\n\n`;
    }
  }

  markdown += `---\n`;

  // ファイルに追記
  appendToKnowledgeFile(role, date, markdown);
}

async function main() {
  const today = format(new Date(), 'yyyy-MM-dd');

  console.log(`📅 Date: ${today}`);
  console.log(`📊 Target: 50 insights (10 per role)`);
  console.log(`🔐 Using Claude Code CLI (Max subscription)`);
  console.log(`\n🧠 Starting Ralph Loop (knowledge-based)...`);

  // Verify Claude CLI is available
  try {
    const version = await $`claude --version`.text();
    console.log(`✅ Claude CLI: ${version.trim()}`);
  } catch {
    console.error('❌ Claude CLI not found. Please install Claude Code CLI.');
    process.exit(1);
  }

  // 全役員を順次処理
  for (const role of ROLES) {
    await processRole(role, today);
  }

  console.log(`\n✅ Daily knowledge update completed!`);
  console.log(`📁 Files updated in docs/team/*/knowledge/${today}.md`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
