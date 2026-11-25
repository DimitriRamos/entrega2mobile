// src/hooks/useResponsive.js
// Hook customizado que adapta o layout ao tamanho da tela (celular, tablet, navegador).
import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 600,
  desktop: 960,
  wide: 1280,
};

export default function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;

  // Colunas da grade de países
  let gridColumns = 1;
  if (width >= BREAKPOINTS.wide) gridColumns = 4;
  else if (width >= BREAKPOINTS.desktop) gridColumns = 3;
  else if (width >= BREAKPOINTS.tablet) gridColumns = 2;

  return {
    width,
    height,
    isTablet,
    isDesktop,
    gridColumns,
  };
}
