'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, Instagram, Globe, Youtube } from 'lucide-react';

export default function AccountEditPage() {
  const { user, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
  });
  const [hostFormData, setHostFormData] = useState({
    occupation: '',
    bio: '',
    instagram: '',
    twitter: '',
    website: '',
    youtube: '',
    tiktok: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
      if (user.isSeller && user.sellerProfile) {
        setHostFormData({
          occupation: user.sellerProfile.occupation || '',
          bio: user.sellerProfile.bio || '',
          instagram: user.sellerProfile.socialLinks?.instagram || '',
          twitter: user.sellerProfile.socialLinks?.twitter || '',
          website: user.sellerProfile.socialLinks?.website || '',
          youtube: user.sellerProfile.socialLinks?.youtube || '',
          tiktok: user.sellerProfile.socialLinks?.tiktok || '',
        });
      }
    }
  }, [user, isLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 実際はここでファイルをアップロードしてURLを取得
      // 今回はダミーとしてファイルのData URLを使用
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, avatarUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!user || !formData.name.trim() || !formData.email.trim()) {
      return;
    }

    setIsSaving(true);
    // シミュレート：実際はAPI呼び出し
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updates: Partial<typeof user> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      avatarUrl: formData.avatarUrl || undefined,
    };

    // 前の住人プロフィールの更新
    if (user.isSeller && user.sellerProfile) {
      updates.sellerProfile = {
        ...user.sellerProfile,
        occupation: hostFormData.occupation.trim(),
        bio: hostFormData.bio.trim(),
        socialLinks: {
          ...user.sellerProfile.socialLinks,
          instagram: hostFormData.instagram.trim() || undefined,
          twitter: hostFormData.twitter.trim() || undefined,
          website: hostFormData.website.trim() || undefined,
          youtube: hostFormData.youtube.trim() || undefined,
          tiktok: hostFormData.tiktok.trim() || undefined,
        },
      };
    }

    updateUser(updates);

    setIsSaving(false);
    router.push('/account');
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            読み込み中...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* 戻るリンク */}
          <Link
            href="/account"
            className="mb-8 inline-flex items-center gap-2 text-sm text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            アカウントに戻る
          </Link>

          <h1 className="mb-8 text-3xl font-semibold text-foreground">
            個人情報
          </h1>

          <div className="space-y-6">
            {/* プロフィール写真 */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  プロフィール写真
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  写真をアップロードするか、デフォルトのアバターを使用します
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden"
                    style={{ backgroundColor: '#FF385C' }}
                  >
                    {formData.avatarUrl ? (
                      <Image
                        src={formData.avatarUrl}
                        alt={user.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    写真をアップロード
                  </Button>
                  {formData.avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveImage}
                    >
                      削除
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 法的な商号、名前または氏名 */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    法的な商号、名前または氏名
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.name}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    姓名
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="姓名を入力"
                  />
                </div>
              </div>
            </div>

            {/* メールアドレス */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  メールアドレス
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  ログインや通知に使用されます
                </p>
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="メールアドレスを入力"
              />
            </div>

            {/* 電話番号 */}
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  電話番号
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  次の住人との連絡に使用されます
                </p>
              </div>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="090-1234-5678"
              />
            </div>

            {/* 前の住人プロフィール（セラーのみ） */}
            {user.isSeller && (
              <>
                <div className="pt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    前の住人プロフィール
                  </h2>
                </div>

                {/* 職業・活動 */}
                <div className="rounded-xl border border-border bg-background p-6">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">
                      職業・活動
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      あなたの職業や主な活動内容を入力してください
                    </p>
                  </div>
                  <Input
                    value={hostFormData.occupation}
                    onChange={(e) =>
                      setHostFormData({
                        ...hostFormData,
                        occupation: e.target.value,
                      })
                    }
                    placeholder="例：Webデザイナー、フリーランスエンジニア"
                  />
                </div>

                {/* 自己紹介 */}
                <div className="rounded-xl border border-border bg-background p-6">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">
                      自己紹介
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      あなた自身について紹介してください。入居希望者に表示されます
                    </p>
                  </div>
                  <Textarea
                    value={hostFormData.bio}
                    onChange={(e) =>
                      setHostFormData({ ...hostFormData, bio: e.target.value })
                    }
                    placeholder="自己紹介を入力..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {/* SNSリンク */}
                <div className="rounded-xl border border-border bg-background p-6">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">
                      SNS
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      SNSアカウントを追加して、入居希望者にあなたの活動を見てもらいましょう
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </label>
                      <Input
                        value={hostFormData.instagram}
                        onChange={(e) =>
                          setHostFormData({
                            ...hostFormData,
                            instagram: e.target.value,
                          })
                        }
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="text-sm">𝕏</span>X (Twitter)
                      </label>
                      <Input
                        value={hostFormData.twitter}
                        onChange={(e) =>
                          setHostFormData({
                            ...hostFormData,
                            twitter: e.target.value,
                          })
                        }
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Youtube className="h-4 w-4" />
                        YouTube
                      </label>
                      <Input
                        value={hostFormData.youtube}
                        onChange={(e) =>
                          setHostFormData({
                            ...hostFormData,
                            youtube: e.target.value,
                          })
                        }
                        placeholder="@channel または URL"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                        TikTok
                      </label>
                      <Input
                        value={hostFormData.tiktok}
                        onChange={(e) =>
                          setHostFormData({
                            ...hostFormData,
                            tiktok: e.target.value,
                          })
                        }
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Globe className="h-4 w-4" />
                        ウェブサイト
                      </label>
                      <Input
                        value={hostFormData.website}
                        onChange={(e) =>
                          setHostFormData({
                            ...hostFormData,
                            website: e.target.value,
                          })
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 保存ボタン */}
          <div className="mt-8 flex gap-3">
            <Button
              type="submit"
              onClick={handleSave}
              disabled={
                isSaving || !formData.name.trim() || !formData.email.trim()
              }
              className="bg-[#E61E4D] hover:bg-[#D01346] text-white"
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
            <Button onClick={() => router.push('/account')} variant="outline">
              キャンセル
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
