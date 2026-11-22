/*
 * Header: product name, the unread notification bell, language switch, theme
 * switch, the signed-in user and sign out.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Badge, Dropdown, Icon, Menu, Select } from "antd";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { useBasicMutation, useBasicQuery } from "../../hooks";
import { isStaffUser, useAppConfig } from "../../store";
import { useLabels } from "../../labels";
import { useThemeMode, THEME_MODES } from "../../theme";
import { PAGES_PATH_NAMES } from "../../routes/constants";

const Bar = styled.div`
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onAccent};
  box-shadow: 0 1px 4px ${({ theme }) => theme.colors.shadow};

  .ant-select-selection {
    background: transparent;
    border-color: ${({ theme }) => theme.colors.onAccent};
    color: ${({ theme }) => theme.colors.onAccent};
  }
`;

const Brand = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: default;
`;

const AppHeader = () => {
  const labels = useLabels();
  const history = useHistory();
  const { user, languageId, setLanguageId, clearSession } = useAppConfig();
  const { mode, setMode } = useThemeMode();
  const [unread, setUnread] = useState(0);

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
      <Brand>{labels("appName")}</Brand>
      <Right>
        {isStaffUser(user) ? (
          <Badge count={unread} overflowCount={99}>
            <Icon
              type="bell"
              style={{ fontSize: 18, cursor: "pointer", color: "inherit" }}
              onClick={() => history.push(PAGES_PATH_NAMES.notifications)}
            />
          </Badge>
        ) : null}

        <Select
          size="small"
          value={languageId}
          style={{ width: 92 }}
          onChange={(value: number) => setLanguageId(value)}
        >
          <Select.Option value={2}>العربية</Select.Option>
          <Select.Option value={1}>English</Select.Option>
        </Select>

        <Icon
          type={mode === THEME_MODES.DARK ? "bulb" : "bulb"}
          theme={mode === THEME_MODES.DARK ? "filled" : "outlined"}
          style={{ fontSize: 17, cursor: "pointer" }}
          onClick={() =>
            setMode(
              mode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK,
            )
          }
        />

        <Dropdown overlay={userMenu} trigger={["click"]}>
          <span style={{ cursor: "pointer" }}>
            <Avatar size="small" icon="user" style={{ marginInlineEnd: 6 }} />
            {user ? user.full_name : ""}
          </span>
        </Dropdown>
      </Right>
    </Bar>
  );
};

export default AppHeader;
