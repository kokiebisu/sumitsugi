import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  uploadImage,
  deleteImage,
  deleteImages,
  isStorageConfigured,
} from '@/lib/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

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

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `対応していないファイル形式です: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'ファイルサイズが10MBを超えています' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadImage(buffer, file.type);
      urls.push(url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const body = (await request.json()) as { urls?: string[] };
    const urls: string[] = body.urls ?? [];

    if (urls.length === 0) {
      return NextResponse.json(
        { error: '削除するURLが指定されていません' },
        { status: 400 }
      );
    }

    if (urls.length === 1) {
      await deleteImage(urls[0]);
    } else {
      await deleteImages(urls);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
