/*
 * Footer bar, the same idea as the Cure+ footer:
 *   start : who is signed in (or the product name on the login page)
 *   middle: copyright + the EXSYS logo of the HTML reports footer
 *   end   : version of this front end
 * Used by the app shell and by the login page, so both look the same.
 */
import React from "react";
import styled from "styled-components";
import { useAppConfig } from "../../store";
import { useLabels } from "../../labels";
import ExsysLogo from "../exsys-logo";

/* front end version shown in the footer; raise it with package.json */
export const APP_VERSION = "1.1.0";

const Bar = styled.footer`
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.desktopNavDivider};
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const Who = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
`;

const Middle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  direction: ltr;
`;

const Version = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  white-space: nowrap;

  @media (max-width: 700px) {
    display: none;
  }
`;

const AppFooter = () => {
  const labels = useLabels();
  const { user } = useAppConfig();

  // client users see their hospital, staff see their team
  const place = user ? user.client_name || user.team_name || "" : "";
  const who = user
    ? `${user.full_name}${place ? ` (${place})` : ""}`
    : labels("appName");

  return (
    <Bar>
      <Who title={who}>{who}</Who>
      <Middle>
        <span>{labels("rightsReserved")}</span>
        <ExsysLogo height={16} />
      </Middle>
      <Version>
        <span dir="ltr">v{APP_VERSION}</span>
      </Version>
    </Bar>
  );
};

export default AppFooter;
