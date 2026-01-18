"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, LogOut, UserCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { CustomSignupDialog } from "@/components/auth/custom-signup-dialog";

export function Header() {
  const { user, login, logout } = useAuth();
  const pathname = usePathname();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null,
  );

  // クリエイターモードのページかどうか
  const isCreatorMode = pathname?.startsWith("/listing");

  const handleBecomeCreatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setRedirectAfterLogin("/creator");
      setShowSignupDialog(true);
    } else {
      window.location.href = "/creator";
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
          {(!user || !user.isHost) && (
            <button
              onClick={handleBecomeCreatorClick}
              className="hidden text-sm font-semibold text-foreground transition-colors hover:bg-muted rounded-full px-3 py-2 sm:block"
            >
              {user ? "クリエイターモード" : "クリエイターになる"}
            </button>
          )}

          {/* リスティング / 入居者に戻る - ホストのみ表示 */}
          {user?.isHost && (
            <Link
              href={isCreatorMode ? "/" : "/listing"}
              className="hidden text-sm font-semibold text-foreground transition-colors hover:bg-muted rounded-full px-3 py-2 sm:block"
            >
              {isCreatorMode ? "入居者に戻る" : "リスティング"}
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
                  // ログイン時: Notion風シンプルアバター
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F5F5F5] overflow-hidden">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={30}
                        height={30}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <svg viewBox="0 0 32 32" className="w-[22px] h-[22px]">
                        {/* シンプルな顔 - Notion風 */}
                        <circle
                          cx="16"
                          cy="12"
                          r="7"
                          fill="none"
                          stroke="#37352F"
                          strokeWidth="1.5"
                        />
                        <circle cx="13" cy="11" r="1" fill="#37352F" />
                        <circle cx="19" cy="11" r="1" fill="#37352F" />
                        <path
                          d="M13 14.5 Q16 17 19 14.5"
                          fill="none"
                          stroke="#37352F"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 28 Q8 20 16 20 Q24 20 24 28"
                          fill="none"
                          stroke="#37352F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                ) : (
                  // 未ログイン時: Notion風シンプルアバター
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F5F5F5] overflow-hidden">
                    <svg viewBox="0 0 32 32" className="w-[22px] h-[22px]">
                      {/* シンプルな顔 - Notion風 */}
                      <circle
                        cx="16"
                        cy="12"
                        r="7"
                        fill="none"
                        stroke="#91918E"
                        strokeWidth="1.5"
                      />
                      <circle cx="13" cy="11" r="1" fill="#91918E" />
                      <circle cx="19" cy="11" r="1" fill="#91918E" />
                      <path
                        d="M13 14.5 Q16 17 19 14.5"
                        fill="none"
                        stroke="#91918E"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 28 Q8 20 16 20 Q24 20 24 28"
                        fill="none"
                        stroke="#91918E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
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
                      href="/account"
                      className="flex items-center gap-2 py-3"
                    >
                      <UserCircle className="h-4 w-4" />
                      アカウント
                    </Link>
                  </DropdownMenuItem>
                  {user.isHost && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={isCreatorMode ? "/" : "/listing"}
                        className="flex items-center gap-2 py-3"
                      >
                        <Home className="h-4 w-4" />
                        {isCreatorMode ? "入居者に戻る" : "リスティング"}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {!user.isHost && (
                    <DropdownMenuItem
                      onClick={handleBecomeCreatorClick}
                      className="flex items-center gap-2 py-3 font-medium cursor-pointer"
                    >
                      クリエイターモード
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
                    クリエイターになる
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
