'use client';

import { useState, useCallback } from 'react';

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'loading'
  | 'success'
  | 'error_permission_denied'
  | 'error_position_unavailable'
  | 'error_timeout'
  | 'error_not_supported';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  status: GeolocationStatus;
  error: string | null;
  isSupported: boolean;
  requestLocation: () => Promise<GeolocationPosition | null>;
  reset: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  error_permission_denied:
    '位置情報へのアクセスが拒否されました。ブラウザの設定を確認してください。',
  error_position_unavailable:
    '現在地を取得できませんでした。もう一度お試しください。',
  error_timeout:
    '位置情報の取得がタイムアウトしました。もう一度お試しください。',
  error_not_supported: 'お使いのブラウザは位置情報に対応していません。',
};

export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  const reset = useCallback(() => {
    setPosition(null);
    setStatus('idle');
    setError(null);
  }, []);

  const requestLocation =
    useCallback(async (): Promise<GeolocationPosition | null> => {
      if (!isSupported) {
        setStatus('error_not_supported');
        setError(ERROR_MESSAGES.error_not_supported);
        return null;
      }

      setStatus('requesting');
      setError(null);

      return new Promise((resolve) => {
        const geolocationOptions: PositionOptions = {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0,
        };

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPosition: GeolocationPosition = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };
            setPosition(newPosition);
            setStatus('success');
            setError(null);
            resolve(newPosition);
          },
          (err) => {
            let newStatus: GeolocationStatus;
            switch (err.code) {
              case err.PERMISSION_DENIED:
                newStatus = 'error_permission_denied';
                break;
              case err.POSITION_UNAVAILABLE:
                newStatus = 'error_position_unavailable';
                break;
              case err.TIMEOUT:
                newStatus = 'error_timeout';
                break;
              default:
                newStatus = 'error_position_unavailable';
            }
            setStatus(newStatus);
            setError(ERROR_MESSAGES[newStatus]);
            resolve(null);
          },
          geolocationOptions
        );
      });
    }, [
      isSupported,
      options.enableHighAccuracy,
      options.timeout,
      options.maximumAge,
    ]);

  return {
    position,
    status,
    error,
    isSupported,
    requestLocation,
    reset,
  };
}
