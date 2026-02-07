/**
 * 引き継ぎ合意管理
 *
 * 合意済み内見（agreed viewing）から引き継ぎ合意書を生成し、
 * draft → pending_acceptance → signed のライフサイクルを管理する。
 *
 * チェックリストの「keep」アイテムのみを合意品目として抽出し、
 * 残置物同意書PDFの元データとなる。
 */

import type { LargeFurnitureType } from './data';
import { getViewing } from './viewing-flow';
import { getChecklist } from './furniture-checklist';

export interface AgreementItem {
  id: string;
  furnitureType: LargeFurnitureType;
  photos: string[];
  condition?: 'excellent' | 'good' | 'fair';
  notes?: string;
}

export interface BuyerSignatureInput {
  name: string;
  ipAddress?: string;
}

export interface BuyerSignature {
  name: string;
  agreedAt: string;
  ipAddress?: string;
}

export type AgreementStatus = 'draft' | 'pending_acceptance' | 'signed';

export interface HandoverAgreementRecord {
  id: string;
  viewingId: string;
  listingId: string;
  checklistId: string;
  items: AgreementItem[];
  handoverFee: number;
  status: AgreementStatus;
  createdAt: string;
  acceptedAt?: string;
  signedAt?: string;
  buyerSignature?: BuyerSignature;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  propertyTitle: string;
  propertyAddress?: string;
}

export interface CreateAgreementParams {
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  propertyTitle: string;
  propertyAddress?: string;
  handoverFee: number;
}

// In-memory store (mock, will be replaced with DB)
let agreements: HandoverAgreementRecord[] = [];
let nextId = 1;

function generateId(): string {
  return `ha-${nextId++}-${Date.now()}`;
}

/**
 * Creates a handover agreement from an agreed viewing.
 * Extracts keep-only items from the confirmed checklist.
 * Returns existing agreement if one already exists for this viewing.
 */
export function createAgreementFromViewing(
  viewingId: string,
  params: CreateAgreementParams
): HandoverAgreementRecord {
  const existing = agreements.find((a) => a.viewingId === viewingId);
  if (existing) return existing;

  const viewing = getViewing(viewingId);
  if (!viewing) {
    throw new Error('内見が見つかりません');
  }

  if (viewing.status !== 'agreed') {
    throw new Error('合意済みの内見のみから合意書を作成できます');
  }

  const checklist = getChecklist(viewing.checklistId);
  if (!checklist) {
    throw new Error('チェックリストが見つかりません');
  }

  // Extract keep-only items as agreement items
  const items: AgreementItem[] = checklist.items
    .filter((item) => item.disposition === 'keep')
    .map((item) => ({
      id: generateId(),
      furnitureType: item.furnitureType,
      photos: [...item.photos],
      condition: item.condition,
      notes: item.notes,
    }));

  const agreement: HandoverAgreementRecord = {
    id: generateId(),
    viewingId,
    listingId: viewing.listingId,
    checklistId: viewing.checklistId,
    items,
    handoverFee: params.handoverFee,
    status: 'draft',
    createdAt: new Date().toISOString(),
    sellerName: params.sellerName,
    sellerEmail: params.sellerEmail,
    buyerName: params.buyerName,
    buyerEmail: params.buyerEmail,
    propertyTitle: params.propertyTitle,
    propertyAddress: params.propertyAddress,
  };

  agreements = [...agreements, agreement];
  return agreement;
}

/**
 * Retrieves an agreement by ID.
 */
export function getAgreement(
  agreementId: string
): HandoverAgreementRecord | undefined {
  return agreements.find((a) => a.id === agreementId);
}

/**
 * Retrieves an agreement by viewing ID.
 */
export function getAgreementByViewing(
  viewingId: string
): HandoverAgreementRecord | undefined {
  return agreements.find((a) => a.viewingId === viewingId);
}

/**
 * Buyer accepts the agreement terms (draft → pending_acceptance).
 */
export function acceptAgreement(agreementId: string): HandoverAgreementRecord {
  const agreement = agreements.find((a) => a.id === agreementId);
  if (!agreement) {
    throw new Error('合意書が見つかりません');
  }

  if (agreement.status !== 'draft') {
    throw new Error('ドラフト状態の合意のみ受諾できます');
  }

  const updated: HandoverAgreementRecord = {
    ...agreement,
    status: 'pending_acceptance',
    acceptedAt: new Date().toISOString(),
  };

  agreements = agreements.map((a) => (a.id === agreementId ? updated : a));
  return updated;
}

/**
 * Buyer signs the agreement (pending_acceptance → signed).
 */
export function signAgreement(
  agreementId: string,
  signature: BuyerSignatureInput
): HandoverAgreementRecord {
  const agreement = agreements.find((a) => a.id === agreementId);
  if (!agreement) {
    throw new Error('合意書が見つかりません');
  }

  if (agreement.status !== 'pending_acceptance') {
    throw new Error('受諾済みの合意のみ署名できます');
  }

  const buyerSignature: BuyerSignature = {
    name: signature.name,
    agreedAt: new Date().toISOString(),
    ipAddress: signature.ipAddress,
  };

  const updated: HandoverAgreementRecord = {
    ...agreement,
    status: 'signed',
    signedAt: new Date().toISOString(),
    buyerSignature,
  };

  agreements = agreements.map((a) => (a.id === agreementId ? updated : a));
  return updated;
}

/**
 * Resets all in-memory state. Used for testing.
 */
export function resetAgreementState(): void {
  agreements = [];
  nextId = 1;
}
