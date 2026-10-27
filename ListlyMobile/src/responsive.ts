import { useWindowDimensions } from 'react-native';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const isSmall = width < 360;
  const isLandscape = width > height;

  return {
    width,
    height,
    fontScale,
    isSmall,
    isLarge: width >= 480,
    isLandscape,
    // Keep the original 20dp layout until the screen is genuinely narrow.
    horizontalPadding: isSmall ? 14 : 20,
    contentMaxWidth: undefined,
    modalMaxWidth: isSmall ? Math.max(260, width - 28) : undefined,
    scale: isSmall ? clamp(width / 360, 0.92, 1) : 1,
  };
}
