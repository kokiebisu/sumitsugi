'use server';

import { signIn, signOut, auth } from '@/lib/auth';
import { db } from '@/db';
import { users, sellerProfiles } from '@/db/schema';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { AuthError } from 'next-auth';

// Sign Up Schema
const signUpSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  phone: z.string().optional(),
});

export async function signUpAction(data: z.infer<typeof signUpSchema>) {
  try {
    const validated = signUpSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (existingUser) {
      return {
        success: false,
        error: 'このメールアドレスは既に登録されています',
      };
    }

    // Hash password
    const passwordHash = await hash(validated.password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        passwordHash,
        authProvider: 'email',
        emailVerified: null, // NextAuth uses timestamp for email verification
        isSeller: false,
      })
      .returning();

    // Auto sign in
    try {
      await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });
    } catch (error) {
      // Sign in failed, but user was created
      console.error('Auto sign-in failed:', error);
    }

    return {
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Sign up error:', error);
    return { success: false, error: '登録に失敗しました' };
  }
}

// Sign In Action
export async function signInAction(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
      };
    }
    console.error('Sign in error:', error);
    return { success: false, error: 'ログインに失敗しました' };
  }
}

// Sign Out Action
export async function signOutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'ログアウトに失敗しました' };
  }
}

// Become Seller Action
const becomeSellerSchema = z.object({
  occupation: z.string().min(1, '職業を入力してください'),
  bio: z.string().min(10, '自己紹介は10文字以上で入力してください'),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
});

export async function becomeSellerAction(
  data: z.infer<typeof becomeSellerSchema>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'ログインが必要です' };
    }

    const validated = becomeSellerSchema.parse(data);

    // Check if user is already a seller
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        sellerProfile: true,
      },
    });

    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    if (user.isSeller) {
      return { success: false, error: '既に前の住人として登録されています' };
    }

    // Update user to seller
    await db
      .update(users)
      .set({ isSeller: true })
      .where(eq(users.id, session.user.id));

    // Create seller profile
    await db.insert(sellerProfiles).values({
      userId: session.user.id,
      occupation: validated.occupation,
      bio: validated.bio,
      socialLinks: validated.socialLinks || {},
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Become seller error:', error);
    return { success: false, error: '前の住人登録に失敗しました' };
  }
}

// Update User Profile Action
const updateProfileSchema = z.object({
  name: z.string().min(1, '名前を入力してください').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('有効なURLを入力してください').optional(),
});

export async function updateProfileAction(
  data: z.infer<typeof updateProfileSchema>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'ログインが必要です' };
    }

    const validated = updateProfileSchema.parse(data);

    const [updatedUser] = await db
      .update(users)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return {
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.image,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Update profile error:', error);
    return { success: false, error: 'プロフィール更新に失敗しました' };
  }
}

// Update Seller Profile Action
const updateSellerProfileSchema = z.object({
  occupation: z.string().min(1, '職業を入力してください'),
  bio: z.string().min(10, '自己紹介は10文字以上で入力してください'),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
});

export async function updateSellerProfileAction(
  data: z.infer<typeof updateSellerProfileSchema>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'ログインが必要です' };
    }

    const validated = updateSellerProfileSchema.parse(data);

    // Check if user is a seller
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        sellerProfile: true,
      },
    });

    if (!user?.isSeller || !user.sellerProfile) {
      return { success: false, error: '前の住人として登録されていません' };
    }

    await db
      .update(sellerProfiles)
      .set({
        occupation: validated.occupation,
        bio: validated.bio,
        socialLinks: validated.socialLinks || {},
        updatedAt: new Date(),
      })
      .where(eq(sellerProfiles.userId, session.user.id));

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Update seller profile error:', error);
    return { success: false, error: 'プロフィール更新に失敗しました' };
  }
}

// Get Current User Action
export async function getCurrentUserAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'ログインしていません' };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        sellerProfile: true,
      },
      columns: {
        passwordHash: false, // Exclude password hash
      },
    });

    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, error: 'ユーザー情報の取得に失敗しました' };
  }
}
