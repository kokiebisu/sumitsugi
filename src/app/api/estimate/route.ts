import { NextRequest, NextResponse } from 'next/server';

import type { EstimateInput, EstimateResult } from '@/lib/estimate-service';

const FURNITURE_LABELS: Record<string, string> = {
  bed: 'ベッド',
  sofa: 'ソファ',
  desk: 'デスク',
  table: 'テーブル',
  storage: '収納',
  wardrobe: 'ワードローブ',
  tv: 'テレビ台',
  fridge: '冷蔵庫',
};

function buildPrompt(input: EstimateInput): string {
  const furnitureList = input.furniture
    .map((f) => FURNITURE_LABELS[f] || f)
    .join('、');

  return `あなたは日本の不動産市場における家具・インテリアの価値評価の専門家です。
以下の条件で、家具の処分費用と引き継ぎ価値を見積もってください。

## 条件
- エリア: ${input.area}
- 家具リスト: ${furnitureList}
${input.rent ? `- 家賃: ${input.rent.toLocaleString()}円/月` : ''}
${input.layout ? `- 間取り: ${input.layout}` : ''}

## 出力形式
以下のJSON形式で回答してください。金額は全て日本円の整数値で、1000円単位に丸めてください。

{
  "disposalCostMin": 処分費用の最小値,
  "disposalCostMax": 処分費用の最大値,
  "handoverFeeMin": 引き継ぎ金額の最小値,
  "handoverFeeMax": 引き継ぎ金額の最大値,
  "breakdown": [
    {
      "item": "家具名",
      "disposalCost": 処分費用,
      "handoverValue": 引き継ぎ価値
    }
  ]
}

## 考慮事項
- 都心部（渋谷区、港区、目黒区、世田谷区など）は家具の価値が少し高くなる傾向
- 処分費用は自治体の粗大ごみ料金や業者の回収費用を参考に
- 引き継ぎ価値は中古家具市場の相場や利便性を考慮
- 家具の状態は「良好」を仮定

JSON形式のみで回答してください。説明文は不要です。`;
}

interface AIEstimateResponse {
  disposalCostMin: number;
  disposalCostMax: number;
  handoverFeeMin: number;
  handoverFeeMax: number;
  breakdown: Array<{
    item: string;
    disposalCost: number;
    handoverValue: number;
  }>;
}

function isAIEstimateResponse(obj: unknown): obj is AIEstimateResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const candidate = obj as Record<string, unknown>;

  return (
    typeof candidate.disposalCostMin === 'number' &&
    typeof candidate.disposalCostMax === 'number' &&
    typeof candidate.handoverFeeMin === 'number' &&
    typeof candidate.handoverFeeMax === 'number' &&
    Array.isArray(candidate.breakdown)
  );
}

function parseAIResponse(content: string): EstimateResult {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response does not contain valid JSON');
  }

  const parsed: unknown = JSON.parse(jsonMatch[0]);

  if (!isAIEstimateResponse(parsed)) {
    throw new Error('AI response does not match expected format');
  }

  const savingsMin = parsed.handoverFeeMin + parsed.disposalCostMin;
  const savingsMax = parsed.handoverFeeMax + parsed.disposalCostMax;

  return {
    disposalCostMin: parsed.disposalCostMin,
    disposalCostMax: parsed.disposalCostMax,
    handoverFeeMin: parsed.handoverFeeMin,
    handoverFeeMax: parsed.handoverFeeMax,
    savingsMin,
    savingsMax,
    breakdown: parsed.breakdown,
  };
}

/**
 * Call Claude API using raw HTTP with Bearer token authentication
 * Supports both OAuth tokens (Max subscription) and API keys
 */
async function callClaudeAPI(prompt: string): Promise<string> {
  const authToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!authToken && !apiKey) {
    throw new Error(
      'Neither CLAUDE_CODE_OAUTH_TOKEN nor ANTHROPIC_API_KEY configured'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  };

  // Use Bearer auth for OAuth token, x-api-key for API key
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }

  interface ClaudeResponse {
    content: Array<{ type: string; text?: string }>;
  }

  const data = (await response.json()) as ClaudeResponse;
  const textContent = data.content.find((block) => block.type === 'text');

  if (!textContent || !textContent.text) {
    throw new Error('No text content in AI response');
  }

  return textContent.text;
}

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as EstimateInput;

    if (!input.furniture || input.furniture.length === 0) {
      return NextResponse.json({
        disposalCostMin: 0,
        disposalCostMax: 0,
        handoverFeeMin: 0,
        handoverFeeMax: 0,
        savingsMin: 0,
        savingsMax: 0,
        breakdown: [],
      });
    }

    const prompt = buildPrompt(input);
    const responseText = await callClaudeAPI(prompt);
    const result = parseAIResponse(responseText);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Failed to generate estimate' },
      { status: 500 }
    );
  }
}
