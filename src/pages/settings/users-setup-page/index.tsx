/*
 * Users setup (management only).
 *
 * GET  etk_admin_pkg/users_data        - staff and client users together
 * POST etk_admin_pkg/user_dml          - add / edit
 * POST etk_admin_pkg/user_action_dml   - reset password, unlock, activate, deactivate
 *
 * A user is never deleted: the account is switched off, because tickets and
 * history point at it. The password typed here is a one-time password: the
 * service sets "must change on next login" and drops the user's open sessions.
 */
import React, { useCallback, useState } from "react";
import {
  Button,
  Icon,
  Input,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Tag,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import ExsysTable from "../../../components/exsys-table";
import { useBasicMutation, useBasicQuery, useLookups } from "../../../hooks";
import { useLabels } from "../../../labels";

const PAGE_SIZE = 25;

interface UserRowType {
  user_id: number;
  user_name: string;
  full_name_p: string;
  full_name_s?: string;
  email?: string;
  mobile?: string;
  user_kind: string;
  role_code?: string;
  team_id?: number;
  client_id?: number;
  client_name?: string;
  branch_id?: number;
  seniority?: string;
  management_flag: string;
  kb_approver_flag: string;
  exsys_user_name?: string;
  staff_id?: string;
  language_id: number;
  active_flag: string;
  locked_flag: string;
  must_change_pwd_flag: string;
  last_login_date?: string;
  password?: string;
}

const UsersSetupPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const { lookups } = useLookups();

  const [rows, setRows] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<{ kind?: string; search: string }>({
    search: "",
  });
  const [editing, setEditing] = useState<Partial<UserRowType> | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [resetting, setResetting] = useState<UserRowType | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { loading, runQuery } = useBasicQuery({
    apiId: "adminUsers",
    params: { poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  // the role list lives with the teams service; one call on first render
  useBasicQuery({
    apiId: "adminTeams",
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setRoles(!error && apiValues ? apiValues.roles || [] : []);
    },
  });

  const { loading: saving, mutate: saveUser } = useBasicMutation({
    apiId: "adminUserDml",
  });
  const { mutate: userAction } = useBasicMutation({
    apiId: "adminUserActionDml",
  });

  const load = useCallback(
    (nextOffset: number, nextFilters = filters) => {
      setOffset(nextOffset);
      setFilters(nextFilters);
      runQuery({
        user_kind: nextFilters.kind,
        search: nextFilters.search,
        poffset: nextOffset,
        poffset_step: PAGE_SIZE,
      });
    },
    [runQuery, filters],
  );

  const onSave = useCallback(async () => {
    if (!editing) {
      return;
    }

    const { error } = await saveUser({
      record_status: editing.user_id ? "u" : "n",
      ...editing,
    });

    if (error) {
      message.error(error);
      return;
    }

    message.success(labels("saved"));
    setEditing(null);
    load(offset);
  }, [editing, saveUser, labels, load, offset]);

  const runAction = useCallback(
    async (userId: number, action: string, password?: string) => {
      const { error } = await userAction({
        user_id: userId,
        action,
        new_password: password,
      });

      if (error) {
        message.error(error);
        return;
      }

      message.success(labels("saved"));
      setResetting(null);
      setNewPassword("");
      load(offset);
    },
    [userAction, labels, load, offset],
  );

  const columns: ColumnProps<any>[] = [
    { title: labels("userName"), dataIndex: "user_name", width: 150 },
    { title: labels("fullName"), dataIndex: "full_name", width: 190 },
    {
      title: labels("userKind"),
      dataIndex: "user_kind",
      width: 120,
      render: (value: string) => (
        <Tag>{value === "S" ? labels("staffUser") : labels("clientUser")}</Tag>
      ),
    },
    { title: labels("role"), dataIndex: "role_name", width: 140 },
    { title: labels("team"), dataIndex: "team_name", width: 140 },
    { title: labels("client"), dataIndex: "client_name", width: 160 },
    { title: labels("email"), dataIndex: "email", width: 180 },
    {
      title: "",
      dataIndex: "active_flag",
      width: 180,
      render: (value: string, record: any) => (
        <Flex gap={4} wrap>
          {value === "N" ? <Tag>{labels("inactive")}</Tag> : null}
          {record.management_flag === "Y" ? (
            <Tag color={theme.colors.primary}>{labels("managementFlag")}</Tag>
          ) : null}
          {record.locked_flag === "Y" ? (
            <Tag color={theme.colors.error}>{labels("locked")}</Tag>
          ) : null}
          {record.must_change_pwd_flag === "Y" ? (
            <Tag color={theme.colors.warningDark}>{labels("mustChange")}</Tag>
          ) : null}
        </Flex>
      ),
    },
    { title: labels("lastLogin"), dataIndex: "last_login_date", width: 140 },
    {
      title: "",
      dataIndex: "user_id",
      width: 150,
      render: (value: number, record: any) => (
        <Flex gap={10}>
          <Icon type="edit" onClick={() => setEditing(record)} />
          <Icon type="key" onClick={() => setResetting(record)} />
          {record.locked_flag === "Y" ? (
            <Icon type="unlock" onClick={() => runAction(value, "unlock")} />
          ) : null}
          <Popconfirm
            title={
              record.active_flag === "Y"
                ? labels("deactivate")
                : labels("activate")
            }
            onConfirm={() =>
              runAction(
                value,
                record.active_flag === "Y" ? "deactivate" : "activate",
              )
            }
          >
            <Icon type="poweroff" />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  const isClientUser = editing && editing.user_kind === "C";
  const isNew = !!editing && !editing.user_id;

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px">
        <PageTitle>{labels("setupUsers")}</PageTitle>
        <Button
          type="primary"
          onClick={() =>
            setEditing({
              user_kind: "S",
              language_id: 2,
              active_flag: "Y",
              management_flag: "N",
              kb_approver_flag: "N",
            })
          }
        >
          <Icon type="plus" /> {labels("add")}
        </Button>
      </Flex>

      <ShadowSection>
        <Flex gap={8} margin="0 0 12px" wrap>
          <Input.Search
            allowClear
            style={{ width: 240 }}
            placeholder={labels("search")}
            onSearch={(value) => load(0, { ...filters, search: value })}
          />
          <Select
            allowClear
            style={{ width: 170 }}
            placeholder={labels("userKind")}
            value={filters.kind}
            onChange={(value?: string) => load(0, { ...filters, kind: value })}
          >
            <Select.Option value="S">{labels("staffUser")}</Select.Option>
            <Select.Option value="C">{labels("clientUser")}</Select.Option>
          </Select>
        </Flex>

        <ExsysTable
          rowKey="user_id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          offset={offset}
          pageSize={PAGE_SIZE}
          onPageChange={(next) => load(next)}
          scrollX={1600}
        />
      </ShadowSection>

      <Modal
        visible={!!editing}
        width={720}
        title={labels("setupUsers")}
        confirmLoading={saving}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditing(null)}
        onOk={onSave}
      >
        {editing ? (
          <Flex column align="stretch" gap={10}>
            <Flex gap={10}>
              <Input
                placeholder={labels("userName")}
                maxLength={30}
                disabled={!isNew}
                value={editing.user_name || ""}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    user_name: event.target.value.toUpperCase(),
                  })
                }
              />
              <Select
                style={{ width: 190 }}
                disabled={!isNew}
                value={editing.user_kind}
                onChange={(value: string) =>
                  setEditing({
                    ...editing,
                    user_kind: value,
                    client_id: undefined,
                    branch_id: undefined,
                    management_flag: "N",
                  })
                }
              >
                <Select.Option value="S">{labels("staffUser")}</Select.Option>
                <Select.Option value="C">{labels("clientUser")}</Select.Option>
              </Select>
            </Flex>

            <Flex gap={10}>
              <Input
                placeholder={labels("nameEn")}
                value={editing.full_name_p || ""}
                onChange={(event) =>
                  setEditing({ ...editing, full_name_p: event.target.value })
                }
              />
              <Input
                placeholder={labels("nameAr")}
                value={editing.full_name_s || ""}
                onChange={(event) =>
                  setEditing({ ...editing, full_name_s: event.target.value })
                }
              />
            </Flex>

            <Flex gap={10}>
              <Input
                placeholder={labels("email")}
                value={editing.email || ""}
                onChange={(event) =>
                  setEditing({ ...editing, email: event.target.value })
                }
              />
              <Input
                placeholder={labels("mobile")}
                value={editing.mobile || ""}
                onChange={(event) =>
                  setEditing({ ...editing, mobile: event.target.value })
                }
              />
            </Flex>

            {isNew ? (
              <>
                <Input.Password
                  placeholder={labels("initialPassword")}
                  value={editing.password || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, password: event.target.value })
                  }
                />
                <span style={{ opacity: 0.7, fontSize: 12 }}>
                  {labels("passwordWillBeOneTime")}
                </span>
              </>
            ) : null}

            <Flex gap={10}>
              <Select
                style={{ width: "100%" }}
                allowClear
                placeholder={labels("role")}
                value={editing.role_code}
                onChange={(value?: string) =>
                  setEditing({ ...editing, role_code: value })
                }
              >
                {roles
                  .filter((role) =>
                    isClientUser
                      ? role.staff_flag === "N"
                      : role.staff_flag === "Y",
                  )
                  .map((role) => (
                    <Select.Option key={role.key} value={String(role.key)}>
                      {role.value}
                    </Select.Option>
                  ))}
              </Select>

              {!isClientUser ? (
                <Select
                  style={{ width: "100%" }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder={labels("team")}
                  value={editing.team_id}
                  onChange={(value?: number) =>
                    setEditing({ ...editing, team_id: value })
                  }
                >
                  {lookups.teams.map((team) => (
                    <Select.Option key={team.key} value={Number(team.key)}>
                      {team.value}
                    </Select.Option>
                  ))}
                </Select>
              ) : null}
            </Flex>

            {isClientUser ? (
              <span style={{ opacity: 0.7, fontSize: 12 }}>
                {editing.client_name ||
                  `${labels("client")} #${editing.client_id || ""}`}
              </span>
            ) : null}

            <Flex gap={16} wrap>
              <Select
                style={{ width: 150 }}
                value={editing.language_id}
                onChange={(value: number) =>
                  setEditing({ ...editing, language_id: value })
                }
              >
                <Select.Option value={2}>العربية</Select.Option>
                <Select.Option value={1}>English</Select.Option>
              </Select>

              {!isClientUser ? (
                <Flex gap={6}>
                  <Switch
                    checked={editing.management_flag === "Y"}
                    onChange={(checked) =>
                      setEditing({
                        ...editing,
                        management_flag: checked ? "Y" : "N",
                      })
                    }
                  />
                  <span>{labels("managementFlag")}</span>
                </Flex>
              ) : null}

              <Flex gap={6}>
                <Switch
                  checked={editing.kb_approver_flag === "Y"}
                  onChange={(checked) =>
                    setEditing({
                      ...editing,
                      kb_approver_flag: checked ? "Y" : "N",
                    })
                  }
                />
                <span>{labels("kbApproverFlag")}</span>
              </Flex>

              {!isNew ? (
                <Flex gap={6}>
                  <Switch
                    checked={editing.active_flag === "Y"}
                    onChange={(checked) =>
                      setEditing({ ...editing, active_flag: checked ? "Y" : "N" })
                    }
                  />
                  <span>{labels("active")}</span>
                </Flex>
              ) : null}
            </Flex>

            {!isClientUser ? (
              <Flex gap={10}>
                <Input
                  placeholder={labels("exsysUserName")}
                  value={editing.exsys_user_name || ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      exsys_user_name: event.target.value.toUpperCase(),
                    })
                  }
                />
                <Input
                  placeholder={labels("staffId")}
                  value={editing.staff_id || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, staff_id: event.target.value })
                  }
                />
              </Flex>
            ) : null}
          </Flex>
        ) : null}
      </Modal>

      <Modal
        visible={!!resetting}
        title={labels("resetPassword")}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => {
          setResetting(null);
          setNewPassword("");
        }}
        onOk={() =>
          resetting && runAction(resetting.user_id, "reset_password", newPassword)
        }
      >
        <Input.Password
          placeholder={labels("newPassword")}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
          {labels("passwordWillBeOneTime")}
        </div>
      </Modal>
    </>
  );
};

export default UsersSetupPage;
