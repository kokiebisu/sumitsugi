import { NextResponse } from 'next/server';
import { createElement } from 'react';
import zod from 'zod';
const z = zod;
import { auth } from '@/lib/auth';
import { renderPdf } from '@/lib/pdf/render';
import { ConsultationDocument } from '@/lib/pdf/templates/consultation-document';
import { generateQrCodeDataUrl, FAQ_PAGE_URL } from '@/lib/pdf/qr-code';
import { uploadPdf, isStorageConfigured } from '@/lib/storage';

const MAX_RETRIES = 3;

const furnitureItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
});

const generatePdfSchema = z.object({
  propertyName: z.string().min(1),
  propertyAddress: z.string().min(1),
  moveOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sellerName: z.string().optional().default('未設定'),
  furnitureItems: z.array(furnitureItemSchema).min(1),
});

interface FurnitureItem {
  name: string;
  category: string;
  description?: string;
}

interface GeneratePdfInput {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: FurnitureItem[];
}

function formatCreatedDate(): string {
  return new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function buildConsultationElement(input: GeneratePdfInput) {
  const faqQrCodeDataUrl = await generateQrCodeDataUrl(FAQ_PAGE_URL);
  return createElement(ConsultationDocument, {
    propertyName: input.propertyName,
    propertyAddress: input.propertyAddress,
    moveOutDate: input.moveOutDate,
    sellerName: input.sellerName ?? '未設定',
    furnitureItems: input.furnitureItems,
    createdDate: formatCreatedDate(),
    faqQrCodeDataUrl,
  });
}

async function uploadWithRetry(
  buffer: Buffer,
  filename: string
): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await uploadPdf(buffer, filename);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error('アップロードに失敗しました');
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    if (!isStorageConfigured()) {
      return NextResponse.json(
        { error: 'ストレージが設定されていません' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'リクエストの解析に失敗しました' },
        { status: 400 }
      );
    }

    const parsed = generatePdfSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'バリデーションエラー',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const element = await buildConsultationElement(parsed.data);
    const pdfBuffer = await renderPdf(element);
    const url = await uploadWithRetry(pdfBuffer, 'consultation');

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'PDF生成に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
