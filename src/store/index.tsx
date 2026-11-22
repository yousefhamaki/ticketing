/*
 * App config store.
 *
 * cure-plus-fe keeps the session (authorization, language, current user) in
 * redux and reads it with `useMakeSelectAuthorization` / `useMakeSelectCurrentLanguageId`.
 * This app is one standalone screen set, so the same values live in a React
 * context, but the selector names are kept identical so code moves between the
 * two repos unchanged.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface CurrentUserType {
  user_id: number;
  user_name: string;
  full_name: string;
  email?: string;
  /* S = staff, C = client user */
  user_kind: "S" | "C";
  /* MGT | SUP | AGT | DEV | CLA | CLU */
  role: string;
  management_flag: "Y" | "N";
  kb_approver_flag: "Y" | "N";
  must_change_pwd_flag: "Y" | "N";
  language_id: number;
  team_id?: number;
  team_name?: string;
  function_code?: string;
  client_id?: number;
  client_name?: string;
  env_type?: string;
  branch_id?: number;
  branch_name?: string;
}

interface SessionType {
  authorization: string;
  user?: CurrentUserType;
  languageId: number;
}

const STORAGE_KEY = "etkt-session";

const readStoredSession = (): SessionType => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SessionType;
    }
  } catch (error) {
    /* a damaged value just means "not signed in" */
  }
  return {
    authorization: "",
    languageId: Number(process.env.REACT_APP_DEFAULT_LANGUAGE_ID || 2),
  };
};

interface AppConfigContextProps extends SessionType {
  setSession: (authorization: string, user: CurrentUserType) => void;
  setUser: (user: CurrentUserType) => void;
  setLanguageId: (languageId: number) => void;
  clearSession: () => void;
}

const AppConfigContext = createContext<AppConfigContextProps>(
  {} as AppConfigContextProps,
);

export const AppConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSessionState] = useState<SessionType>(readStoredSession);

  const persist = useCallback((next: SessionType) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSessionState(next);
  }, []);

  const setSession = useCallback(
    (authorization: string, user: CurrentUserType) =>
      persist({
        authorization,
        user,
        languageId: user.language_id || 2,
      }),
    [persist],
  );

  const setUser = useCallback(
    (user: CurrentUserType) =>
      setSessionState((previous) => {
        const next = { ...previous, user };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      }),
    [],
  );

  const setLanguageId = useCallback(
    (languageId: number) =>
      setSessionState((previous) => {
        const next = { ...previous, languageId };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      }),
    [],
  );

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionState({
      authorization: "",
      languageId: Number(process.env.REACT_APP_DEFAULT_LANGUAGE_ID || 2),
    });
  }, []);

  const value = useMemo(
    () => ({ ...session, setSession, setUser, setLanguageId, clearSession }),
    [session, setSession, setUser, setLanguageId, clearSession],
  );

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
export const useMakeSelectAuthorization = () => useAppConfig().authorization;
export const useMakeSelectCurrentLanguageId = () => useAppConfig().languageId;
export const useMakeSelectCurrentUser = () => useAppConfig().user;

/* the four groups the screens branch on */
export const isStaffUser = (user?: CurrentUserType) => user?.user_kind === "S";
export const isManagement = (user?: CurrentUserType) => user?.role === "MGT";
export const isSupervisor = (user?: CurrentUserType) => user?.role === "SUP";
