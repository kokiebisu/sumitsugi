import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { properties } from '@/db/schema';

/**
 * GET /api/properties/my
 *
 * ログインユーザーの物件一覧を取得（draft含む）。
 * 作成日時降順でソート。
 */
export async function GET(request: Request) {
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

    const items = await db
      .select()
      .from(properties)
      .where(eq(properties.userId, session.user.id))
      .orderBy(desc(properties.createdAt));

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Failed to fetch user properties:', error);
    return NextResponse.json(
      { error: 'プロパティの取得に失敗しました' },
      { status: 500 }
    );
  }
}
