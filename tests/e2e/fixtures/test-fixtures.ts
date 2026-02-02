import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { AuthPage } from '../pages/AuthPage';
import { ListingPage } from '../pages/ListingPage';
import { NewListingPage } from '../pages/NewListingPage';
import { PaymentPage } from '../pages/PaymentPage';
import { PaymentConfirmationPage } from '../pages/PaymentConfirmationPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Custom test fixtures for tsumugi E2E tests
 * Provides pre-configured page objects for all tests
 */
export const test = base.extend<{
  homePage: HomePage;
  propertyDetailPage: PropertyDetailPage;
  authPage: AuthPage;
  listingPage: ListingPage;
  newListingPage: NewListingPage;
  paymentPage: PaymentPage;
  paymentConfirmationPage: PaymentConfirmationPage;
  dashboardPage: DashboardPage;
}>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  propertyDetailPage: async ({ page }, use) => {
    const propertyDetailPage = new PropertyDetailPage(page);
    await use(propertyDetailPage);
  },
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },
  listingPage: async ({ page }, use) => {
    const listingPage = new ListingPage(page);
    await use(listingPage);
  },
  newListingPage: async ({ page }, use) => {
    const newListingPage = new NewListingPage(page);
    await use(newListingPage);
  },
  paymentPage: async ({ page }, use) => {
    const paymentPage = new PaymentPage(page);
    await use(paymentPage);
  },
  paymentConfirmationPage: async ({ page }, use) => {
    const paymentConfirmationPage = new PaymentConfirmationPage(page);
    await use(paymentConfirmationPage);
  },
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect };

/**
 * Test data for various scenarios
 */
export const testData = {
  // Known property IDs from the mock data
  properties: {
    bohemian: '1368794573069214647', // Bohemian apartment in Nakameguro
    dj: '1368794573069214648', // DJ/Producer space in Ebisu
    vintage: '1368794573069214649', // Vintage furniture in Koenji
    artist: '1368794573069214650', // Artist atelier
  },

  // Test user credentials
  users: {
    testUser: {
      email: 'test@tsumugi.example.com',
      name: 'Test User',
    },
    seller: {
      email: 'seller@tsumugi.example.com',
      name: 'Test Seller',
    },
    buyer: {
      email: 'buyer@tsumugi.example.com',
      name: 'Test Buyer',
    },
  },

  // Tokyo districts that should appear on home page
  districts: ['渋谷区', '目黒区', '港区', '世田谷区', '杉並区'],

  // Layout options
  layouts: ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK'],

  // Furniture options (Japanese labels)
  furniture: {
    bed: 'ベッド',
    sofa: 'ソファ',
    desk: 'デスク',
    storage: '収納',
    table: 'テーブル',
    wardrobe: 'ワードローブ',
    tv: 'テレビ台',
    fridge: '冷蔵庫',
  },

  // Payment-related test data
  payment: {
    // Stripe test card numbers (https://stripe.com/docs/testing)
    cards: {
      success: '4242424242424242', // Visa - always succeeds
      declineGeneric: '4000000000000002', // Generic decline
      declineInsufficientFunds: '4000000000009995', // Insufficient funds
      declineFraud: '4000000000000019', // Fraudulent card
      declineExpiredCard: '4000000000000069', // Expired card
      declineIncorrectCvc: '4000000000000127', // Incorrect CVC
      declineProcessingError: '4000000000000119', // Processing error
      authRequired: '4000002500003155', // Requires authentication
    },
    // Fee configuration (mirrors STRIPE_CONFIG)
    fees: {
      applicationFee: 20000, // 20,000 yen
      depositRate: 0.3, // 30%
      depositMin: 30000, // Min 30,000 yen
      depositMax: 50000, // Max 50,000 yen
      cleaningFee: 8000, // 8,000 yen
      landlordIncentiveRate: 0.01, // 1%
      landlordIncentiveMin: 3000, // Min 3,000 yen
      platformFeeRate: 0.15, // 15%
    },
    // Test expiry dates (future dates)
    testExpiry: '12/30',
    testCvc: '123',
    testPostal: '12345',
  },
};

/**
 * Stripe test card helper
 */
export const stripeTestCards = testData.payment.cards;

/**
 * Helper to clear localStorage (for clean test state)
 */
export async function clearLocalStorage(page: any) {
  await page
    .evaluate(() => {
      localStorage.clear();
    })
    .catch(() => {
      // Ignore if localStorage is not accessible (e.g., about:blank or file://)
    });
}

/**
 * Helper to set up authenticated user state
 */
export async function setupAuthenticatedUser(
  page: any,
  user = testData.users.testUser
) {
  // Add localStorage state before navigating
  await page.addInitScript((userData: typeof user) => {
    const mockUser = {
      id: 'test-user-' + Date.now(),
      email: userData.email,
      name: userData.name,
      phone: '090-1234-5678',
      createdAt: new Date().toISOString(),
      authProvider: 'email',
      isSeller: false,
    };
    localStorage.setItem('tsumugi_user', JSON.stringify(mockUser));
  }, user);

  // Reload the page so the init script runs
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Give React time to hydrate and initialize auth context
  await page.waitForTimeout(500);
}

/**
 * Helper to set up authenticated seller user state
 */
export async function setupAuthenticatedSeller(
  page: any,
  user = testData.users.seller
) {
  // Add localStorage state before navigating
  await page.addInitScript((userData: typeof user) => {
    const mockUser = {
      id: 'test-seller-' + Date.now(),
      email: userData.email,
      name: userData.name,
      phone: '090-1234-5678',
      createdAt: new Date().toISOString(),
      authProvider: 'email',
      isSeller: true,
      sellerProfile: {
        occupation: 'Designer',
        bio: 'Test seller bio',
        sellerSince: new Date().toISOString(),
      },
    };
    localStorage.setItem('tsumugi_user', JSON.stringify(mockUser));
  }, user);

  // Reload the page so the init script runs
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Give React time to hydrate and initialize auth context
  await page.waitForTimeout(500);
}

/**
 * Helper to set up authenticated buyer user state (for payment testing)
 */
export async function setupAuthenticatedBuyer(
  page: any,
  user = testData.users.buyer
) {
  await page.addInitScript((userData: typeof user) => {
    const mockUser = {
      id: 'test-buyer-' + Date.now(),
      email: userData.email,
      name: userData.name,
      phone: '090-9876-5432',
      createdAt: new Date().toISOString(),
      authProvider: 'email',
      isSeller: false,
    };
    localStorage.setItem('tsumugi_user', JSON.stringify(mockUser));
  }, user);

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

/**
 * Helper to mock Stripe API responses for testing
 * Use this for testing error scenarios without hitting real Stripe
 */
export async function mockStripeResponse(
  page: any,
  scenario: 'success' | 'decline' | 'error' | 'auth_required'
) {
  const responses: Record<string, { status: number; body: any }> = {
    success: {
      status: 200,
      body: {
        id: 'pi_mock_success',
        status: 'succeeded',
        amount: 20000,
        currency: 'jpy',
      },
    },
    decline: {
      status: 400,
      body: {
        error: {
          code: 'card_declined',
          message: 'Your card was declined.',
          decline_code: 'generic_decline',
        },
      },
    },
    error: {
      status: 500,
      body: {
        error: {
          code: 'processing_error',
          message: 'An error occurred while processing your card.',
        },
      },
    },
    auth_required: {
      status: 200,
      body: {
        id: 'pi_mock_auth',
        status: 'requires_action',
        next_action: {
          type: 'use_stripe_sdk',
        },
      },
    },
  };

  await page.route('**/api/actions/payment**', (route: any) => {
    route.fulfill({
      status: responses[scenario].status,
      contentType: 'application/json',
      body: JSON.stringify(responses[scenario].body),
    });
  });
}

/**
 * Helper to wait for Stripe Elements to be ready
 */
export async function waitForStripeElements(
  page: any,
  timeout: number = 20000
) {
  // Wait for Stripe iframe to appear
  await page.waitForSelector('iframe[name*="__privateStripeFrame"]', {
    timeout,
  });

  // Wait a bit for Stripe Elements to initialize
  await page.waitForTimeout(1000);
}

/**
 * Helper to fill Stripe card details via iframe
 * Note: This is for Stripe test mode only
 */
export async function fillStripeCardDetails(
  page: any,
  cardNumber: string = testData.payment.cards.success,
  expiry: string = testData.payment.testExpiry,
  cvc: string = testData.payment.testCvc
) {
  // Stripe Elements are rendered in iframes
  // This is a simplified helper - actual implementation may vary based on Stripe Elements version

  // Get all Stripe iframes
  const frames = page.frames();

  for (const frame of frames) {
    const name = frame.name();
    if (name.includes('__privateStripeFrame')) {
      // Try to fill card number
      const cardInput = await frame.$(
        '[name="cardnumber"], input[placeholder*="card" i]'
      );
      if (cardInput) {
        await cardInput.fill(cardNumber);
      }

      // Try to fill expiry
      const expiryInput = await frame.$(
        '[name="exp-date"], input[placeholder*="MM" i]'
      );
      if (expiryInput) {
        await expiryInput.fill(expiry);
      }

      // Try to fill CVC
      const cvcInput = await frame.$(
        '[name="cvc"], input[placeholder*="CVC" i]'
      );
      if (cvcInput) {
        await cvcInput.fill(cvc);
      }
    }
  }
}

/**
 * Helper to calculate expected fees (mirrors server-side calculations)
 */
export function calculateExpectedFees(handoverFeeTotal: number) {
  const { fees } = testData.payment;

  const additionalCleaningFee = fees.cleaningFee;
  const landlordIncentive = Math.max(
    Math.round(handoverFeeTotal * fees.landlordIncentiveRate),
    fees.landlordIncentiveMin
  );
  const platformFee = Math.round(handoverFeeTotal * fees.platformFeeRate);
  const sellerReceives =
    handoverFeeTotal - additionalCleaningFee - landlordIncentive - platformFee;
  const applicationFee = fees.applicationFee;
  const depositRaw = Math.round(handoverFeeTotal * fees.depositRate);
  const deposit = Math.min(
    Math.max(depositRaw, fees.depositMin),
    fees.depositMax
  );
  const remaining = handoverFeeTotal - deposit;

  return {
    handoverFeeTotal,
    additionalCleaningFee,
    landlordIncentive,
    platformFee,
    sellerReceives,
    applicationFee,
    deposit,
    remaining,
  };
}
