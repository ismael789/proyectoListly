import { createContext, useContext } from 'react';
import { ThemeMode } from './types';

export const watchPalettes = {
  dark: {
    background: '#000000',       // Negro puro para pantallas AMOLED de Wear OS
    surface: '#151C17',          // Tarjetas gris carbón con tinte verde tenue
    surfaceAlt: '#1F2922',       // Fondos secundarios
    surfacePressed: '#27332B',   // Estado presionado
    text: '#F2F6F3',             // Texto principal de alto contraste
    textSecondary: '#A2B3A7',    // Subtítulo
    muted: '#75887B',            // Texto atenuado
    primary: '#76C893',          // Verde bosque suave de alto contraste
    primarySoft: '#183626',      // Fondo tenue para badges
    border: '#26342B',           // Borde sutil
    danger: '#FF7B72',           // Alerta
    white: '#FFFFFF',
    isDark: true,
  },
  light: {
    background: '#F8F9F5',       // Marfil claro
    surface: '#FFFFFF',          // Superficie blanca
    surfaceAlt: '#EDF2EB',       // Superficie secundaria
    surfacePressed: '#E2EAE0',   // Presionado
    text: '#17221A',             // Texto oscuro
    textSecondary: '#4C5D51',    // Subtítulo
    muted: '#7A8C7F',            // Atenuado
    primary: '#2D6A4F',          // Verde bosque principal
    primarySoft: '#E2EFE7',      // Fondo suave
    border: '#DBE4DA',           // Borde
    danger: '#C63F38',           // Alerta
    white: '#FFFFFF',
    isDark: false,
  },
};

export type WatchColors = typeof watchPalettes.dark;

export interface WatchThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: WatchColors;
}

export const WatchThemeContext = createContext<WatchThemeContextValue>({
  mode: 'dark',
  setMode: () => {},
  colors: watchPalettes.dark,
});

export function useWatchTheme(): WatchThemeContextValue {
  return useContext(WatchThemeContext);
}
