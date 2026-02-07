import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import zod from 'zod';
const z = zod;
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { furnitureItemSchema, landlordConsentSchema } from '@/lib/validations';

const updatePropertySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  summary: z.string().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['draft', 'public']).optional(),
  handoverFee: z.number().int().nonnegative().optional().nullable(),
  rent: z.number().int().nonnegative().optional().nullable(),
  managementFee: z.number().int().nonnegative().optional().nullable(),
  deposit: z.string().optional().nullable(),
  keyMoney: z.string().optional().nullable(),
  area: z.string().max(100).optional().nullable(),
  lat: z.string().optional().nullable(),
  lng: z.string().optional().nullable(),
  neighborhood: z.string().max(255).optional().nullable(),
  layout: z.string().max(50).optional().nullable(),
  occupancy: z.number().int().nonnegative().optional().nullable(),
  style: z.string().max(50).optional().nullable(),
  furnitureItems: z.array(furnitureItemSchema).optional().nullable(),
  condition: z.enum(['excellent', 'good', 'used']).optional().nullable(),
  estimatedDuration: z.string().max(50).optional().nullable(),
  landlordConsent: landlordConsentSchema.optional(),
  amenities: z.array(z.string()).optional().nullable(),
  furnitureDescription: z.string().optional().nullable(),
  story: z.string().optional().nullable(),
  conditions: z.string().optional().nullable(),
  handoverDetails: z
    .object({
      included: z.array(z.string()).optional(),
      notIncluded: z.array(z.string()).optional(),
      viewingAvailableFrom: z.string().optional(),
      moveInAvailableFrom: z.string().optional(),
    })
    .optional()
    .nullable(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional()
    .nullable(),
  handoverHost: z
    .object({
      name: z.string(),
      occupation: z.string(),
      bio: z.string(),
      avatar: z.string().optional(),
      whyChoseThis: z
        .array(z.object({ reason: z.string(), image: z.string().optional() }))
        .optional(),
      messageToNext: z.string().optional(),
      socialLinks: z
        .object({
          instagram: z.string().optional(),
          twitter: z.string().optional(),
          website: z.string().optional(),
          youtube: z.string().optional(),
          tiktok: z.string().optional(),
        })
        .optional(),
    })
    .optional()
    .nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!property) {
      return NextResponse.json(
        { error: '物件が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Failed to fetch property:', error);
    return NextResponse.json(
      { error: '物件の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Check ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '物件が見つかりません' },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'この物件を編集する権限がありません' },
        { status: 403 }
      );
    }

    const body: unknown = await request.json();
    const parsed = updatePropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const [updated] = await db
      .update(properties)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.userId, session.user.id)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update property:', error);
    // Return detailed error in development
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: '物件の更新に失敗しました',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Check ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '物件が見つかりません' },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'この物件を削除する権限がありません' },
        { status: 403 }
      );
    }

    await db
      .delete(properties)
      .where(
        and(eq(properties.id, id), eq(properties.userId, session.user.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete property:', error);
    return NextResponse.json(
      { error: '物件の削除に失敗しました' },
      { status: 500 }
    );
  }
}
