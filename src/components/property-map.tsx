"use client"

import { Home } from "lucide-react"
import { useMemo } from "react"

interface PropertyMapProps {
  lat: number
  lng: number
  neighborhood?: string
  title: string
  interactive?: boolean
}

export function PropertyMap({ lat, lng, neighborhood, interactive = false }: PropertyMapProps) {
  // 座標を少しずらしてプライバシーを保護（約200-500m範囲でランダム化）
  // useMemoで固定して再レンダリング時に変わらないようにする
  const { fuzzyLat, fuzzyLng } = useMemo(() => {
    const offsetLat = (Math.random() - 0.5) * 0.005
    const offsetLng = (Math.random() - 0.5) * 0.005
    return {
      fuzzyLat: lat + offsetLat,
      fuzzyLng: lng + offsetLng
    }
  }, [lat, lng])

  // Google Maps Embed API - Street View style
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${fuzzyLng}!3d${fuzzyLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp`

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
      {/* 地図iframe */}
      <iframe
        src={mapUrl}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${neighborhood || "物件"}周辺の地図`}
      />

      {/* 非インタラクティブ時は透明なオーバーレイでマップ操作を無効化 */}
      {!interactive && (
        <div className="absolute inset-0" aria-hidden="true" />
      )}

      {/* Airbnb風マーカー: 黒丸に家アイコン */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg">
          <Home className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
