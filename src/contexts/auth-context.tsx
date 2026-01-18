"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, HostProfile, UserListing } from "@/lib/data";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  becomeHost: (hostProfile: HostProfile) => void;
  listings: UserListing[];
  addListing: (
    listing: Omit<UserListing, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => UserListing;
  updateListing: (id: string, updates: Partial<UserListing>) => void;
  deleteListing: (id: string) => void;
  publishListing: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tsumugi_user";
const LISTINGS_STORAGE_KEY = "tsumugi_listings";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化: localStorageから復元
  useEffect(() => {
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
      // 写真データを除外した軽量版を保存
      const listingsWithoutPhotos = listings.map((listing) => ({
        ...listing,
        roomPhotos: [], // Base64データは保存しない
        interiorPhotos:
          listing.interiorPhotos?.map((p) => ({ ...p, photo: undefined })) ||
          [],
      }));
      localStorage.setItem(
        LISTINGS_STORAGE_KEY,
        JSON.stringify(listingsWithoutPhotos),
      );
    } catch (e) {
      // QuotaExceededError の場合は無視（写真データが大きすぎる）
      console.warn("Failed to save listings to localStorage:", e);
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

  const becomeHost = (hostProfile: HostProfile) => {
    if (user) {
      setUser({
        ...user,
        isHost: true,
        hostProfile,
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
      id: `listing_${Date.now()}`,
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        becomeHost,
        listings,
        addListing,
        updateListing,
        deleteListing,
        publishListing,
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
