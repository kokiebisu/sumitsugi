'use client';

import { useState, useCallback } from 'react';
import { MapPin, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  useGeolocation,
  type GeolocationPosition,
} from '@/hooks/use-geolocation';

interface GeolocationButtonProps {
  onLocationFound: (coords: GeolocationPosition) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

type ButtonState = 'idle' | 'requesting' | 'loading' | 'success' | 'error';

export function GeolocationButton({
  onLocationFound,
  onError,
  disabled = false,
}: GeolocationButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { requestLocation, isSupported } = useGeolocation();

  const handleClick = useCallback(async () => {
    if (!isSupported) {
      setButtonState('error');
      setErrorMessage('お使いのブラウザは位置情報に対応していません');
      onError?.('お使いのブラウザは位置情報に対応していません');
      return;
    }

    setButtonState('requesting');
    setErrorMessage(null);

    const position = await requestLocation();

    if (position) {
      setButtonState('loading');
      onLocationFound(position);

      // Show success state briefly
      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
      }, 2000);
    } else {
      setButtonState('error');
      const message = '位置情報の取得に失敗しました';
      setErrorMessage(message);
      onError?.(message);
    }
  }, [isSupported, requestLocation, onLocationFound, onError]);

  const handleRetry = useCallback(() => {
    setButtonState('idle');
    setErrorMessage(null);
  }, []);

  const getButtonContent = () => {
    switch (buttonState) {
      case 'idle':
        return (
          <>
            <MapPin className="w-5 h-5" />
            <span>現在地を使用</span>
          </>
        );
      case 'requesting':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>位置情報へのアクセスを許可...</span>
          </>
        );
      case 'loading':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>住所を取得中...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-5 h-5" />
            <span>位置情報を取得しました</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage || 'エラーが発生しました'}</span>
          </>
        );
    }
  };

  const isDisabled =
    disabled ||
    buttonState === 'requesting' ||
    buttonState === 'loading' ||
    buttonState === 'success';

  const buttonClasses = `
    flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
    ${
      buttonState === 'error'
        ? 'bg-red-50 text-red-700 border border-red-200'
        : buttonState === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
    }
    ${isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={buttonState === 'error' ? handleRetry : handleClick}
        disabled={isDisabled && buttonState !== 'error'}
        className={buttonClasses}
      >
        {getButtonContent()}
      </button>
      {buttonState === 'error' && (
        <button
          type="button"
          onClick={handleRetry}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          もう一度試す
        </button>
      )}
    </div>
  );
}
