import { NextResponse } from 'next/server';
import { getImage } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join('/');

  const result = await getImage(key);
  if (!result) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(result.body, {
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
