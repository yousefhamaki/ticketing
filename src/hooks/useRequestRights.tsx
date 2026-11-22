/*
 * useRequestRights.
 *
 * GET etk_user_request_pkg/request_rights_data
 * answers one row:
 *   can_request_flag  Y = the caller is the client manager (may ask for a user)
 *   can_decide_flag   Y = the caller is management (approves / refuses)
 *   pending_count     requests still waiting (all of them for management,
 *                     his own client's for the client manager)
 *
 * Fetched once after sign-in and shared, so the menu and the two screens read
 * the same answer. The screens call reload() after every change so the badge
 * in the menu follows.
 *
 * It only decides what the menu SHOWS. The right itself is checked by the
 * package on every call (-20812), so typing the URL opens nothing.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useBasicQuery from "./useBasicQuery";
import { useAppConfig } from "../store";

export interface RequestRightsType {
  can_request_flag: string;
  can_decide_flag: string;
  pending_count: number;
}

const EMPTY: RequestRightsType = {
  can_request_flag: "N",
  can_decide_flag: "N",
  pending_count: 0,
};

const RequestRightsContext = createContext<{
  rights: RequestRightsType;
  loading: boolean;
  reload: () => void;
}>({ rights: EMPTY, loading: false, reload: () => undefined });

export const RequestRightsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { authorization, user } = useAppConfig();
  const [rights, setRights] = useState<RequestRightsType>(EMPTY);

  // a user who still has the initial password gets -20803 from every service
  const ready = !!authorization && !!user && user.must_change_pwd_flag !== "Y";

  const { loading, runQuery } = useBasicQuery<{ data: RequestRightsType[] }>({
    apiId: "requestRights",
    onResponse: ({ apiValues, error }) => {
      const row = !error && apiValues ? (apiValues.data || [])[0] : undefined;
      setRights(row ? { ...EMPTY, ...row } : EMPTY);
    },
  });

  // asked again whenever the signed-in user changes, so a second user on the
  // same browser tab never inherits the rights of the first one
  useEffect(() => {
    if (ready) {
      runQuery();
    } else {
      setRights(EMPTY);
    }
  }, [ready, runQuery]);

  const reload = useCallback(() => {
    if (ready) {
      runQuery();
    }
  }, [ready, runQuery]);

  return (
    <RequestRightsContext.Provider value={{ rights, loading, reload }}>
      {children}
    </RequestRightsContext.Provider>
  );
};

export const useRequestRights = () => useContext(RequestRightsContext);
