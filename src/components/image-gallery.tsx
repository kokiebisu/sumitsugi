"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [modalImageLoaded, setModalImageLoaded] = useState(false)

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setModalImageLoaded(false)
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setModalImageLoaded(false)
  }

  return (
    <>
      {/* Main Gallery Grid - Airbnb Style */}
      <div className="relative">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[500px]">
          {/* Main Image - Left half */}
          <div
            className="relative col-span-1 row-span-2 cursor-pointer overflow-hidden rounded-l-xl md:col-span-2 h-[400px] md:h-full"
            onClick={() => {
              setSelectedIndex(0)
              setIsModalOpen(true)
              setModalImageLoaded(false)
            }}
          >
            {!loadedImages.has(0) && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            <img
              src={images[0] || "/placeholder.svg"}
              alt={`${title} - メイン写真`}
              className={`h-full w-full object-cover transition-transform duration-200 hover:brightness-90 ${
                loadedImages.has(0) ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => handleImageLoad(0)}
            />
          </div>

          {/* Top Right Images */}
          {images.slice(1, 3).map((image, index) => {
            const imageIndex = index + 1
            return (
              <div
                key={index}
                className={`relative hidden h-full cursor-pointer overflow-hidden md:block ${
                  index === 1 ? "rounded-tr-xl" : ""
                }`}
                onClick={() => {
                  setSelectedIndex(imageIndex)
                  setIsModalOpen(true)
                  setModalImageLoaded(false)
                }}
              >
                {!loadedImages.has(imageIndex) && (
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                )}
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${title} - 写真${imageIndex + 1}`}
                  className={`h-full w-full object-cover transition-transform duration-200 hover:brightness-90 ${
                    loadedImages.has(imageIndex) ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleImageLoad(imageIndex)}
                />
              </div>
            )
          })}

          {/* Bottom Right Images */}
          {images.slice(3, 5).map((image, index) => {
            const imageIndex = index + 3
            return (
              <div
                key={index}
                className={`relative hidden h-full cursor-pointer overflow-hidden md:block ${
                  index === 1 ? "rounded-br-xl" : ""
                }`}
                onClick={() => {
                  setSelectedIndex(imageIndex)
                  setIsModalOpen(true)
                  setModalImageLoaded(false)
                }}
              >
                {!loadedImages.has(imageIndex) && (
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                )}
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${title} - 写真${imageIndex + 1}`}
                  className={`h-full w-full object-cover transition-transform duration-200 hover:brightness-90 ${
                    loadedImages.has(imageIndex) ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleImageLoad(imageIndex)}
                />
                {index === 1 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-sm font-semibold text-white">+{images.length - 5} 枚</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Show all photos button - Airbnb style */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 rounded-lg bg-white border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-800 shadow-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          写真をすべて表示
        </button>

        {/* Mobile: Show all button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 md:hidden"
        >
          すべての写真を見る ({images.length}枚)
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="前の写真"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="次の写真"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative max-h-[85vh] max-w-5xl">
            {!modalImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[400px] w-[600px] animate-pulse rounded-lg bg-muted" />
              </div>
            )}
            <img
              src={images[selectedIndex] || "/placeholder.svg"}
              alt={`${title} - 写真${selectedIndex + 1}`}
              className={`max-h-[85vh] w-auto rounded-lg object-contain ${
                modalImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setModalImageLoaded(true)}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
