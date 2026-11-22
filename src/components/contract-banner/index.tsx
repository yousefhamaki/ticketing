/*
 * The maintenance contract banner at the top of the client portal.
 *
 * The colour follows contract_state, and the words are the server's `message`
 * in the caller's language - the screen writes no text of its own, so the
 * wording changes in one place.
 *
 *   W  warning, the end is near      -> yellow
 *   F  the last days                 -> orange
 *   G  grace period after the end    -> red
 *   B  stopped                       -> red
 *   N  no contract at all            -> red
 *   OK valid                         -> no banner
 */
import React from "react";
import { Alert } from "antd";
import { useTheme } from "styled-components";
import { useContractStatus } from "../../hooks";

const ContractBanner = () => {
  const theme = useTheme();
  const { status } = useContractStatus();

  if (status.show_banner_flag !== "Y" || !status.message) {
    return null;
  }

  const tone = (() => {
    if (status.contract_state === "W") {
      return {
        background: theme.colors.warningBackground,
        border: theme.colors.warning,
        text: theme.colors.warningDark,
      };
    }
    if (status.contract_state === "F") {
      return {
        background: theme.colors.warningBackground,
        border: theme.colors.accentOrange,
        text: theme.colors.accentOrange,
      };
    }
    return {
      background: theme.colors.dangerBackground,
      border: theme.colors.error,
      text: theme.colors.error,
    };
  })();

  return (
    <Alert
      banner
      showIcon
      type={status.contract_state === "W" ? "warning" : "error"}
      message={<span style={{ color: tone.text }}>{status.message}</span>}
      style={{
        background: tone.background,
        borderBottom: `2px solid ${tone.border}`,
      }}
    />
  );
};

export default ContractBanner;
