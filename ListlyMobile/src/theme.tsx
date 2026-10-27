import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { loadStoredTheme, saveStoredTheme } from './storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export const palettes = {
  light: {
    background: '#F8F9F5',     // Fondo marfil suave
    surface: '#FFFFFF',        // Superficie blanca limpia
    surfaceAlt: '#EEF2EC',     // Marfil/verde tenue para fondos secundarios
    surfaceSubtle: '#F1F4EE',  // Tarjetas secundarias
    text: '#1A241E',           // Texto principal verde-carbón de alto contraste
    textSecondary: '#4A574E',  // Texto secundario
    muted: '#76857A',          // Muted text
    primary: '#2D6A4F',        // Verde bosque elegante y profesional
    primaryHover: '#23533E',   // Verde bosque oscuro para estados presionados
    primarySoft: '#E3EFE8',    // Verde menta suave para badges y fondos de icono
    border: '#E1E7DF',         // Bordes discretos y limpios
    borderLight: '#EDF2EB',    // Separadores ligeros
    danger: '#C63F38',         // Rojo alerta sobrio
    dangerSoft: '#FBEBEA',     // Fondo alerta
    white: '#FFFFFF',
    cardShadow: 'rgba(27, 43, 33, 0.06)',
  },
  dark: {
    background: '#111513',     // Carbón profundo
    surface: '#1A211D',        // Superficie gris carbón
    surfaceAlt: '#232C27',     // Fondo secundario
    surfaceSubtle: '#2A342E',  // Contenedores sutiles
    text: '#F2F6F3',           // Blanco hueso de alto contraste
    textSecondary: '#A9B7AC',  // Texto secundario
    muted: '#808F83',          // Muted text
    primary: '#76C893',        // Verde bosque claro para modo oscuro
    primaryHover: '#8FD5A8',   // Estado presionado
    primarySoft: '#1D3B2C',    // Verde bosque profundo para badges
    border: '#2C3730',         // Bordes oscuros integrados
    borderLight: '#232B25',    // Separadores ligeros
    danger: '#FF7B72',         // Rojo suave para modo oscuro
    dangerSoft: '#3E1C1A',     // Fondo alerta oscuro
    white: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export type AppColors = typeof palettes.light;

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: AppColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadStoredTheme().then(stored => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    saveStoredTheme(newMode);
  };

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = isDark ? palettes.dark : palettes.light;

  const value = useMemo(() => ({
    mode,
    setMode,
    colors,
    isDark,
  }), [mode, colors, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme debe utilizarse dentro de ThemeProvider');
  }
  return context;
}