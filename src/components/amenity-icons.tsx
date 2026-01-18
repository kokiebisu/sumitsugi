import {
  Coffee,
  Disc3,
  Waves,
  Leaf,
  Palette,
  Book,
  Hammer,
  Monitor,
  PawPrint,
  Package,
  Bike,
  Dumbbell,
  Camera,
  Gamepad2,
  Mountain,
  Tent,
  Guitar,
  Wine,
  UtensilsCrossed,
  Plane,
  Headphones,
  Music,
} from "lucide-react"
import type { Amenity } from "@/lib/data"

interface AmenityIconsProps {
  amenities: Amenity[]
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  layout?: "pill" | "row"
  startIndex?: number
  totalItems?: number
}

const amenityConfig = {
  coffee: { icon: Coffee, label: "コーヒー" },
  records: { icon: Disc3, label: "レコード" },
  surfing: { icon: Waves, label: "サーフィン" },
  diving: { icon: Waves, label: "ダイビング" },
  cycling: { icon: Bike, label: "サイクリング" },
  plants: { icon: Leaf, label: "植物" },
  art: { icon: Palette, label: "アート" },
  books: { icon: Book, label: "本" },
  tools: { icon: Hammer, label: "DIY" },
  workspace: { icon: Monitor, label: "作業環境" },
  pets: { icon: PawPrint, label: "ペット歓迎" },
  skateboard: { icon: Package, label: "スケボー" },
  music: { icon: Music, label: "音楽" },
  dj: { icon: Headphones, label: "DJ" },
  vintage: { icon: Package, label: "ヴィンテージ" },
  minimal: { icon: Package, label: "ミニマル" },
  travel: { icon: Plane, label: "旅" },
  yoga: { icon: Dumbbell, label: "ヨガ" },
  fitness: { icon: Dumbbell, label: "フィットネス" },
  photography: { icon: Camera, label: "写真" },
  gaming: { icon: Gamepad2, label: "ゲーム" },
  climbing: { icon: Mountain, label: "登山" },
  camping: { icon: Tent, label: "キャンプ" },
  guitar: { icon: Guitar, label: "ギター" },
  wine: { icon: Wine, label: "ワイン" },
  cooking: { icon: UtensilsCrossed, label: "料理" },
}

export function AmenityIcons({ amenities, size = "md", showLabel = true, layout = "pill", startIndex = 0, totalItems = 0 }: AmenityIconsProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  if (layout === "row") {
    // For simple row layout with icon and label side by side
    return (
      <>
        {amenities.map((amenity, index) => {
          const config = amenityConfig[amenity.type as keyof typeof amenityConfig]
          if (!config) return null

          const Icon = config.icon

          return (
            <div key={`${amenity.type}-${index}`} className="flex items-start gap-4">
              <Icon className="h-6 w-6 text-foreground flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-base text-foreground">{config.label}</span>
                {amenity.details && (
                  <span className="text-sm text-muted-foreground mt-0.5">{amenity.details}</span>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  // Default pill layout
  return (
    <div className="flex flex-wrap gap-1.5">
      {amenities.map((amenity, index) => {
        const config = amenityConfig[amenity.type as keyof typeof amenityConfig]
        if (!config) return null

        const Icon = config.icon

        return (
          <div
            key={`${amenity.type}-${index}`}
            className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <Icon className={sizeClasses[size]} />
            {showLabel && <span className={`${textSizeClasses[size]} font-medium`}>{config.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
