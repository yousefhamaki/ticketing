/*
 * useContractStatus.
 *
 * GET etk_contract_pkg/contract_status_data
 * answers one row: contract_state (OK / W / F / G / B / N), the message in the
 * caller's language, show_banner_flag, blocked_flag and can_open_ticket_flag.
 *
 * It is fetched once for a client user and shared, so the banner and the
 * "new ticket" button read the same answer instead of asking twice.
 *
 * The screen only reads it for the look. The real block is in the database:
 * the trigger on ETK_TICKET refuses a client ticket with -20814, so a user
 * who pokes the URL still cannot open one.
 */
import React, { createContext, useCallback, useContext, useState } from "react";
import useBasicQuery from "./useBasicQuery";
import { isStaffUser, useAppConfig } from "../store";

export interface ContractStatusType {
  client_id?: number;
  contract_id?: number;
  contract_code?: string;
  /* OK valid · W warning · F last days · G grace · B stopped · N no contract */
  contract_state: string;
  contract_end_date?: string;
  days_left?: number;
  grace_days_left?: number;
  show_banner_flag: string;
  blocked_flag: string;
  can_open_ticket_flag: string;
  message?: string;
}

const EMPTY: ContractStatusType = {
  contract_state: "OK",
  show_banner_flag: "N",
  blocked_flag: "N",
  can_open_ticket_flag: "Y",
};

const ContractStatusContext = createContext<{
  status: ContractStatusType;
  loading: boolean;
  reload: () => void;
}>({ status: EMPTY, loading: false, reload: () => undefined });

export const ContractStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { authorization, user } = useAppConfig();
  const [status, setStatus] = useState<ContractStatusType>(EMPTY);

  // only a client user has a contract banner; staff see it inside the ticket
  const isClient = !!user && !isStaffUser(user);

  const { loading, runQuery } = useBasicQuery<{ data: ContractStatusType[] }>({
    apiId: "contractStatus",
    callOnFirstRender: !!authorization && isClient,
    onResponse: ({ apiValues, error }) => {
      const row = !error && apiValues ? (apiValues.data || [])[0] : undefined;
      setStatus(row ? { ...EMPTY, ...row } : EMPTY);
    },
  });

  const reload = useCallback(() => {
    if (isClient) {
      runQuery();
    }
  }, [isClient, runQuery]);

  return (
    <ContractStatusContext.Provider value={{ status, loading, reload }}>
      {children}
    </ContractStatusContext.Provider>
  );
};

export const useContractStatus = () => useContext(ContractStatusContext);
