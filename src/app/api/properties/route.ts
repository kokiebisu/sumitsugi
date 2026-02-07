import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import zod from 'zod';
const z = zod;
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { furnitureItemSchema, landlordConsentSchema } from '@/lib/validations';

const createPropertySchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(500),
  summary: z.string().optional(),
  images: z.array(z.string()).default([]),
  handoverFee: z.number().int().nonnegative().optional(),
  rent: z.number().int().nonnegative().optional(),
  managementFee: z.number().int().nonnegative().optional(),
  deposit: z.string().optional(),
  keyMoney: z.string().optional(),
  area: z.string().max(100).optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  neighborhood: z.string().max(255).optional(),
  layout: z.string().max(50).optional(),
  occupancy: z.number().int().nonnegative().optional(),
  style: z.string().max(50).optional(),
  furnitureItems: z.array(furnitureItemSchema).optional(),
  condition: z.enum(['excellent', 'good', 'used']).optional(),
  estimatedDuration: z.string().max(50).optional(),
  landlordConsent: landlordConsentSchema.default({ status: 'pending' }),
  amenities: z.array(z.string()).optional(),
  furnitureDescription: z.string().optional(),
  story: z.string().optional(),
  conditions: z.string().optional(),
  handoverDetails: z
    .object({
      included: z.array(z.string()).optional(),
      notIncluded: z.array(z.string()).optional(),
      viewingAvailableFrom: z.string().optional(),
      moveInAvailableFrom: z.string().optional(),
    })
    .optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
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
    .optional(),
});

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

    const body: unknown = await request.json();
    const parsed = createPropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const id = randomUUID();

    const [created] = await db
      .insert(properties)
      .values({
        id,
        userId: session.user.id,
        title: data.title,
        summary: data.summary,
        images: data.images,
        status: 'draft',
        handoverFee: data.handoverFee,
        rent: data.rent,
        managementFee: data.managementFee,
        deposit: data.deposit,
        keyMoney: data.keyMoney,
        area: data.area,
        lat: data.lat,
        lng: data.lng,
        neighborhood: data.neighborhood,
        layout: data.layout,
        occupancy: data.occupancy,
        style: data.style,
        furnitureItems: data.furnitureItems,
        condition: data.condition,
        estimatedDuration: data.estimatedDuration,
        landlordConsent: data.landlordConsent,
        amenities: data.amenities,
        furnitureDescription: data.furnitureDescription,
        story: data.story,
        conditions: data.conditions,
        handoverDetails: data.handoverDetails,
        faq: data.faq,
        handoverHost: data.handoverHost,
      })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'プロパティの作成に失敗しました' },
      { status: 500 }
    );
  }
}
