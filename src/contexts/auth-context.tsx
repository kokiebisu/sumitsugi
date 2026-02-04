'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, SellerProfile, UserListing, Inquiry } from '@/lib/data';
import { inquiries as mockInquiries } from '@/lib/data';
import { authClient } from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // Authentication
  login: (user: User) => void;
  logout: () => Promise<void>;
  sendMagicLink: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  becomeSeller: (sellerProfile: SellerProfile) => void;
  // Listings (still localStorage for Phase 1)
  listings: UserListing[];
  addListing: (
    listing: Omit<UserListing, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => UserListing;
  updateListing: (id: string, updates: Partial<UserListing>) => void;
  deleteListing: (id: string) => void;
  publishListing: (id: string) => void;
  // Inquiries (still localStorage for Phase 1)
  inquiries: Inquiry[];
  addInquiry: (
    inquiry: Omit<Inquiry, 'id' | 'submittedAt' | 'updatedAt'>
  ) => Inquiry;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LISTINGS_STORAGE_KEY = 'tsumugi_listings';
const INQUIRIES_STORAGE_KEY = 'tsumugi_inquiries';

export function AuthProvider({ children }: { children: ReactNode }) {
  // better-auth session
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Local state for listings and inquiries (Phase 1: localStorage)
  const [listings, setListings] = useState<UserListing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Convert better-auth session to User type
  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || '',
        isSeller: (session.user as { isSeller?: boolean }).isSeller || false,
        isAdmin: (session.user as { isAdmin?: boolean }).isAdmin || false,
        createdAt:
          session.user.createdAt?.toString() || new Date().toISOString(),
        phone: (session.user as { phone?: string }).phone,
        avatarUrl: session.user.image || undefined,
      }
    : null;

  const isLoading = sessionLoading || !isInitialized;

  // Initialize listings and inquiries from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsInitialized(true);
      return;
    }

    // Load mock inquiries in development
    if (process.env.NODE_ENV === 'development') {
      setInquiries(mockInquiries);
    } else {
      // Load from localStorage in production
      const storedInquiries = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (storedInquiries) {
        try {
          setInquiries(JSON.parse(storedInquiries) as Inquiry[]);
        } catch {
          localStorage.removeItem(INQUIRIES_STORAGE_KEY);
        }
      }
    }

    // Load listings from localStorage
    const storedListings = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (storedListings) {
      try {
        setListings(JSON.parse(storedListings) as UserListing[]);
      } catch {
        localStorage.removeItem(LISTINGS_STORAGE_KEY);
      }
    }

    setIsInitialized(true);
  }, []);

  // Persist listings to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.warn('Failed to save listings with photos, trying without:', e);
      try {
        const listingsWithoutPhotos = listings.map((listing) => ({
          ...listing,
          roomPhotos: [],
        }));
        localStorage.setItem(
          LISTINGS_STORAGE_KEY,
          JSON.stringify(listingsWithoutPhotos)
        );
      } catch (e2) {
        console.error('Failed to save listings to localStorage:', e2);
      }
    }
  }, [listings, isInitialized]);

  // Persist inquiries to localStorage
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !isInitialized ||
      process.env.NODE_ENV === 'development'
    )
      return;
    try {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
    } catch (e) {
      console.error('Failed to save inquiries to localStorage:', e);
    }
  }, [inquiries, isInitialized]);

  // Send magic link
  const sendMagicLink = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error } = await authClient.signIn.magicLink({
          email,
          callbackURL: '/',
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (e) {
        console.error('Magic link error:', e);
        return { success: false, error: 'メール送信に失敗しました' };
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    await authClient.signOut();
  }, []);

  // Legacy login function (for backward compatibility)
  const login = useCallback((_user: User) => {
    // No-op: better-auth handles session automatically
    console.warn(
      'login() is deprecated. Use sendMagicLink() for authentication.'
    );
  }, []);

  // Update user (local state only for now)
  const updateUser = useCallback((updates: Partial<User>) => {
    // For Phase 1, this is a no-op since user comes from session
    // In Phase 2, this will call updateProfileAction
    console.warn(
      'updateUser() is not fully implemented yet. Use updateProfileAction instead.'
    );
  }, []);

  // Become seller (local state only for now)
  const becomeSeller = useCallback((_sellerProfile: SellerProfile) => {
    // For Phase 1, this is a no-op
    // In Phase 2, this will call becomeSellerAction
    console.warn(
      'becomeSeller() is not fully implemented yet. Use becomeSellerAction instead.'
    );
  }, []);

  // Listings management (localStorage)
  const addListing = useCallback(
    (
      listing: Omit<UserListing, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): UserListing => {
      if (!user) throw new Error('User must be logged in to add a listing');
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
    },
    [user]
  );

  const updateListing = useCallback(
    (id: string, updates: Partial<UserListing>) => {
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id
            ? { ...listing, ...updates, updatedAt: new Date().toISOString() }
            : listing
        )
      );
    },
    []
  );

  const deleteListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
  }, []);

  const publishListing = useCallback((id: string) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              status: 'published' as const,
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : listing
      )
    );
  }, []);

  // Inquiries management (localStorage)
  const addInquiry = useCallback(
    (inquiry: Omit<Inquiry, 'id' | 'submittedAt' | 'updatedAt'>): Inquiry => {
      const now = new Date().toISOString();
      const newInquiry: Inquiry = {
        ...inquiry,
        id: `inquiry_${Date.now()}`,
        submittedAt: now,
        updatedAt: now,
      };
      setInquiries((prev) => [...prev, newInquiry]);
      return newInquiry;
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        sendMagicLink,
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
    // During SSR, return a default context instead of throwing
    if (typeof window === 'undefined') {
      const defaultListing: UserListing = {
        id: '',
        userId: '',
        status: 'draft',
        title: '',
        roomStyle: null,
        roomPhotos: [],
        createdAt: '',
        updatedAt: '',
      };
      const defaultInquiry: Inquiry = {
        id: '',
        propertyId: '',
        propertyTitle: '',
        status: 'pending',
        applicantName: '',
        applicantEmail: '',
        reason: '',
        submittedAt: '',
        updatedAt: '',
      };
      return {
        user: null,
        isLoading: false,
        login: () => {},
        logout: async () => {},
        sendMagicLink: async () => ({
          success: false,
          error: 'SSR not supported',
        }),
        updateUser: () => {},
        becomeSeller: () => {},
        listings: [],
        addListing: () => defaultListing,
        updateListing: () => {},
        deleteListing: () => {},
        publishListing: () => {},
        inquiries: [],
        addInquiry: () => defaultInquiry,
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
