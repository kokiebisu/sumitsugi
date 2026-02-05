import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, request) => {
        // Development mode: log to console
        if (!process.env.RESEND_API_KEY) {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔗 Magic Link for:', email);
          console.log('URL:', url);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return;
        }

        // Production mode: send via Resend
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'tsumugi <onboarding@resend.dev>',
          to: email,
          subject: 'tsumugi ログインリンク',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #FF5A5F;">tsumugi</h1>
              <p>以下のリンクをクリックしてログインしてください：</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #FF5A5F; color: white; text-decoration: none; border-radius: 8px;">
                ログインする
              </a>
              <p style="margin-top: 24px; color: #666; font-size: 14px;">
                このリンクは15分間有効です。リクエストしていない場合は無視してください。
              </p>
            </div>
          `,
        });
      },
      expiresIn: 60 * 15, // 15 minutes
    }),
  ],

  user: {
    additionalFields: {
      isSeller: {
        type: 'boolean',
        defaultValue: false,
      },
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  trustedOrigins: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || '',
  ].filter(Boolean),
});

// Export types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
