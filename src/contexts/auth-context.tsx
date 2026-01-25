"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, SellerProfile, UserListing, Inquiry } from "@/lib/data";
import { inquiries as mockInquiries } from "@/lib/data";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  becomeSeller: (sellerProfile: SellerProfile) => void;
  listings: UserListing[];
  addListing: (
    listing: Omit<UserListing, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => UserListing;
  updateListing: (id: string, updates: Partial<UserListing>) => void;
  deleteListing: (id: string) => void;
  publishListing: (id: string) => void;
  inquiries: Inquiry[];
  addInquiry: (
    inquiry: Omit<Inquiry, "id" | "submittedAt" | "updatedAt">,
  ) => Inquiry;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tsumugi_user";
const LISTINGS_STORAGE_KEY = "tsumugi_listings";
const INQUIRIES_STORAGE_KEY = "tsumugi_inquiries";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化: localStorageから復元
  useEffect(() => {
    // 開発モード: 常にモックデータを使用（localStorageを無視）
    if (process.env.NODE_ENV === "development") {
      setInquiries(mockInquiries);

      // 開発モード: テストユーザーとして自動ログイン
      const devUser: User = {
        id: "dev_user_001",
        name: "田中 花子",
        email: "tanaka@example.com",
        isSeller: false,
        createdAt: new Date().toISOString(),
      };
      setUser(devUser);

      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const storedListings = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (storedListings) {
      try {
        setListings(JSON.parse(storedListings));
      } catch {
        localStorage.removeItem(LISTINGS_STORAGE_KEY);
      }
    }

    const storedInquiries = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (storedInquiries) {
      try {
        setInquiries(JSON.parse(storedInquiries));
      } catch {
        localStorage.removeItem(INQUIRIES_STORAGE_KEY);
      }
    }

    setIsInitialized(true);
    setIsLoading(false);
  }, []);

  // 永続化: userが変わるたびにlocalStorageに保存（初期化完了後のみ）
  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, isInitialized]);

  // 永続化: listingsが変わるたびにlocalStorageに保存（初期化完了後のみ）
  // 注意: Base64画像データが大きすぎる場合はクォータエラーになる可能性がある
  useEffect(() => {
    if (!isInitialized) return;
    try {
      // 写真データも含めて保存を試みる
      localStorage.setItem(
        LISTINGS_STORAGE_KEY,
        JSON.stringify(listings),
      );
    } catch (e) {
      // QuotaExceededError の場合は写真データを除外して再試行
      console.warn("Failed to save listings with photos, trying without photos:", e);
      try {
        const listingsWithoutPhotos = listings.map((listing) => ({
          ...listing,
          roomPhotos: [], // Base64データは保存しない
        }));
        localStorage.setItem(
          LISTINGS_STORAGE_KEY,
          JSON.stringify(listingsWithoutPhotos),
        );
      } catch (e2) {
        console.error("Failed to save listings to localStorage:", e2);
      }
    }
  }, [listings, isInitialized]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const becomeSeller = (sellerProfile: SellerProfile) => {
    if (user) {
      setUser({
        ...user,
        isSeller: true,
        sellerProfile,
      });
    }
  };

  const addListing = (
    listing: Omit<UserListing, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => {
    if (!user) throw new Error("User must be logged in to add a listing");
    const now = new Date().toISOString();
    const newListing: UserListing = {
      ...listing,
      id: `${Date.now()}`,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };
    setListings((prev) => [...prev, newListing]);
    return newListing;
  };

  const updateListing = (id: string, updates: Partial<UserListing>) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id
          ? { ...listing, ...updates, updatedAt: new Date().toISOString() }
          : listing,
      ),
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
  };

  const publishListing = (id: string) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              status: "published" as const,
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : listing,
      ),
    );
  };

  const addInquiry = (
    inquiry: Omit<Inquiry, "id" | "submittedAt" | "updatedAt">,
  ) => {
    const now = new Date().toISOString();
    const newInquiry: Inquiry = {
      ...inquiry,
      id: `inquiry_${Date.now()}`,
      submittedAt: now,
      updatedAt: now,
    };
    setInquiries((prev) => [...prev, newInquiry]);
    return newInquiry;
  };

  // 永続化: inquiriesが変わるたびにlocalStorageに保存（初期化完了後のみ）
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
    } catch (e) {
      console.error("Failed to save inquiries to localStorage:", e);
    }
  }, [inquiries, isInitialized]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        becomeSeller,
        listings,
        addListing,
        updateListing,
        deleteListing,
        publishListing,
        inquiries,
        addInquiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
