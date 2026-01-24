"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Home, MapPin, Plus, X } from "lucide-react";
import { GeolocationButton } from "./geolocation-button";
import { AddressForm } from "./address-form";
import { StationSearch } from "./station-search";
import {
  reverseGeocode,
  createEmptyAddress,
  type JapaneseAddress,
} from "@/lib/geocoding-service";
import type { GeolocationPosition } from "@/hooks/use-geolocation";

export interface StationInfo {
  name: string;
  walkingMinutes: string;
}

export interface LocationWithAddress {
  lat: number;
  lng: number;
  neighborhood: string;
  address?: JapaneseAddress;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationWithAddress) => void;
  initialLocation?: { lat: number; lng: number };
  initialAddress?: JapaneseAddress;
  initialNeighborhood?: string;
  stations?: StationInfo[];
  onStationsChange?: (stations: StationInfo[]) => void;
  showAddressForm?: boolean;
}

// 東京23区の中心座標
const TOKYO_CENTER = { lat: 35.658, lng: 139.7016 };

// 東京の主要エリア（町名レベル）
const TOKYO_NEIGHBORHOODS = [
  // 渋谷区
  { name: "渋谷区渋谷", lat: 35.658, lng: 139.7016 },
  { name: "渋谷区恵比寿", lat: 35.6467, lng: 139.7103 },
  { name: "渋谷区代官山", lat: 35.6489, lng: 139.703 },
  { name: "渋谷区神宮前", lat: 35.6702, lng: 139.7073 },
  { name: "渋谷区原宿", lat: 35.6702, lng: 139.7027 },
  { name: "渋谷区表参道", lat: 35.6654, lng: 139.7121 },
  { name: "渋谷区代々木", lat: 35.6833, lng: 139.702 },
  { name: "渋谷区笹塚", lat: 35.6742, lng: 139.6672 },
  // 目黒区
  { name: "目黒区中目黒", lat: 35.6442, lng: 139.6986 },
  { name: "目黒区自由が丘", lat: 35.6076, lng: 139.6688 },
  { name: "目黒区祐天寺", lat: 35.6372, lng: 139.6883 },
  { name: "目黒区学芸大学", lat: 35.6284, lng: 139.6852 },
  { name: "目黒区都立大学", lat: 35.6177, lng: 139.6775 },
  // 港区
  { name: "港区六本木", lat: 35.6641, lng: 139.7294 },
  { name: "港区麻布十番", lat: 35.6555, lng: 139.7372 },
  { name: "港区白金", lat: 35.6418, lng: 139.7271 },
  { name: "港区青山", lat: 35.6729, lng: 139.7197 },
  { name: "港区赤坂", lat: 35.6762, lng: 139.7372 },
  { name: "港区表参道", lat: 35.6654, lng: 139.7121 },
  // 新宿区
  { name: "新宿区新宿", lat: 35.6896, lng: 139.7006 },
  { name: "新宿区神楽坂", lat: 35.7027, lng: 139.7417 },
  { name: "新宿区四谷", lat: 35.6869, lng: 139.7308 },
  { name: "新宿区高田馬場", lat: 35.7126, lng: 139.7036 },
  { name: "新宿区早稲田", lat: 35.7089, lng: 139.7219 },
  // 世田谷区
  { name: "世田谷区三軒茶屋", lat: 35.6437, lng: 139.67 },
  { name: "世田谷区下北沢", lat: 35.6614, lng: 139.6681 },
  { name: "世田谷区二子玉川", lat: 35.6113, lng: 139.6263 },
  { name: "世田谷区駒沢", lat: 35.631, lng: 139.6614 },
  { name: "世田谷区用賀", lat: 35.6269, lng: 139.6336 },
  // 品川区
  { name: "品川区五反田", lat: 35.626, lng: 139.7235 },
  { name: "品川区大崎", lat: 35.6197, lng: 139.7286 },
  { name: "品川区武蔵小山", lat: 35.6144, lng: 139.7047 },
  { name: "品川区戸越", lat: 35.6102, lng: 139.7147 },
  // 台東区
  { name: "台東区浅草", lat: 35.7147, lng: 139.7966 },
  { name: "台東区上野", lat: 35.7141, lng: 139.7774 },
  { name: "台東区蔵前", lat: 35.7018, lng: 139.7898 },
  { name: "台東区入谷", lat: 35.722, lng: 139.7833 },
  // 墨田区
  { name: "墨田区押上", lat: 35.7101, lng: 139.813 },
  { name: "墨田区錦糸町", lat: 35.6969, lng: 139.8142 },
  { name: "墨田区両国", lat: 35.6966, lng: 139.7931 },
  // 中野区
  { name: "中野区中野", lat: 35.7074, lng: 139.6639 },
  { name: "中野区東中野", lat: 35.7071, lng: 139.6803 },
  // 杉並区
  { name: "杉並区高円寺", lat: 35.7052, lng: 139.6497 },
  { name: "杉並区阿佐ヶ谷", lat: 35.7045, lng: 139.6358 },
  { name: "杉並区荻窪", lat: 35.7035, lng: 139.6203 },
  { name: "杉並区西荻窪", lat: 35.703, lng: 139.5995 },
  // 豊島区
  { name: "豊島区池袋", lat: 35.7295, lng: 139.7109 },
  { name: "豊島区目白", lat: 35.7214, lng: 139.7069 },
  { name: "豊島区大塚", lat: 35.7317, lng: 139.7286 },
  // 文京区
  { name: "文京区本郷", lat: 35.7127, lng: 139.7594 },
  { name: "文京区湯島", lat: 35.7078, lng: 139.7689 },
  { name: "文京区根津", lat: 35.7203, lng: 139.7622 },
  // 千代田区
  { name: "千代田区神田", lat: 35.692, lng: 139.7709 },
  { name: "千代田区秋葉原", lat: 35.7022, lng: 139.7741 },
  { name: "千代田区丸の内", lat: 35.6812, lng: 139.7671 },
  // 中央区
  { name: "中央区銀座", lat: 35.6717, lng: 139.7654 },
  { name: "中央区日本橋", lat: 35.6839, lng: 139.7744 },
  { name: "中央区人形町", lat: 35.6862, lng: 139.7836 },
  // 江東区
  { name: "江東区清澄白河", lat: 35.6808, lng: 139.8006 },
  { name: "江東区門前仲町", lat: 35.6728, lng: 139.7958 },
  { name: "江東区豊洲", lat: 35.6553, lng: 139.7964 },
];

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  initialAddress,
  initialNeighborhood,
  stations = [],
  onStationsChange,
  showAddressForm = true,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState(
    initialLocation || TOKYO_CENTER
  );
  const [neighborhood, setNeighborhood] = useState(initialNeighborhood || "");
  const [isDragging, setIsDragging] = useState(false);
  const [markerOffset, setMarkerOffset] = useState({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [address, setAddress] = useState<JapaneseAddress>(
    initialAddress || createEmptyAddress()
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const isInitialMount = useRef(true);
  const hasUserMovedMarker = useRef(false);

  // Google Maps Embed URL
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6000!2d${markerPosition.lng}!3d${markerPosition.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp`;

  // Fallback: Local reverse geocoding for Tokyo
  const getNeighborhoodFromCoords = useCallback((lat: number, lng: number) => {
    let closestNeighborhood = "東京";
    let minDistance = Infinity;

    for (const area of TOKYO_NEIGHBORHOODS) {
      const distance = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestNeighborhood = area.name;
      }
    }

    if (minDistance > 0.02) {
      const districts = [
        { name: "渋谷区", lat: 35.664, lng: 139.6982 },
        { name: "新宿区", lat: 35.6938, lng: 139.7035 },
        { name: "港区", lat: 35.6581, lng: 139.7514 },
        { name: "目黒区", lat: 35.6414, lng: 139.6981 },
        { name: "世田谷区", lat: 35.6461, lng: 139.6532 },
        { name: "品川区", lat: 35.609, lng: 139.73 },
        { name: "大田区", lat: 35.5613, lng: 139.716 },
        { name: "中野区", lat: 35.7074, lng: 139.6639 },
        { name: "杉並区", lat: 35.6995, lng: 139.6367 },
        { name: "豊島区", lat: 35.7295, lng: 139.7109 },
        { name: "文京区", lat: 35.7081, lng: 139.7522 },
        { name: "台東区", lat: 35.7126, lng: 139.78 },
        { name: "墨田区", lat: 35.7107, lng: 139.8015 },
        { name: "江東区", lat: 35.6729, lng: 139.8172 },
        { name: "千代田区", lat: 35.694, lng: 139.7536 },
        { name: "中央区", lat: 35.6705, lng: 139.7719 },
        { name: "練馬区", lat: 35.7355, lng: 139.6517 },
        { name: "板橋区", lat: 35.7516, lng: 139.7093 },
        { name: "北区", lat: 35.7528, lng: 139.7337 },
        { name: "荒川区", lat: 35.7365, lng: 139.7834 },
        { name: "足立区", lat: 35.7752, lng: 139.8045 },
        { name: "葛飾区", lat: 35.7439, lng: 139.8472 },
        { name: "江戸川区", lat: 35.7067, lng: 139.8683 },
      ];

      minDistance = Infinity;
      for (const district of districts) {
        const distance = Math.sqrt(
          Math.pow(lat - district.lat, 2) + Math.pow(lng - district.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestNeighborhood = district.name;
        }
      }
    }

    return closestNeighborhood;
  }, []);

  // Update neighborhood when marker moves (using local fallback)
  // Skip recalculation if initial values are provided and user hasn't moved the marker
  useEffect(() => {
    // If we have initial neighborhood and user hasn't moved the marker, use initial values
    if (initialNeighborhood && !hasUserMovedMarker.current) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        onLocationSelect({
          lat: markerPosition.lat,
          lng: markerPosition.lng,
          neighborhood: initialNeighborhood,
          address,
        });
      }
      return;
    }

    isInitialMount.current = false;
    const area = getNeighborhoodFromCoords(
      markerPosition.lat,
      markerPosition.lng
    );
    setNeighborhood(area);
    onLocationSelect({
      lat: markerPosition.lat,
      lng: markerPosition.lng,
      neighborhood: area,
      address,
    });
  }, [markerPosition, getNeighborhoodFromCoords, onLocationSelect, address, initialNeighborhood]);

  // Handle geolocation result
  const handleGeolocationFound = useCallback(
    async (coords: GeolocationPosition) => {
      hasUserMovedMarker.current = true;
      setMarkerPosition({ lat: coords.lat, lng: coords.lng });
      setIsLoadingAddress(true);

      try {
        const result = await reverseGeocode({
          lat: coords.lat,
          lng: coords.lng,
        });

        if (result.success && result.address) {
          setAddress(result.address);
          if (result.neighborhood) {
            setNeighborhood(result.neighborhood);
          }
        }
      } catch (error) {
        console.error("Failed to reverse geocode:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    },
    []
  );

  // Handle address form changes
  const handleAddressChange = useCallback(
    (newAddress: JapaneseAddress) => {
      setAddress(newAddress);
      // Update neighborhood from address
      const newNeighborhood = [newAddress.city, newAddress.district]
        .filter(Boolean)
        .join("");
      if (newNeighborhood) {
        setNeighborhood(newNeighborhood);
      }
    },
    []
  );

  const LAT_RANGE = 0.007;
  const LNG_RANGE = 0.013;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const offsetX = x - width / 2;
    const offsetY = y - height / 2;

    const newLat = markerPosition.lat - LAT_RANGE * (offsetY / height);
    const newLng = markerPosition.lng + LNG_RANGE * (offsetX / width);

    hasUserMovedMarker.current = true;
    setMarkerPosition({ lat: newLat, lng: newLng });
  };

  const handleMarkerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget
      .closest(".map-container")
      ?.getBoundingClientRect();
    if (rect) {
      setContainerRect(rect);
      setIsDragging(true);
      setMarkerOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRect) return;

    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    setMarkerOffset({
      x: x - centerX,
      y: y - centerY,
    });
  };

  const handleMouseUp = () => {
    if (isDragging && containerRect) {
      const width = containerRect.width;
      const height = containerRect.height;

      const newLat =
        markerPosition.lat - LAT_RANGE * (markerOffset.y / height);
      const newLng =
        markerPosition.lng + LNG_RANGE * (markerOffset.x / width);

      hasUserMovedMarker.current = true;
      setMarkerPosition({ lat: newLat, lng: newLng });
      setMarkerOffset({ x: 0, y: 0 });
    }
    setIsDragging(false);
    setContainerRect(null);
  };

  return (
    <div className="space-y-4">
      {/* Geolocation Button */}
      <GeolocationButton
        onLocationFound={handleGeolocationFound}
        disabled={isLoadingAddress}
      />

      {/* Map */}
      <div
        className="map-container relative aspect-[16/9] w-full overflow-hidden rounded-2xl cursor-crosshair select-none"
        onClick={handleMapClick}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <iframe
          src={mapUrl}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="物件の場所を選択"
        />
        <div className="absolute inset-0 bg-transparent" />
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${markerOffset.x}px), calc(-50% + ${markerOffset.y}px))`,
          }}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-grab transition-transform ${isDragging ? "scale-110 cursor-grabbing" : "hover:scale-105"}`}
            style={{ backgroundColor: "#222222" }}
            onMouseDown={handleMarkerMouseDown}
          >
            <Home className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Selected Area Display (when not showing full address form) */}
      {!showAddressForm && neighborhood && (
        <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
          <MapPin className="w-5 h-5 text-foreground flex-shrink-0" />
          <span className="text-base font-medium text-foreground">
            {neighborhood}
          </span>
        </div>
      )}

      {/* Drag Hint */}
      <p className="text-sm text-muted-foreground text-center">
        マーカーをドラッグするか、地図をクリックして場所を選択
      </p>

      {/* Address Form */}
      {showAddressForm && (
        <AddressForm
          address={address}
          onChange={handleAddressChange}
          isLoading={isLoadingAddress}
        />
      )}

      {/* Nearest Stations */}
      {onStationsChange && (
        <div className="space-y-3 pt-4">
          <label className="block text-sm font-medium text-foreground">
            最寄り駅
          </label>
          {stations.map((station, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <StationSearch
                  value={station.name}
                  onChange={(name) => {
                    const newStations = stations.map((s, i) =>
                      i === index ? { ...s, name } : s
                    );
                    onStationsChange(newStations);
                  }}
                  placeholder="駅名を検索"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">徒歩</span>
                <input
                  type="number"
                  placeholder="5"
                  value={station.walkingMinutes}
                  onChange={(e) => {
                    const newStations = stations.map((s, i) =>
                      i === index
                        ? { ...s, walkingMinutes: e.target.value }
                        : s
                    );
                    onStationsChange(newStations);
                  }}
                  className="w-16 px-3 py-3 border border-border rounded-xl text-base text-center focus:outline-none focus:ring-2 focus:ring-foreground"
                />
                <span className="text-sm text-muted-foreground">分</span>
              </div>
              {stations.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newStations = stations.filter((_, i) => i !== index);
                    onStationsChange(newStations);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
          {stations.length < 3 && (
            <button
              type="button"
              onClick={() => {
                onStationsChange([
                  ...stations,
                  { name: "", walkingMinutes: "" },
                ]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              最寄り駅を追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}
