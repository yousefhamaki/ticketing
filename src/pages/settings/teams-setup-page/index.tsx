/*
 * Teams, functions and the on-call roster (management only).
 *
 * One GET (etk_admin_pkg/teams_data) brings the three lists, and three POSTs
 * write them. These are the rows the escalation chain reads:
 *   function.supervisor_user_id  -> level 3 of the chain
 *   team.backup_team_id          -> level 2 of the chain
 *   oncall                       -> who takes a Critical ticket out of hours
 */
import React, { useCallback, useState } from "react";
import {
  Button,
  DatePicker,
  Icon,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Tabs,
  Tag,
  message,
} from "antd";
import moment from "moment";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import ExsysTable from "../../../components/exsys-table";
import { useBasicMutation, useBasicQuery } from "../../../hooks";
import { useLabels } from "../../../labels";

const DT_FORMAT = "YYYY-MM-DD HH:mm";

interface PayloadType {
  functions: any[];
  teams: any[];
  oncall: any[];
  roles: any[];
}

const EMPTY: PayloadType = { functions: [], teams: [], oncall: [], roles: [] };

const TeamsSetupPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const [payload, setPayload] = useState<PayloadType>(EMPTY);
  const [staff, setStaff] = useState<any[]>([]);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [editFunction, setEditFunction] = useState<any>(null);
  const [editOncall, setEditOncall] = useState<any>(null);

  const { loading, runQuery } = useBasicQuery<PayloadType>({
    apiId: "adminTeams",
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setPayload(!error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY);
    },
  });

  // the staff list for the supervisor / on-call pickers
  useBasicQuery({
    apiId: "adminUsers",
    params: { user_kind: "S", poffset: 0, poffset_step: 500 },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setStaff(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const { mutate: saveTeam, loading: savingTeam } = useBasicMutation({
    apiId: "adminTeamDml",
  });
  const { mutate: saveFunction, loading: savingFunction } = useBasicMutation({
    apiId: "adminFunctionDml",
  });
  const { mutate: saveOncall, loading: savingOncall } = useBasicMutation({
    apiId: "adminOncallDml",
  });

  const after = useCallback(
    (error: string, close: () => void) => {
      if (error) {
        message.error(error);
        return;
      }
      message.success(labels("saved"));
      close();
      runQuery();
    },
    [labels, runQuery],
  );

  const functionColumns = [
    { title: labels("functionName"), dataIndex: "function_name" },
    { title: "", dataIndex: "function_code", width: 70 },
    { title: labels("supervisor"), dataIndex: "supervisor_name", width: 200 },
    {
      title: labels("supportFlag"),
      dataIndex: "support_flag",
      width: 120,
      render: (value: string) =>
        value === "Y" ? <Tag color={theme.colors.primary}>✓</Tag> : null,
    },
    { title: labels("teams"), dataIndex: "teams", width: 80 },
    { title: labels("displayOrder"), dataIndex: "display_order", width: 90 },
    {
      title: "",
      dataIndex: "active_flag",
      width: 100,
      render: (value: string, record: any) => (
        <Flex gap={8}>
          {value === "N" ? <Tag>{labels("inactive")}</Tag> : null}
          <Icon type="edit" onClick={() => setEditFunction(record)} />
        </Flex>
      ),
    },
  ];

  const teamColumns = [
    { title: labels("teamCode"), dataIndex: "team_code", width: 100 },
    { title: labels("team"), dataIndex: "team_name" },
    { title: labels("functionName"), dataIndex: "function_name", width: 180 },
    { title: labels("backupTeam"), dataIndex: "backup_team_name", width: 180 },
    { title: labels("members"), dataIndex: "members", width: 90 },
    {
      title: "",
      dataIndex: "active_flag",
      width: 100,
      render: (value: string, record: any) => (
        <Flex gap={8}>
          {value === "N" ? <Tag>{labels("inactive")}</Tag> : null}
          <Icon type="edit" onClick={() => setEditTeam(record)} />
        </Flex>
      ),
    },
  ];

  const oncallColumns = [
    { title: labels("oncallPerson"), dataIndex: "user_name", width: 180 },
    { title: labels("backupPerson"), dataIndex: "backup_name", width: 180 },
    { title: labels("from"), dataIndex: "from_date", width: 150 },
    { title: labels("to"), dataIndex: "to_date", width: 150 },
    {
      title: "",
      dataIndex: "current_flag",
      width: 90,
      render: (value: string) =>
        value === "Y" ? (
          <Tag color={theme.colors.success}>{labels("current")}</Tag>
        ) : null,
    },
    { title: labels("notes"), dataIndex: "notes" },
    {
      title: "",
      dataIndex: "oncall_id",
      width: 110,
      render: (value: number, record: any) => (
        <Flex gap={8}>
          <Icon type="edit" onClick={() => setEditOncall(record)} />
          <Popconfirm
            title={labels("confirmDelete")}
            onConfirm={async () => {
              const { error } = await saveOncall({
                record_status: "d",
                oncall_id: value,
              });
              after(error, () => undefined);
            }}
          >
            <Icon type="delete" />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <Flex margin="0 0 12px">
        <PageTitle>{labels("setupTeams")}</PageTitle>
      </Flex>

      <ShadowSection>
        <Tabs defaultActiveKey="functions">
          <Tabs.TabPane tab={labels("functions")} key="functions">
            <Flex justify="flex-end" margin="0 0 10px">
              <Button onClick={() => setEditFunction({ active_flag: "Y" })}>
                <Icon type="plus" /> {labels("add")}
              </Button>
            </Flex>
            <ExsysTable
              rowKey="function_code"
              loading={loading}
              columns={functionColumns as any}
              dataSource={payload.functions}
              scrollX
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("teams")} key="teams">
            <Flex justify="flex-end" margin="0 0 10px">
              <Button onClick={() => setEditTeam({ active_flag: "Y" })}>
                <Icon type="plus" /> {labels("add")}
              </Button>
            </Flex>
            <ExsysTable
              rowKey="team_id"
              loading={loading}
              columns={teamColumns as any}
              dataSource={payload.teams}
              scrollX
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("oncallRoster")} key="oncall">
            <Flex justify="flex-end" margin="0 0 10px">
              <Button onClick={() => setEditOncall({})}>
                <Icon type="plus" /> {labels("add")}
              </Button>
            </Flex>
            <ExsysTable
              rowKey="oncall_id"
              loading={loading}
              columns={oncallColumns as any}
              dataSource={payload.oncall}
              scrollX
            />
          </Tabs.TabPane>
        </Tabs>
      </ShadowSection>

      {/* ---- function ---- */}
      <Modal
        visible={!!editFunction}
        title={labels("functionName")}
        confirmLoading={savingFunction}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditFunction(null)}
        onOk={async () => {
          const { error } = await saveFunction({
            record_status: editFunction && editFunction.function_name ? "u" : "n",
            ...editFunction,
          });
          after(error, () => setEditFunction(null));
        }}
      >
        {editFunction ? (
          <Flex column align="stretch" gap={10}>
            <Input
              placeholder={labels("functionName")}
              maxLength={3}
              disabled={!!editFunction.function_name}
              value={editFunction.function_code || ""}
              onChange={(event) =>
                setEditFunction({
                  ...editFunction,
                  function_code: event.target.value.toUpperCase(),
                })
              }
            />
            <Input
              placeholder={labels("nameEn")}
              value={editFunction.description_p || ""}
              onChange={(event) =>
                setEditFunction({
                  ...editFunction,
                  description_p: event.target.value,
                })
              }
            />
            <Input
              placeholder={labels("nameAr")}
              value={editFunction.description_s || ""}
              onChange={(event) =>
                setEditFunction({
                  ...editFunction,
                  description_s: event.target.value,
                })
              }
            />
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder={labels("supervisor")}
              value={editFunction.supervisor_user_id}
              onChange={(value?: number) =>
                setEditFunction({ ...editFunction, supervisor_user_id: value })
              }
            >
              {staff
                .filter((person) => person.active_flag === "Y")
                .map((person) => (
                  <Select.Option key={person.user_id} value={person.user_id}>
                    {person.full_name}
                  </Select.Option>
                ))}
            </Select>
            <Flex gap={16}>
              <InputNumber
                placeholder={labels("displayOrder")}
                value={editFunction.display_order}
                onChange={(value) =>
                  setEditFunction({ ...editFunction, display_order: value })
                }
              />
              <Flex gap={6}>
                <Switch
                  checked={editFunction.support_flag === "Y"}
                  onChange={(checked) =>
                    setEditFunction({
                      ...editFunction,
                      support_flag: checked ? "Y" : "N",
                    })
                  }
                />
                <span>{labels("supportFlag")}</span>
              </Flex>
              <Flex gap={6}>
                <Switch
                  checked={editFunction.active_flag !== "N"}
                  onChange={(checked) =>
                    setEditFunction({
                      ...editFunction,
                      active_flag: checked ? "Y" : "N",
                    })
                  }
                />
                <span>{labels("active")}</span>
              </Flex>
            </Flex>
          </Flex>
        ) : null}
      </Modal>

      {/* ---- team ---- */}
      <Modal
        visible={!!editTeam}
        title={labels("team")}
        confirmLoading={savingTeam}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditTeam(null)}
        onOk={async () => {
          const { error } = await saveTeam({
            record_status: editTeam && editTeam.team_id ? "u" : "n",
            ...editTeam,
          });
          after(error, () => setEditTeam(null));
        }}
      >
        {editTeam ? (
          <Flex column align="stretch" gap={10}>
            <Input
              placeholder={labels("teamCode")}
              maxLength={5}
              disabled={!!editTeam.team_id}
              value={editTeam.team_code || ""}
              onChange={(event) =>
                setEditTeam({
                  ...editTeam,
                  team_code: event.target.value.toUpperCase(),
                })
              }
            />
            <Input
              placeholder={labels("nameEn")}
              value={editTeam.description_p || ""}
              onChange={(event) =>
                setEditTeam({ ...editTeam, description_p: event.target.value })
              }
            />
            <Input
              placeholder={labels("nameAr")}
              value={editTeam.description_s || ""}
              onChange={(event) =>
                setEditTeam({ ...editTeam, description_s: event.target.value })
              }
            />
            <Select
              placeholder={labels("functionName")}
              value={editTeam.function_code}
              onChange={(value: string) =>
                setEditTeam({ ...editTeam, function_code: value })
              }
            >
              {payload.functions.map((item) => (
                <Select.Option key={item.function_code} value={item.function_code}>
                  {item.function_name}
                </Select.Option>
              ))}
            </Select>
            <Select
              allowClear
              placeholder={labels("backupTeam")}
              value={editTeam.backup_team_id}
              onChange={(value?: number) =>
                setEditTeam({ ...editTeam, backup_team_id: value })
              }
            >
              {payload.teams
                .filter((item) => item.team_id !== editTeam.team_id)
                .map((item) => (
                  <Select.Option key={item.team_id} value={item.team_id}>
                    {item.team_name}
                  </Select.Option>
                ))}
            </Select>
            <Flex gap={6}>
              <Switch
                checked={editTeam.active_flag !== "N"}
                onChange={(checked) =>
                  setEditTeam({ ...editTeam, active_flag: checked ? "Y" : "N" })
                }
              />
              <span>{labels("active")}</span>
            </Flex>
          </Flex>
        ) : null}
      </Modal>

      {/* ---- on-call ---- */}
      <Modal
        visible={!!editOncall}
        title={labels("oncallRoster")}
        confirmLoading={savingOncall}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditOncall(null)}
        onOk={async () => {
          const { error } = await saveOncall({
            record_status: editOncall && editOncall.oncall_id ? "u" : "n",
            ...editOncall,
          });
          after(error, () => setEditOncall(null));
        }}
      >
        {editOncall ? (
          <Flex column align="stretch" gap={10}>
            <Select
              showSearch
              optionFilterProp="children"
              placeholder={labels("oncallPerson")}
              value={editOncall.user_id}
              onChange={(value: number) =>
                setEditOncall({ ...editOncall, user_id: value })
              }
            >
              {staff
                .filter((person) => person.active_flag === "Y")
                .map((person) => (
                  <Select.Option key={person.user_id} value={person.user_id}>
                    {person.full_name}
                  </Select.Option>
                ))}
            </Select>
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder={labels("backupPerson")}
              value={editOncall.backup_user_id}
              onChange={(value?: number) =>
                setEditOncall({ ...editOncall, backup_user_id: value })
              }
            >
              {staff.map((person) => (
                <Select.Option key={person.user_id} value={person.user_id}>
                  {person.full_name}
                </Select.Option>
              ))}
            </Select>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format={DT_FORMAT}
              placeholder={labels("from")}
              value={
                editOncall.from_date
                  ? moment(editOncall.from_date, DT_FORMAT)
                  : undefined
              }
              onChange={(date) =>
                setEditOncall({
                  ...editOncall,
                  from_date: date ? date.format(DT_FORMAT) : undefined,
                })
              }
            />
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format={DT_FORMAT}
              placeholder={labels("to")}
              value={
                editOncall.to_date
                  ? moment(editOncall.to_date, DT_FORMAT)
                  : undefined
              }
              onChange={(date) =>
                setEditOncall({
                  ...editOncall,
                  to_date: date ? date.format(DT_FORMAT) : undefined,
                })
              }
            />
            <Input
              placeholder={labels("notes")}
              value={editOncall.notes || ""}
              onChange={(event) =>
                setEditOncall({ ...editOncall, notes: event.target.value })
              }
            />
          </Flex>
        ) : null}
      </Modal>
    </>
  );
};

export default TeamsSetupPage;
