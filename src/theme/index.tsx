/*
 * AppThemeProvider: puts the colors on the styled-components theme, keeps the
 * user's light / dark / system choice in local storage and follows the OS when
 * the mode is "system" - the same behaviour as cure-plus-fe.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";
import {
  SYSTEM_DARK_MEDIA_QUERY,
  THEME_COLORS,
  THEME_MODES,
  THEME_MODE_STORAGE_KEY,
  ThemeColorsType,
  ThemeModeType,
} from "./constants";

interface ThemeContextProps {
  mode: ThemeModeType;
  isDark: boolean;
  setMode: (mode: ThemeModeType) => void;
}

const ThemeModeContext = createContext<ThemeContextProps>({
  mode: THEME_MODES.LIGHT,
  isDark: false,
  setMode: () => undefined,
});

const readStoredMode = (): ThemeModeType => {
  const stored = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  return stored === THEME_MODES.DARK ||
    stored === THEME_MODES.SYSTEM ||
    stored === THEME_MODES.LIGHT
    ? stored
    : THEME_MODES.LIGHT;
};

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeModeType>(readStoredMode);
  const [systemDark, setSystemDark] = useState<boolean>(
    () => window.matchMedia(SYSTEM_DARK_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(SYSTEM_DARK_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);

    if (query.addEventListener) {
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }
    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, []);

  const setMode = useCallback((nextMode: ThemeModeType) => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    setModeState(nextMode);
  }, []);

  const isDark =
    mode === THEME_MODES.DARK || (mode === THEME_MODES.SYSTEM && systemDark);

  const colors: ThemeColorsType = isDark
    ? (THEME_COLORS.dark as unknown as ThemeColorsType)
    : THEME_COLORS.light;

  const contextValue = useMemo(
    () => ({ mode, isDark, setMode }),
    [mode, isDark, setMode],
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={{ colors, isDark }}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
export { THEME_COLORS, THEME_MODES };
export default AppThemeProvider;
