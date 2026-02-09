import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import zod from 'zod';
const z = zod;
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { electronicContracts } from '@/db/schema';
import type { AuditEntry, SignatureData } from '@/db/schema';

const signContractSchema = z.object({
  action: z.enum(['sign']),
  name: z.string().min(1, '署名者名は必須です'),
});

const updateStatusSchema = z.object({
  action: z.enum(['send', 'complete']),
});

const patchSchema = z.discriminatedUnion('action', [
  signContractSchema,
  updateStatusSchema,
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    const [contract] = await db
      .select()
      .from(electronicContracts)
      .where(
        and(
          eq(electronicContracts.id, id),
          or(
            eq(electronicContracts.sellerId, userId),
            eq(electronicContracts.buyerId, userId)
          )
        )
      );

    if (!contract) {
      return NextResponse.json(
        { error: '契約書が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: contract });
  } catch (error) {
    console.error('Failed to fetch contract:', error);
    return NextResponse.json(
      { error: '契約書の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;
    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Fetch the contract
    const [contract] = await db
      .select()
      .from(electronicContracts)
      .where(
        and(
          eq(electronicContracts.id, id),
          or(
            eq(electronicContracts.sellerId, userId),
            eq(electronicContracts.buyerId, userId)
          )
        )
      );

    if (!contract) {
      return NextResponse.json(
        { error: '契約書が見つかりません' },
        { status: 404 }
      );
    }

    const now = new Date();
    const action = parsed.data.action;

    if (action === 'send') {
      return handleSend(contract, userId, now);
    }

    if (action === 'sign') {
      const { name } = parsed.data;
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        undefined;
      return handleSign(contract, userId, name, ipAddress ?? undefined, now);
    }

    if (action === 'complete') {
      return handleComplete(contract, userId, now);
    }

    return NextResponse.json(
      { error: '不正なアクションです' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to update contract:', error);
    return NextResponse.json(
      { error: '契約書の更新に失敗しました' },
      { status: 500 }
    );
  }
}

async function handleSend(
  contract: typeof electronicContracts.$inferSelect,
  userId: string,
  now: Date
) {
  if (contract.status !== 'draft') {
    return NextResponse.json(
      { error: 'ドラフト状態の契約のみ送信できます' },
      { status: 400 }
    );
  }

  if (contract.sellerId !== userId) {
    return NextResponse.json(
      { error: '契約書の送信は前の住人のみ可能です' },
      { status: 403 }
    );
  }

  const auditEntry: AuditEntry = {
    action: 'sent_for_signature',
    performedBy: userId,
    performedAt: now.toISOString(),
  };

  const [updated] = await db
    .update(electronicContracts)
    .set({
      status: 'pending_seller_signature',
      auditTrail: [...(contract.auditTrail || []), auditEntry],
      updatedAt: now,
    })
    .where(eq(electronicContracts.id, contract.id))
    .returning();

  return NextResponse.json({ data: updated });
}

async function handleSign(
  contract: typeof electronicContracts.$inferSelect,
  userId: string,
  name: string,
  ipAddress: string | undefined,
  now: Date
) {
  const isSeller = contract.sellerId === userId;
  const isBuyer = contract.buyerId === userId;

  const signature: SignatureData = {
    name,
    signedAt: now.toISOString(),
    ipAddress,
  };

  const auditEntry: AuditEntry = {
    action: isSeller ? 'seller_signed' : 'buyer_signed',
    performedBy: userId,
    performedAt: now.toISOString(),
    metadata: { signatureName: name },
  };

  if (isSeller && contract.status === 'pending_seller_signature') {
    const [updated] = await db
      .update(electronicContracts)
      .set({
        sellerSignature: signature,
        status: 'pending_buyer_signature',
        auditTrail: [...(contract.auditTrail || []), auditEntry],
        updatedAt: now,
      })
      .where(eq(electronicContracts.id, contract.id))
      .returning();

    return NextResponse.json({ data: updated });
  }

  if (isBuyer && contract.status === 'pending_buyer_signature') {
    const [updated] = await db
      .update(electronicContracts)
      .set({
        buyerSignature: signature,
        status: 'signed',
        signedAt: now,
        auditTrail: [...(contract.auditTrail || []), auditEntry],
        updatedAt: now,
      })
      .where(eq(electronicContracts.id, contract.id))
      .returning();

    return NextResponse.json({ data: updated });
  }

  return NextResponse.json(
    { error: '現在のステータスでは署名できません' },
    { status: 400 }
  );
}

async function handleComplete(
  contract: typeof electronicContracts.$inferSelect,
  userId: string,
  now: Date
) {
  if (contract.status !== 'signed') {
    return NextResponse.json(
      { error: '署名済みの契約のみ完了にできます' },
      { status: 400 }
    );
  }

  if (contract.sellerId !== userId) {
    return NextResponse.json(
      { error: '契約の完了は前の住人のみ可能です' },
      { status: 403 }
    );
  }

  const auditEntry: AuditEntry = {
    action: 'completed',
    performedBy: userId,
    performedAt: now.toISOString(),
  };

  const [updated] = await db
    .update(electronicContracts)
    .set({
      status: 'completed',
      completedAt: now,
      auditTrail: [...(contract.auditTrail || []), auditEntry],
      updatedAt: now,
    })
    .where(eq(electronicContracts.id, contract.id))
    .returning();

  return NextResponse.json({ data: updated });
}
