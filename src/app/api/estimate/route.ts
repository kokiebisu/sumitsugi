import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

import type { EstimateInput, EstimateResult } from "@/lib/estimate-service"

const FURNITURE_LABELS: Record<string, string> = {
  bed: "ベッド",
  sofa: "ソファ",
  desk: "デスク",
  table: "テーブル",
  storage: "収納",
  wardrobe: "ワードローブ",
  tv: "テレビ台",
  fridge: "冷蔵庫",
}

function buildPrompt(input: EstimateInput): string {
  const furnitureList = input.furniture
    .map((f) => FURNITURE_LABELS[f] || f)
    .join("、")

  return `あなたは日本の不動産市場における家具・インテリアの価値評価の専門家です。
以下の条件で、家具の処分費用と引き継ぎ価値を見積もってください。

## 条件
- エリア: ${input.area}
- 家具リスト: ${furnitureList}
${input.rent ? `- 家賃: ${input.rent.toLocaleString()}円/月` : ""}
${input.layout ? `- 間取り: ${input.layout}` : ""}

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

JSON形式のみで回答してください。説明文は不要です。`
}

function parseAIResponse(content: string): EstimateResult {
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI response does not contain valid JSON")
  }

  const parsed = JSON.parse(jsonMatch[0])

  const savingsMin = parsed.handoverFeeMin + parsed.disposalCostMin
  const savingsMax = parsed.handoverFeeMax + parsed.disposalCostMax

  return {
    disposalCostMin: parsed.disposalCostMin,
    disposalCostMax: parsed.disposalCostMax,
    handoverFeeMin: parsed.handoverFeeMin,
    handoverFeeMax: parsed.handoverFeeMax,
    savingsMin,
    savingsMax,
    breakdown: parsed.breakdown,
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      )
    }

    const input: EstimateInput = await request.json()

    if (!input.furniture || input.furniture.length === 0) {
      return NextResponse.json({
        disposalCostMin: 0,
        disposalCostMax: 0,
        handoverFeeMin: 0,
        handoverFeeMax: 0,
        savingsMin: 0,
        savingsMax: 0,
        breakdown: [],
      })
    }

    const client = new Anthropic({ apiKey })
    const prompt = buildPrompt(input)

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })

    const textContent = message.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in AI response")
    }

    const result = parseAIResponse(textContent.text)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: "Failed to generate estimate" },
      { status: 500 }
    )
  }
}
