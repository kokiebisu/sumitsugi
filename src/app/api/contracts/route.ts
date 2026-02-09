import { NextResponse } from 'next/server';
import { eq, desc, or, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import zod from 'zod';
const z = zod;
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { electronicContracts } from '@/db/schema';

const createContractSchema = z.object({
  propertyId: z.string().min(1),
  inquiryId: z.string().optional(),
  buyerId: z.string().min(1),
  contractType: z
    .enum(['handover_agreement', 'goods_consent'])
    .default('handover_agreement'),
  propertyTitle: z.string().min(1).max(500),
  propertyAddress: z.string().optional(),
  sellerName: z.string().min(1).max(255),
  sellerEmail: z.string().email(),
  buyerName: z.string().min(1).max(255),
  buyerEmail: z.string().email(),
  handoverFee: z.number().int().nonnegative(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        condition: z.enum(['excellent', 'good', 'fair', 'poor']),
        photos: z.array(z.string()),
        notes: z.string().optional(),
      })
    )
    .default([]),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = createContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const [created] = await db
      .insert(electronicContracts)
      .values({
        id,
        propertyId: data.propertyId,
        inquiryId: data.inquiryId,
        sellerId: session.user.id,
        buyerId: data.buyerId,
        contractType: data.contractType,
        status: 'draft',
        propertyTitle: data.propertyTitle,
        propertyAddress: data.propertyAddress,
        sellerName: data.sellerName,
        sellerEmail: data.sellerEmail,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        handoverFee: data.handoverFee,
        items: data.items,
        auditTrail: [
          {
            action: 'created',
            performedBy: session.user.id,
            performedAt: now.toISOString(),
          },
        ],
        expiresAt,
      })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create contract:', error);
    return NextResponse.json(
      { error: '契約書の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      parseInt(searchParams.get('page') || '1', 10) || 1
    );
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20)
    );
    const offset = (page - 1) * limit;
    const userId = session.user.id;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(electronicContracts)
        .where(
          or(
            eq(electronicContracts.sellerId, userId),
            eq(electronicContracts.buyerId, userId)
          )
        )
        .orderBy(desc(electronicContracts.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(electronicContracts)
        .where(
          or(
            eq(electronicContracts.sellerId, userId),
            eq(electronicContracts.buyerId, userId)
          )
        ),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return NextResponse.json({
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    return NextResponse.json(
      { error: '契約書の取得に失敗しました' },
      { status: 500 }
    );
  }
}
