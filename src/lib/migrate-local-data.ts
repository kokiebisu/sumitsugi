'use server';

import { randomUUID } from 'crypto';
import { db } from '@/db';
import { properties, inquiries } from '@/db/schema';
import type { UserListing, Inquiry } from '@/lib/types';

interface LocalData {
  listings?: UserListing[];
  inquiries?: Inquiry[];
}

export async function migrateLocalDataAction(
  userId: string,
  localData: LocalData
) {
  try {
    let migratedListings = 0;
    let migratedInquiries = 0;

    // Migrate listings to properties table
    if (localData.listings && localData.listings.length > 0) {
      for (const listing of localData.listings) {
        try {
          await db.insert(properties).values({
            id: randomUUID(),
            userId,
            title: listing.title,
            images: listing.roomPhotos || [],
            status: listing.status === 'published' ? 'public' : 'draft',
            handoverFee: listing.handoverFee,
            rent: listing.rent,
            managementFee: listing.managementFee,
            area: listing.area,
            layout: listing.layout,
            occupancy: listing.occupants,
            furnitureItems: [], // Legacy migration: furniture text[] → FurnitureItem[] (empty default)
            story: listing.story,
            handoverDetails: {
              viewingAvailableFrom: listing.viewingAvailableFrom,
              moveInAvailableFrom: listing.moveInAvailableFrom,
            },
            createdAt: new Date(listing.createdAt),
            updatedAt: new Date(listing.updatedAt),
            publishedAt: listing.publishedAt
              ? new Date(listing.publishedAt)
              : undefined,
          });
          migratedListings++;
        } catch (error) {
          console.error('Failed to migrate listing:', listing.id, error);
        }
      }
    }

    // Migrate inquiries
    if (localData.inquiries && localData.inquiries.length > 0) {
      for (const inquiry of localData.inquiries) {
        try {
          // Note: We need to find the corresponding property first
          // For now, we'll skip inquiries that reference non-existent properties
          // In a real migration, you'd need to handle this more carefully
          await db.insert(inquiries).values({
            id: randomUUID(),
            userId,
            propertyId: inquiry.propertyId,
            propertyTitle: inquiry.propertyTitle,
            status: inquiry.status,
            applicantName: inquiry.applicantName,
            applicantEmail: inquiry.applicantEmail,
            reason: inquiry.reason,
            questions: inquiry.questions,
            notes: inquiry.notes,
            viewingConfirmation: inquiry.viewingConfirmation,
            submittedAt: new Date(inquiry.submittedAt),
            updatedAt: new Date(inquiry.updatedAt),
          });
          migratedInquiries++;
        } catch (error) {
          console.error('Failed to migrate inquiry:', inquiry.id, error);
        }
      }
    }

    return {
      success: true,
      data: {
        migratedListings,
        migratedInquiries,
      },
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: 'データ移行に失敗しました',
    };
  }
}
