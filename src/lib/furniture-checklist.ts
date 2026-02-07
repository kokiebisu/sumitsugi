/**
 * 残置物チェックリスト機能
 *
 * 前の住人が出品時に登録した家具リストをベースに、
 * 内見時に「引き継ぐ/引き継がない/検討中」をチェック。
 * 確定後、agreedFurnitureIdsが決まり残置物同意書の根拠となる。
 */

import type { FurnitureItem, LargeFurnitureType } from './data';

export type ItemDisposition = 'keep' | 'take_away' | 'undecided';

export interface ChecklistItem {
  id: string;
  furnitureType: LargeFurnitureType;
  photos: string[];
  condition?: 'excellent' | 'good' | 'fair';
  notes?: string;
  disposition: ItemDisposition;
}

export type ChecklistStatus = 'draft' | 'confirmed';

export interface FurnitureChecklist {
  id: string;
  listingId: string;
  threadId: string;
  status: ChecklistStatus;
  items: ChecklistItem[];
  createdAt: string;
  confirmedAt?: string;
}

export interface ChecklistSummary {
  keep: number;
  takeAway: number;
  undecided: number;
  total: number;
}

// In-memory store (mock, will be replaced with DB)
let checklists: FurnitureChecklist[] = [];
let nextId = 1;

function generateId(): string {
  return `cl-${nextId++}-${Date.now()}`;
}

/**
 * Creates a checklist from furniture items. Returns existing if same listing+thread exists.
 */
export function createChecklist(
  listingId: string,
  threadId: string,
  furnitureItems: FurnitureItem[]
): FurnitureChecklist {
  const existing = checklists.find(
    (c) => c.listingId === listingId && c.threadId === threadId
  );
  if (existing) return existing;

  const items: ChecklistItem[] = furnitureItems.map((f) => ({
    id: generateId(),
    furnitureType: f.type,
    photos: [...f.photos],
    condition: f.condition,
    notes: f.notes,
    disposition: 'undecided' as const,
  }));

  const checklist: FurnitureChecklist = {
    id: generateId(),
    listingId,
    threadId,
    status: 'draft',
    items,
    createdAt: new Date().toISOString(),
  };

  checklists = [...checklists, checklist];
  return checklist;
}

/**
 * Retrieves a checklist by ID.
 */
export function getChecklist(
  checklistId: string
): FurnitureChecklist | undefined {
  return checklists.find((c) => c.id === checklistId);
}

/**
 * Updates an item's disposition. Throws if checklist is confirmed.
 */
export function updateChecklistItem(
  checklistId: string,
  itemId: string,
  disposition: ItemDisposition
): FurnitureChecklist {
  const checklist = checklists.find((c) => c.id === checklistId);
  if (!checklist) {
    throw new Error('チェックリストが見つかりません');
  }

  if (checklist.status === 'confirmed') {
    throw new Error('確定済みのチェックリストは変更できません');
  }

  const itemIndex = checklist.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error('チェックリストアイテムが見つかりません');
  }

  const updatedItems = checklist.items.map((item) =>
    item.id === itemId ? { ...item, disposition } : item
  );

  const updated: FurnitureChecklist = {
    ...checklist,
    items: updatedItems,
  };

  checklists = checklists.map((c) => (c.id === checklistId ? updated : c));
  return updated;
}

/**
 * Returns a summary of item dispositions.
 */
export function getChecklistSummary(checklistId: string): ChecklistSummary {
  const checklist = checklists.find((c) => c.id === checklistId);
  if (!checklist) {
    throw new Error('チェックリストが見つかりません');
  }

  const keep = checklist.items.filter((i) => i.disposition === 'keep').length;
  const takeAway = checklist.items.filter(
    (i) => i.disposition === 'take_away'
  ).length;
  const undecided = checklist.items.filter(
    (i) => i.disposition === 'undecided'
  ).length;

  return { keep, takeAway, undecided, total: checklist.items.length };
}

/**
 * Returns the furniture types marked as "keep" (agreed to take over).
 */
export function getAgreedFurnitureIds(
  checklistId: string
): LargeFurnitureType[] {
  const checklist = checklists.find((c) => c.id === checklistId);
  if (!checklist) {
    throw new Error('チェックリストが見つかりません');
  }

  return checklist.items
    .filter((i) => i.disposition === 'keep')
    .map((i) => i.furnitureType);
}

/**
 * Confirms a checklist. All items must be decided (no undecided).
 */
export function confirmChecklist(checklistId: string): FurnitureChecklist {
  const checklist = checklists.find((c) => c.id === checklistId);
  if (!checklist) {
    throw new Error('チェックリストが見つかりません');
  }

  if (checklist.status === 'confirmed') {
    throw new Error('このチェックリストは既に確定済みです');
  }

  const hasUndecided = checklist.items.some(
    (i) => i.disposition === 'undecided'
  );
  if (hasUndecided) {
    throw new Error('未決定のアイテムがあります');
  }

  const confirmed: FurnitureChecklist = {
    ...checklist,
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
  };

  checklists = checklists.map((c) => (c.id === checklistId ? confirmed : c));
  return confirmed;
}

/**
 * Resets all in-memory state. Used for testing.
 */
export function resetChecklistState(): void {
  checklists = [];
  nextId = 1;
}
