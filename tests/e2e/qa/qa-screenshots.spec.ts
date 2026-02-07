import { test } from '@playwright/test';
import {
  testData,
  setupAuthenticatedUser,
  setupAuthenticatedSeller,
} from '../fixtures/test-fixtures';
import path from 'path';
import fs from 'fs';

const QA_DIR = path.join('tests', 'e2e', 'artifacts', 'qa');

type AuthMode = 'none' | 'user' | 'seller';

interface ScreenDef {
  id: string;
  name: string;
  route: string;
  auth: AuthMode;
}

/**
 * Screen registry: maps screen IDs to routes and required auth state.
 * Based on docs/requirements/screens.md (S-xxx) plus extra pages (X-xxx).
 */
const SCREENS: ScreenDef[] = [
  // General user screens
  { id: 'S-001', name: 'ホーム', route: '/', auth: 'none' },
  { id: 'S-002', name: '物件一覧', route: '/properties', auth: 'none' },
  {
    id: 'S-003',
    name: '物件詳細',
    route: `/listings/${testData.properties.bohemian}`,
    auth: 'none',
  },
  {
    id: 'S-004',
    name: '問い合わせ',
    route: `/listings/${testData.properties.bohemian}/inquiry`,
    auth: 'user',
  },
  { id: 'S-005', name: 'アカウント', route: '/account', auth: 'user' },
  {
    id: 'S-006',
    name: 'アカウント編集',
    route: '/account/edit',
    auth: 'user',
  },

  // Seller screens
  {
    id: 'S-101',
    name: 'リスティング一覧',
    route: '/listing',
    auth: 'seller',
  },
  {
    id: 'S-102',
    name: '物件新規登録',
    route: '/listing/new',
    auth: 'seller',
  },
  {
    id: 'S-104',
    name: '物件プレビュー',
    route: `/listing/${testData.properties.bohemian}/preview`,
    auth: 'seller',
  },

  // Extra pages (not in screen registry but worth auditing)
  { id: 'X-001', name: 'ダッシュボード', route: '/dashboard', auth: 'user' },
  { id: 'X-002', name: '利用規約', route: '/terms', auth: 'none' },
  { id: 'X-003', name: 'プライバシー', route: '/privacy', auth: 'none' },
];

// Ensure QA screenshot directory exists
test.beforeAll(() => {
  fs.mkdirSync(QA_DIR, { recursive: true });
});

test.describe('QA Screenshots @qa', () => {
  for (const screen of SCREENS) {
    test(`${screen.id} ${screen.name}`, async ({ page }) => {
      // Set up auth state if needed
      if (screen.auth === 'user') {
        await setupAuthenticatedUser(page);
      } else if (screen.auth === 'seller') {
        await setupAuthenticatedSeller(page);
      }

      // Navigate to the page
      const response = await page.goto(screen.route, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for any lazy-loaded content
      await page.waitForTimeout(1000);

      // Take full-page screenshot
      const filename = `${screen.id}-${screen.name}.png`;
      await page.screenshot({
        path: path.join(QA_DIR, filename),
        fullPage: true,
      });

      // Also take a viewport-only screenshot (above the fold)
      await page.screenshot({
        path: path.join(QA_DIR, `${screen.id}-${screen.name}-viewport.png`),
        fullPage: false,
      });

      // Log the status for the report
      const status = response?.status() ?? 'unknown';
      console.log(
        `[QA] ${screen.id} ${screen.name}: ${screen.route} -> ${status}`
      );
    });
  }
});
