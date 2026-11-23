/*
 * The icon rail + menu. Items are filtered by role, the same way the prototype
 * showed them (management sees all, supervisor sees the distribution screens,
 * agents see their own queue, clients get the portal menu).
 */
import React from "react";
import { Badge, Icon, Menu } from "antd";
import styled from "styled-components";
import { useHistory, useLocation } from "react-router-dom";
import { PAGES_PATH_NAMES } from "../../routes/constants";
import { isManagement, isStaffUser, useAppConfig } from "../../store";
import { useLabels } from "../../labels";
import { useRequestRights } from "../../hooks";

/*
 * 23-11-2026 - new look (same idea as the Cure+ side menu):
 *   OLD    : flat grey column, square items.
 *   NEW    : white rounded card floating on the page background, rounded
 *            items, the selected item filled with the brand blue.
 *   REASON : Khaled - match Cure+.   BENEFIT: same product look.
 *   Menu items and role rules are unchanged.
 */
const Side = styled.div`
  width: 228px;
  flex-shrink: 0;
  margin: 12px;
  margin-inline-end: 0;
  padding: 10px 8px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.desktopNavDivider};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  overflow-y: auto;

  .ant-menu {
    background: transparent;
    border: none !important;
    color: ${({ theme }) => theme.colors.desktopNavText};
  }
  .ant-menu-inline .ant-menu-item,
  .ant-menu-inline .ant-menu-submenu-title {
    height: 42px;
    line-height: 42px;
    margin: 4px 0 !important;
    width: 100%;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.desktopNavText};
    font-weight: 500;
  }
  .ant-menu-inline .ant-menu-item::after {
    display: none;
  }
  .ant-menu-item .anticon,
  .ant-menu-submenu-title .anticon {
    font-size: 16px;
  }
  .ant-menu-item:hover,
  .ant-menu-submenu-title:hover {
    background: ${({ theme }) => theme.colors.menuHover};
    color: ${({ theme }) => theme.colors.primary};
  }
  .ant-menu-item-selected,
  .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
    background: ${({ theme }) => theme.colors.primary} !important;
    color: ${({ theme }) => theme.colors.onAccent} !important;
    box-shadow: 0 4px 10px ${({ theme }) => theme.colors.primary}40;
  }
  .ant-menu-item-selected .anticon,
  .ant-menu-item-selected a {
    color: ${({ theme }) => theme.colors.onAccent};
  }
  .ant-menu-sub.ant-menu-inline {
    background: transparent;
  }

  @media (max-width: 800px) {
    width: 64px;
    .ant-menu-item span,
    .ant-menu-submenu-title span span {
      display: none;
    }
  }
`;

const Sidebar = () => {
  const history = useHistory();
  const location = useLocation();
  const labels = useLabels();
  const { user } = useAppConfig();
  const staff = isStaffUser(user);
  // who may ask for a user / decide a request, and how many requests wait.
  // It comes from the server (request_rights_data); the menu only shows it.
  const { rights } = useRequestRights();

  // the setup group is drawn only for management; the packages refuse the
  // services to anyone else anyway, so this just keeps the menu honest
  const setupItems = isManagement(user)
    ? [
        {
          key: PAGES_PATH_NAMES.setupClients,
          icon: "shop",
          label: labels("setupClients"),
        },
        {
          key: PAGES_PATH_NAMES.setupUsers,
          icon: "user",
          label: labels("setupUsers"),
        },
        {
          key: PAGES_PATH_NAMES.setupUserRequests,
          icon: "user-add",
          label: labels("userRequests"),
          badge: rights.pending_count,
        },
        {
          key: PAGES_PATH_NAMES.setupTeams,
          icon: "cluster",
          label: labels("setupTeams"),
        },
        {
          key: PAGES_PATH_NAMES.setupSla,
          icon: "clock-circle",
          label: labels("setupSla"),
        },
        {
          key: PAGES_PATH_NAMES.setupWorkflow,
          icon: "share-alt",
          label: labels("setupWorkflow"),
        },
        {
          key: PAGES_PATH_NAMES.setupGeneral,
          icon: "tool",
          label: labels("setupGeneral"),
        },
      ]
    : [];

  const items = staff
    ? [
        { key: PAGES_PATH_NAMES.home, icon: "dashboard", label: labels("home") },
        {
          key: PAGES_PATH_NAMES.tickets,
          icon: "profile",
          label: labels("tickets"),
        },
        {
          key: PAGES_PATH_NAMES.escalation,
          icon: "alert",
          label: labels("escalation"),
        },
        {
          key: PAGES_PATH_NAMES.notifications,
          icon: "bell",
          label: labels("notifications"),
        },
        {
          key: PAGES_PATH_NAMES.clients,
          icon: "team",
          label: labels("clients"),
        },
      ]
    : [
        {
          key: PAGES_PATH_NAMES.clientMyTickets,
          icon: "profile",
          label: labels("myTickets"),
        },
        {
          key: PAGES_PATH_NAMES.clientNewTicket,
          icon: "plus-circle",
          label: labels("newTicket"),
        },
        // only the client manager gets this item (ETK_USER.CLIENT_ADMIN_FLAG)
        ...(rights.can_request_flag === "Y"
          ? [
              {
                key: PAGES_PATH_NAMES.clientUserRequests,
                icon: "user-add",
                label: labels("userRequests"),
              },
            ]
          : []),
      ];

  // the details screen keeps the list item highlighted
  const selected = items
    .concat(setupItems)
    .map((item) => item.key)
    .filter((key) => location.pathname.indexOf(key) === 0)
    .sort((a, b) => b.length - a.length)[0];

  return (
    <Side>
      <Menu
        mode="inline"
        selectedKeys={selected ? [selected] : []}
        onClick={({ key }) => history.push(key)}
      >
        {items.map((item) => (
          <Menu.Item key={item.key}>
            <Icon type={item.icon} />
            <span>{item.label}</span>
          </Menu.Item>
        ))}

        {setupItems.length ? (
          <Menu.SubMenu
            key="setup"
            title={
              <span>
                <Icon type="setting" />
                <span>{labels("setup")}</span>
              </span>
            }
          >
            {setupItems.map((item: any) => (
              <Menu.Item key={item.key}>
                <Icon type={item.icon} />
                <span>{item.label}</span>
                {item.badge ? (
                  <Badge count={item.badge} style={{ marginInlineStart: 8 }} />
                ) : null}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        ) : null}
      </Menu>
    </Side>
  );
};

export default Sidebar;
