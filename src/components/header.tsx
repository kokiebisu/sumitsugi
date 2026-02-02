'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, LogOut, UserCircle, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { CustomSignupDialog } from '@/components/auth/custom-signup-dialog';

export function Header() {
  const { user, login, logout } = useAuth();
  const pathname = usePathname();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null
  );

  // 引き継ぎ側モードのページかどうか
  const isHandoverHostMode = pathname?.startsWith('/listing');

  const handleBecomeCreatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setRedirectAfterLogin('/listing');
      setShowSignupDialog(true);
    } else {
      window.location.href = '/listing';
    }
  };

  const handleSignupComplete = (newUser: any) => {
    login(newUser);
    setShowSignupDialog(false);

    // Redirect to the intended page after login
    if (redirectAfterLogin) {
      window.location.href = redirectAfterLogin;
      setRedirectAfterLogin(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-coral">
            tsumugi
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* クリエイターになる / クリエイターモード Button - 非ホストのみ表示 */}
          {(!user || !user.isSeller) && (
            <button
              onClick={handleBecomeCreatorClick}
              className="hidden text-sm font-semibold text-foreground transition-colors hover:bg-muted rounded-full px-3 py-2 sm:block"
            >
              {user ? '引き継ぎ側モード' : '暮らしを譲る'}
            </button>
          )}

          {/* リスティング / 入居者に戻る - ホストのみ表示 */}
          {user?.isSeller && (
            <Link
              href={isHandoverHostMode ? '/' : '/listing'}
              className="hidden text-sm font-semibold text-foreground transition-colors hover:bg-muted rounded-full px-3 py-2 sm:block"
            >
              {isHandoverHostMode ? '入居者に戻る' : 'リスティング'}
            </Link>
          )}

          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex h-[42px] items-center gap-3 rounded-full border border-gray-300 bg-white pl-3 pr-1.5 hover:shadow-md transition-shadow"
              >
                <Menu className="h-4 w-4 text-gray-600" strokeWidth={2.5} />
                {user ? (
                  // ログイン時: 他のページと統一したアバター
                  <div
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full overflow-hidden"
                    style={{ backgroundColor: '#FF385C' }}
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={30}
                        height={30}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ) : (
                  // 未ログイン時: グレーの背景
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-300 overflow-hidden">
                    <UserCircle className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {user ? (
                // ログイン時のメニュー
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 py-3"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      ダッシュボード
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 py-3"
                    >
                      <UserCircle className="h-4 w-4" />
                      アカウント
                    </Link>
                  </DropdownMenuItem>
                  {user.isSeller && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={isHandoverHostMode ? '/' : '/listing'}
                        className="flex items-center gap-2 py-3"
                      >
                        <Home className="h-4 w-4" />
                        {isHandoverHostMode ? '入居者に戻る' : 'リスティング'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {!user.isSeller && (
                    <DropdownMenuItem
                      onClick={handleBecomeCreatorClick}
                      className="flex items-center gap-2 py-3 font-medium cursor-pointer"
                    >
                      引き継ぎ側モード
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </DropdownMenuItem>
                </>
              ) : (
                // 未ログイン時のメニュー
                <>
                  <DropdownMenuItem
                    onClick={handleBecomeCreatorClick}
                    className="flex items-center gap-2 py-3 font-medium cursor-pointer"
                  >
                    暮らしを譲る
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setRedirectAfterLogin(null);
                      setShowSignupDialog(true);
                    }}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    ログインまたは登録
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CustomSignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        onSignupComplete={handleSignupComplete}
      />
    </header>
  );
}
