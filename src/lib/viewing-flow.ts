/**
 * 内見フロー管理
 *
 * 内見の全ライフサイクルを管理:
 * 1. リクエスト → 2. スケジュール確定 → 3. 内見完了
 * → 4. チェックリスト提出 → 5. 合意確定（agreedFurnitureIds）
 *
 * メッセージングとチェックリストモジュールを統合し、
 * 内見フローの状態遷移を一元管理する。
 */

import type { FurnitureItem, LargeFurnitureType } from './data';
import { createThread } from './messaging';
import { createChecklist, getAgreedFurnitureIds } from './furniture-checklist';

export type ViewingStatus =
  | 'requested'
  | 'scheduled'
  | 'completed'
  | 'checklist_submitted'
  | 'agreed';

export interface Viewing {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  threadId: string;
  checklistId: string;
  status: ViewingStatus;
  scheduledDate?: string;
  completedAt?: string;
  agreedFurnitureIds?: LargeFurnitureType[];
  agreedAt?: string;
  createdAt: string;
}

export interface ViewingStatusInfo {
  label: string;
  step: number;
  totalSteps: number;
}

const STATUS_INFO: Record<ViewingStatus, { label: string; step: number }> = {
  requested: { label: 'リクエスト中', step: 1 },
  scheduled: { label: '日程確定', step: 2 },
  completed: { label: '内見完了', step: 3 },
  checklist_submitted: { label: 'チェックリスト提出済み', step: 4 },
  agreed: { label: '合意済み', step: 5 },
};

const TOTAL_STEPS = 5;

// In-memory store (mock, will be replaced with DB)
let viewings: Viewing[] = [];
let nextId = 1;

function generateId(): string {
  return `vw-${nextId++}-${Date.now()}`;
}

/**
 * Creates a viewing request. Also creates a messaging thread and checklist.
 * Returns existing viewing if same listing+buyer combo exists.
 */
export function createViewing(
  listingId: string,
  sellerId: string,
  buyerId: string,
  furnitureItems: FurnitureItem[]
): Viewing {
  const existing = viewings.find(
    (v) => v.listingId === listingId && v.buyerId === buyerId
  );
  if (existing) return existing;

  // Create messaging thread for this viewing
  const thread = createThread(listingId, sellerId, buyerId);

  // Create furniture checklist from listing's items
  const checklist = createChecklist(listingId, thread.id, furnitureItems);

  const viewing: Viewing = {
    id: generateId(),
    listingId,
    sellerId,
    buyerId,
    threadId: thread.id,
    checklistId: checklist.id,
    status: 'requested',
    createdAt: new Date().toISOString(),
  };

  viewings = [...viewings, viewing];
  return viewing;
}

/**
 * Retrieves a viewing by ID.
 */
export function getViewing(viewingId: string): Viewing | undefined {
  return viewings.find((v) => v.id === viewingId);
}

/**
 * Returns all viewings for a listing.
 */
export function getViewingsByListing(listingId: string): Viewing[] {
  return viewings.filter((v) => v.listingId === listingId);
}

/**
 * Schedules a viewing with a confirmed date.
 */
export function scheduleViewing(
  viewingId: string,
  scheduledDate: string
): Viewing {
  const viewing = viewings.find((v) => v.id === viewingId);
  if (!viewing) {
    throw new Error('内見が見つかりません');
  }

  const updated: Viewing = {
    ...viewing,
    status: 'scheduled',
    scheduledDate,
  };

  viewings = viewings.map((v) => (v.id === viewingId ? updated : v));
  return updated;
}

/**
 * Marks a viewing as completed (after the physical visit).
 */
export function completeViewing(viewingId: string): Viewing {
  const viewing = viewings.find((v) => v.id === viewingId);
  if (!viewing) {
    throw new Error('内見が見つかりません');
  }

  if (viewing.status !== 'scheduled') {
    throw new Error('内見がスケジュール済みではありません');
  }

  const updated: Viewing = {
    ...viewing,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };

  viewings = viewings.map((v) => (v.id === viewingId ? updated : v));
  return updated;
}

/**
 * Buyer submits their checklist selections.
 */
export function submitBuyerChecklist(viewingId: string): Viewing {
  const viewing = viewings.find((v) => v.id === viewingId);
  if (!viewing) {
    throw new Error('内見が見つかりません');
  }

  if (viewing.status !== 'completed') {
    throw new Error('内見が完了していません');
  }

  const updated: Viewing = {
    ...viewing,
    status: 'checklist_submitted',
  };

  viewings = viewings.map((v) => (v.id === viewingId ? updated : v));
  return updated;
}

/**
 * Seller approves the checklist, finalizing agreedFurnitureIds.
 */
export function approveChecklist(viewingId: string): Viewing {
  const viewing = viewings.find((v) => v.id === viewingId);
  if (!viewing) {
    throw new Error('内見が見つかりません');
  }

  if (viewing.status !== 'checklist_submitted') {
    throw new Error('チェックリストが提出されていません');
  }

  const agreedIds = getAgreedFurnitureIds(viewing.checklistId);

  const updated: Viewing = {
    ...viewing,
    status: 'agreed',
    agreedFurnitureIds: agreedIds,
    agreedAt: new Date().toISOString(),
  };

  viewings = viewings.map((v) => (v.id === viewingId ? updated : v));
  return updated;
}

/**
 * Returns human-readable status info for a viewing.
 */
export function getViewingStatus(viewingId: string): ViewingStatusInfo {
  const viewing = viewings.find((v) => v.id === viewingId);
  if (!viewing) {
    throw new Error('内見が見つかりません');
  }

  const info = STATUS_INFO[viewing.status];
  return {
    label: info.label,
    step: info.step,
    totalSteps: TOTAL_STEPS,
  };
}

/**
 * Resets all in-memory state. Used for testing.
 */
export function resetViewingState(): void {
  viewings = [];
  nextId = 1;
}
