'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '@/lib/data';
import { isUrgentMoveIn } from '@/lib/utils';
import { UrgentMoveInBadge } from '@/components/urgent-move-in-badge';

function parseLocation(neighborhood: string | undefined): {
  ward?: string;
  town?: string;
} {
  if (!neighborhood) return {};
  const match = neighborhood.match(/^(.+?[区市])(.*)$/);
  if (match) {
    return { ward: match[1], town: match[2] || undefined };
  }
  return { ward: neighborhood };
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageLoaded(false);
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageLoaded(false);
    setCurrentImage(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const currentImageSrc = property.images[currentImage] || '/placeholder.svg';

  return (
    <Link href={`/listings/${property.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <Image
          src={currentImageSrc}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          priority={false}
        />

        {/* 即入居可能バッジ（F-507） */}
        {isUrgentMoveIn(property.moveOutDate) && <UrgentMoveInBadge />}

        {/* Heart button */}
        <button
          onClick={toggleLike}
          className="absolute right-3 top-3 z-10 transition-transform hover:scale-110"
        >
          <Heart
            className={`h-6 w-6 drop-shadow-md ${isLiked ? 'fill-coral text-coral' : 'fill-black/50 text-white'}`}
          />
        </button>

        {/* Navigation arrows - only show on hover */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 opacity-0 shadow-md transition-opacity hover:scale-105 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 opacity-0 shadow-md transition-opacity hover:scale-105 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {property.images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === currentImage ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* MVP構成: 一言コピー → 引き継ぎ費用 → 家賃 → 基本情報 */}
      <div className="mt-3">
        <h3 className="font-medium text-foreground line-clamp-1">
          {property.title}
        </h3>

        <p className="mt-1.5 text-sm">
          <span className="text-muted-foreground">引き継ぎ費用 </span>
          <span className="font-semibold text-foreground">
            ¥{property.handoverFee.toLocaleString()}
          </span>
        </p>

        {property.rent && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            家賃 ¥{property.rent.toLocaleString()}/月
          </p>
        )}

        <p className="mt-1 text-sm text-muted-foreground">
          {(() => {
            const { ward, town } = parseLocation(
              property.location?.neighborhood
            );
            return [ward, town, property.layout].filter(Boolean).join(' / ');
          })()}
        </p>
      </div>
    </Link>
  );
}
