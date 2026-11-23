/*
 * Header: EXSYS logo + product name, the unread notification bell, theme
 * switch, language pills, the signed-in user and sign out.
 *
 * 23-11-2026 - new look (same idea as the Cure+ header):
 *   OLD    : blue bar, product name as text only, language as a select,
 *            role code (MGT) shown when the user has no team.
 *   NEW    : white bar with the EXSYS logo of the reports footer, round icon
 *            buttons, language list, user menu; the user line shows the team
 *            or the client, never a role code.
 *   REASON : Khaled - make the app look like our product (Cure+).
 *   BENEFIT: one brand across Cure+, the HTML reports and the ticketing app.
 *            Behaviour (bell refresh every minute, logout) is unchanged.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Badge, Dropdown, Icon, Menu, Tooltip } from "antd";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { useBasicMutation, useBasicQuery } from "../../hooks";
import { isStaffUser, useAppConfig } from "../../store";
import { useLabels } from "../../labels";
import { useThemeMode, THEME_MODES } from "../../theme";
import { PAGES_PATH_NAMES } from "../../routes/constants";
import ExsysLogo from "../exsys-logo";
import LanguageSelect from "../language-select";

const Bar = styled.div`
  height: 62px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.desktopNavDivider};
  box-shadow: 0 1px 4px ${({ theme }) => theme.colors.shadow};
  position: relative;
  z-index: 2;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
`;

const BrandDivider = styled.span`
  width: 1px;
  height: 28px;
  background: ${({ theme }) => theme.colors.desktopNavDivider};
`;

const BrandName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.brandNavy};
  white-space: nowrap;

  @media (max-width: 700px) {
    display: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RoundButton = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 17px;
  color: ${({ theme }) => theme.colors.desktopNavText};
  border: 1px solid ${({ theme }) => theme.colors.desktopNavDivider};
  background: ${({ theme }) => theme.colors.background};
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserBox = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 3px 12px 3px 4px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.desktopNavDivider};
  color: ${({ theme }) => theme.colors.desktopNavText};
  max-width: 260px;

  .user-lines {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
  }
  .user-name {
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-place {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.desktopNavMutedText};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 700px) {
    .user-lines {
      display: none;
    }
  }
`;

const AppHeader = () => {
  const labels = useLabels();
  const history = useHistory();
  const { user, clearSession } = useAppConfig();
  const { mode, setMode } = useThemeMode();
  const [unread, setUnread] = useState(0);
  const staff = isStaffUser(user);

  const { runQuery } = useBasicQuery({
    apiId: "notifications",
    params: { unread_only: "Y", poffset: 0, poffset_step: 1 },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      if (!error) {
        const rows = (apiValues && apiValues.data) || [];
        setUnread(rows.length ? Number(rows[0].unread || 0) : 0);
      }
    },
  });

  // the escalation job runs every minute, so a minute is the right beat here
  useEffect(() => {
    const timer = window.setInterval(() => runQuery(), 60000);
    return () => window.clearInterval(timer);
  }, [runQuery]);

  const { mutate: logout } = useBasicMutation({ apiId: "logout", flatBody: true });

  const onLogout = useCallback(async () => {
    await logout({});
    clearSession();
  }, [logout, clearSession]);

  const isDark = mode === THEME_MODES.DARK;

  // staff: team, or "Management" when the user has no team; client: hospital
  const place = user
    ? staff
      ? user.team_name ||
        (user.management_flag === "Y" ? labels("managementRole") : "")
      : user.client_name || ""
    : "";

  const userMenu = (
    <Menu>
      <Menu.Item
        key="change-password"
        onClick={() => history.push(PAGES_PATH_NAMES.changePassword)}
      >
        <Icon type="lock" /> {labels("changePassword")}
      </Menu.Item>
      <Menu.Item key="logout" onClick={onLogout}>
        <Icon type="logout" /> {labels("logout")}
      </Menu.Item>
    </Menu>
  );

  return (
    <Bar>
      <Brand onClick={() => history.push("/")}>
        <ExsysLogo height={32} />
        <BrandDivider />
        <BrandName>{labels("appName")}</BrandName>
      </Brand>

      <Right>
        {staff ? (
          <Tooltip title={labels("notifications")}>
            <Badge count={unread} overflowCount={99} offset={[-4, 4]}>
              <RoundButton
                onClick={() => history.push(PAGES_PATH_NAMES.notifications)}
              >
                <Icon type="bell" />
              </RoundButton>
            </Badge>
          </Tooltip>
        ) : null}

        <RoundButton
          onClick={() =>
            setMode(isDark ? THEME_MODES.LIGHT : THEME_MODES.DARK)
          }
        >
          <Icon type="bulb" theme={isDark ? "filled" : "outlined"} />
        </RoundButton>

        {/* 23-11-2026: the active languages of ETK_LANGUAGE (was: ع / EN) */}
        <LanguageSelect width={130} round />

        <Dropdown overlay={userMenu} trigger={["click"]}>
          <UserBox>
            <Avatar
              size={30}
              icon="user"
              style={{ background: "#006fbb", flexShrink: 0 }}
            />
            <span className="user-lines">
              <span className="user-name">{user ? user.full_name : ""}</span>
              {place ? <span className="user-place">{place}</span> : null}
            </span>
          </UserBox>
        </Dropdown>

        <Tooltip title={labels("logout")}>
          <RoundButton onClick={onLogout}>
            <Icon type="logout" />
          </RoundButton>
        </Tooltip>
      </Right>
    </Bar>
  );
};

export default AppHeader;
