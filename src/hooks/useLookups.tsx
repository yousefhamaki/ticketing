/*
 * useLookups: every list the screens need in ONE call (lookups_data), fetched
 * once after sign-in and shared through a context, so no screen fires its own
 * lookup requests.
 */
import React, { createContext, useCallback, useContext, useState } from "react";
import useBasicQuery from "./useBasicQuery";
import { useMakeSelectAuthorization } from "../store";

export interface KeyValueType {
  key: string | number;
  value: string;
  [extra: string]: any;
}

export interface LookupsType {
  statuses: KeyValueType[];
  status_next: {
    from_status: string;
    to_status: string;
    client_ticket_only_flag: string;
    actor: string;
  }[];
  status_fields: {
    status_code: string;
    field: string;
    label: string;
    input_type: string;
    client_visible_flag: string;
  }[];
  types: KeyValueType[];
  priorities: KeyValueType[];
  modules: KeyValueType[];
  os: KeyValueType[];
  branches: KeyValueType[];
  teams: KeyValueType[];
  staff: KeyValueType[];
  root_causes: KeyValueType[];
  canned_replies: KeyValueType[];
}

const EMPTY: LookupsType = {
  statuses: [],
  status_next: [],
  status_fields: [],
  types: [],
  priorities: [],
  modules: [],
  os: [],
  branches: [],
  teams: [],
  staff: [],
  root_causes: [],
  canned_replies: [],
};

const LookupsContext = createContext<{
  lookups: LookupsType;
  loading: boolean;
  reload: () => void;
}>({ lookups: EMPTY, loading: false, reload: () => undefined });

export const LookupsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authorization = useMakeSelectAuthorization();
  const [lookups, setLookups] = useState<LookupsType>(EMPTY);

  const { loading, runQuery } = useBasicQuery<Partial<LookupsType>>({
    apiId: "lookups",
    callOnFirstRender: !!authorization,
    onResponse: ({ apiValues, error }) => {
      if (!error && apiValues) {
        setLookups({ ...EMPTY, ...apiValues });
      }
    },
  });

  const reload = useCallback(() => {
    runQuery();
  }, [runQuery]);

  return (
    <LookupsContext.Provider value={{ lookups, loading, reload }}>
      {children}
    </LookupsContext.Provider>
  );
};

export const useLookups = () => useContext(LookupsContext);

/* the label of a key inside one of the lists */
export const lookupValue = (
  list: KeyValueType[],
  key?: string | number,
): string => {
  if (key === undefined || key === null) {
    return "";
  }
  const found = list.find((item) => String(item.key) === String(key));
  return found ? found.value : String(key);
};
