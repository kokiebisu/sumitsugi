import { Font } from '@react-pdf/renderer';

const NOTO_SANS_JP_CDN =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest';

let fontsRegistered = false;

export function registerFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: 'Noto Sans JP',
    fonts: [
      {
        src: `${NOTO_SANS_JP_CDN}/japanese-400-normal.ttf`,
        fontWeight: 400,
      },
      {
        src: `${NOTO_SANS_JP_CDN}/japanese-700-normal.ttf`,
        fontWeight: 700,
      },
    ],
  });

  fontsRegistered = true;
}
