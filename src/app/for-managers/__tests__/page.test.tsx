import { describe, it, expect } from 'vitest';
import {
  faqItems,
  roleSteps,
  featureCards,
  type FaqItem,
  type RoleStep,
  type FeatureCard,
} from '../faq-data';

describe('ForManagers FAQ Data', () => {
  describe('faqItems', () => {
    it('contains expected number of FAQ items', () => {
      expect(faqItems.length).toBe(9);
    });

    it('each FAQ item has question and answer strings', () => {
      for (const item of faqItems) {
        expect(typeof item.question).toBe('string');
        expect(typeof item.answer).toBe('string');
        expect(item.question.length).toBeGreaterThan(0);
        expect(item.answer.length).toBeGreaterThan(0);
      }
    });

    it('includes question about what sumitsugi is', () => {
      const found = faqItems.some((item) =>
        item.question.includes('sumitsugiとは')
      );
      expect(found).toBe(true);
    });

    it('includes question about the handover process', () => {
      const found = faqItems.some((item) => item.question.includes('引き継ぎ'));
      expect(found).toBe(true);
    });

    it('includes question about management company role', () => {
      const found = faqItems.some(
        (item) =>
          item.question.includes('管理会社') && item.question.includes('必要')
      );
      expect(found).toBe(true);
    });

    it('includes question about lease agreement impact', () => {
      const found = faqItems.some((item) =>
        item.question.includes('賃貸借契約')
      );
      expect(found).toBe(true);
    });

    it('includes question about furniture responsibility', () => {
      const found = faqItems.some(
        (item) =>
          item.question.includes('責任') && item.question.includes('家具')
      );
      expect(found).toBe(true);
    });

    it('includes question about cleaning', () => {
      const found = faqItems.some((item) =>
        item.question.includes('クリーニング')
      );
      expect(found).toBe(true);
    });

    it('includes question about payment handling', () => {
      const found = faqItems.some((item) => item.question.includes('支払い'));
      expect(found).toBe(true);
    });

    it('includes question about owner cooperation fee', () => {
      const found = faqItems.some((item) => item.question.includes('協力金'));
      expect(found).toBe(true);
    });

    it('includes question about sumitsugi benefits', () => {
      const found = faqItems.some((item) => item.question.includes('メリット'));
      expect(found).toBe(true);
    });

    it('mentions escrow in payment answer', () => {
      const paymentItem = faqItems.find((item) =>
        item.question.includes('支払い')
      );
      expect(paymentItem?.answer).toContain('エスクロー');
    });

    it('mentions current condition handover in responsibility answer', () => {
      const responsibilityItem = faqItems.find(
        (item) =>
          item.question.includes('責任') && item.question.includes('家具')
      );
      expect(responsibilityItem?.answer).toContain('現状有姿');
    });

    it('mentions PDF in management company role answer', () => {
      const roleItem = faqItems.find(
        (item) =>
          item.question.includes('管理会社') && item.question.includes('必要')
      );
      expect(roleItem?.answer).toContain('PDF');
    });

    it('mentions 30 minutes work time in management company role answer', () => {
      const roleItem = faqItems.find(
        (item) =>
          item.question.includes('管理会社') && item.question.includes('必要')
      );
      expect(roleItem?.answer).toContain('約30分');
    });

    it('mentions that management company is not responsible for furniture in responsibility answer', () => {
      const responsibilityItem = faqItems.find(
        (item) =>
          item.question.includes('責任') && item.question.includes('家具')
      );
      expect(responsibilityItem?.answer).toContain('管理会社様');
      expect(responsibilityItem?.answer).toContain(
        '責任を問われることはありません'
      );
    });

    it('sumitsugi description mentions both outgoing and incoming tenants', () => {
      const whatIsItem = faqItems.find((item) =>
        item.question.includes('sumitsugiとは')
      );
      expect(whatIsItem?.answer).toContain('前の住人');
      expect(whatIsItem?.answer).toContain('次の住人');
    });

    it('has no duplicate questions', () => {
      const questions = faqItems.map((item) => item.question);
      const uniqueQuestions = new Set(questions);
      expect(uniqueQuestions.size).toBe(questions.length);
    });
  });

  describe('roleSteps', () => {
    it('contains 3 steps', () => {
      expect(roleSteps.length).toBe(3);
    });

    it('each step has required fields', () => {
      for (const step of roleSteps) {
        expect(typeof step.step).toBe('string');
        expect(typeof step.title).toBe('string');
        expect(typeof step.desc).toBe('string');
        expect(step.step.length).toBeGreaterThan(0);
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.desc.length).toBeGreaterThan(0);
      }
    });

    it('steps are numbered 1 through 3', () => {
      expect(roleSteps[0].step).toBe('1');
      expect(roleSteps[1].step).toBe('2');
      expect(roleSteps[2].step).toBe('3');
    });

    it('includes owner approval step', () => {
      const found = roleSteps.some(
        (step) => step.title.includes('オーナー') && step.title.includes('承認')
      );
      expect(found).toBe(true);
    });

    it('includes cleaning arrangement step', () => {
      const found = roleSteps.some((step) =>
        step.title.includes('クリーニング')
      );
      expect(found).toBe(true);
    });

    it('includes final check and key handover step', () => {
      const found = roleSteps.some(
        (step) => step.title.includes('最終確認') && step.title.includes('鍵')
      );
      expect(found).toBe(true);
    });
  });

  describe('featureCards', () => {
    it('contains 3 feature cards', () => {
      expect(featureCards.length).toBe(3);
    });

    it('each card has title and description', () => {
      for (const card of featureCards) {
        expect(typeof card.title).toBe('string');
        expect(typeof card.description).toBe('string');
        expect(card.title.length).toBeGreaterThan(0);
        expect(card.description.length).toBeGreaterThan(0);
      }
    });

    it('includes auto-document creation feature', () => {
      const found = featureCards.some((card) => card.title.includes('資料'));
      expect(found).toBe(true);
    });

    it('includes escrow payment feature', () => {
      const found = featureCards.some((card) =>
        card.title.includes('エスクロー')
      );
      expect(found).toBe(true);
    });

    it('includes minimal workload feature', () => {
      const found = featureCards.some((card) =>
        card.title.includes('業務負担')
      );
      expect(found).toBe(true);
    });

    it('mentions 30 minutes in workload description', () => {
      const workloadCard = featureCards.find((card) =>
        card.title.includes('業務負担')
      );
      expect(workloadCard?.description).toContain('約30分');
    });
  });

  describe('type safety', () => {
    it('faqItems conforms to FaqItem type', () => {
      const item: FaqItem = faqItems[0];
      expect(item).toHaveProperty('question');
      expect(item).toHaveProperty('answer');
    });

    it('roleSteps conforms to RoleStep type', () => {
      const step: RoleStep = roleSteps[0];
      expect(step).toHaveProperty('step');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('desc');
    });

    it('featureCards conforms to FeatureCard type', () => {
      const card: FeatureCard = featureCards[0];
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('description');
    });
  });
});
