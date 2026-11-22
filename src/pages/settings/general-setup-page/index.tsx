/*
 * General settings (management only).
 *
 * GET etk_admin2_pkg/general_data brings the settings table and the small code
 * tables in one call.
 *
 * The settings are the knobs the packages read at run time: how long a session
 * lives, how many failed logins lock an account, whether the AI answers first,
 * the escalation mode. The service checks the shape of each value, because a
 * bad one would not fail here - it would show up later as odd behaviour.
 */
import React, { useCallback, useState } from "react";
import { Tabs, Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import SetupGrid from "../../../components/setup-grid";
import { useBasicQuery, useLookups } from "../../../hooks";
import { useLabels } from "../../../labels";

interface PayloadType {
  settings: any[];
  modules: any[];
  os: any[];
  branch_types: any[];
  ai_models: any[];
}

const EMPTY: PayloadType = {
  settings: [],
  modules: [],
  os: [],
  branch_types: [],
  ai_models: [],
};

const GeneralSetupPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const { lookups } = useLookups();
  const [payload, setPayload] = useState<PayloadType>(EMPTY);

  const { loading, runQuery } = useBasicQuery<PayloadType>({
    apiId: "generalSetup",
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setPayload(!error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY);
    },
  });

  const reload = useCallback(() => runQuery(), [runQuery]);

  const settingColumns: ColumnProps<any>[] = [
    { title: labels("settingKey"), dataIndex: "setting_key", width: 240 },
    {
      title: labels("settingValue"),
      dataIndex: "setting_value",
      width: 160,
      render: (value: string) => <strong>{value}</strong>,
    },
    { title: labels("description"), dataIndex: "description" },
  ];

  const moduleColumns: ColumnProps<any>[] = [
    { title: "#", dataIndex: "module_id", width: 60 },
    { title: labels("module"), dataIndex: "description_p" },
    { title: labels("nameAr"), dataIndex: "description_s" },
    { title: labels("defaultTeam"), dataIndex: "default_team_name", width: 170 },
    { title: labels("screens"), dataIndex: "screens", width: 100 },
    { title: labels("clients"), dataIndex: "clients", width: 100 },
    {
      title: labels("active"),
      dataIndex: "active_flag",
      width: 100,
      render: (value: string) =>
        value === "Y" ? null : <Tag>{labels("inactive")}</Tag>,
    },
  ];

  const osColumns: ColumnProps<any>[] = [
    { title: "#", dataIndex: "os_code", width: 60 },
    { title: labels("nameEn"), dataIndex: "description_p" },
    { title: labels("nameAr"), dataIndex: "description_s" },
    { title: labels("displayOrder"), dataIndex: "display_order", width: 110 },
  ];

  const branchTypeColumns: ColumnProps<any>[] = [
    { title: "#", dataIndex: "branch_type_code", width: 70 },
    { title: labels("nameEn"), dataIndex: "description_p" },
    { title: labels("nameAr"), dataIndex: "description_s" },
    {
      title: labels("weight"),
      dataIndex: "weight",
      width: 110,
      render: (value: number) => (
        <Tag color={theme.colors.primary}>{value}</Tag>
      ),
    },
    { title: labels("usedBy"), dataIndex: "branches", width: 110 },
  ];

  const aiColumns: ColumnProps<any>[] = [
    {
      title: labels("purpose"),
      dataIndex: "purpose",
      width: 140,
      render: (value: string) =>
        ({ C: "chat", E: "embedding", S: "summary" } as any)[value] || value,
    },
    { title: labels("provider"), dataIndex: "provider", width: 150 },
    { title: labels("modelName"), dataIndex: "model_name" },
    {
      title: labels("isDefault"),
      dataIndex: "default_flag",
      width: 120,
      render: (value: string) =>
        value === "Y" ? (
          <Tag color={theme.colors.success}>{labels("isDefault")}</Tag>
        ) : null,
    },
  ];

  return (
    <>
      <Flex margin="0 0 12px">
        <PageTitle>{labels("setupGeneral")}</PageTitle>
      </Flex>

      <ShadowSection>
        <Tabs defaultActiveKey="settings">
          <Tabs.TabPane tab={labels("settings")} key="settings">
            <SetupGrid
              rows={payload.settings}
              columns={settingColumns}
              rowKey="setting_key"
              loading={loading}
              apiId="settingDml"
              identity={["setting_key"]}
              onDone={reload}
              note="The packages read these at run time; the service checks each value's shape."
              fields={[
                { name: "setting_value", label: labels("settingValue"), type: "text", max: 400 },
                { name: "description", label: labels("description"), type: "textarea" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("modules")} key="modules">
            <SetupGrid
              rows={payload.modules}
              columns={moduleColumns}
              rowKey="module_id"
              loading={loading}
              apiId="moduleDml"
              canAdd
              onDone={reload}
              newDefaults={{ salable_flag: "Y", active_flag: "Y" }}
              note="MODULE_ID matches EX_PAGE_MASTER in EXSYS."
              fields={[
                {
                  name: "module_id",
                  label: labels("module"),
                  type: "text",
                  max: 3,
                  upper: true,
                  keyField: true,
                  required: true,
                },
                { name: "description_p", label: labels("nameEn"), type: "text", max: 60 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 60 },
                { name: "module_group", label: labels("moduleGroup"), type: "text", max: 2, upper: true },
                {
                  name: "default_team_id",
                  label: labels("defaultTeam"),
                  type: "select",
                  options: lookups.teams.map((team) => ({
                    key: Number(team.key),
                    value: team.value,
                  })),
                },
                { name: "salable_flag", label: labels("salable"), type: "switch" },
                { name: "display_order", label: labels("displayOrder"), type: "number" },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("operatingSystems")} key="os">
            <SetupGrid
              rows={payload.os}
              columns={osColumns}
              rowKey="os_code"
              loading={loading}
              apiId="osDml"
              canAdd
              onDone={reload}
              newDefaults={{ active_flag: "Y" }}
              fields={[
                {
                  name: "os_code",
                  label: "#",
                  type: "text",
                  max: 1,
                  upper: true,
                  keyField: true,
                  required: true,
                },
                { name: "description_p", label: labels("nameEn"), type: "text", max: 30 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 30 },
                { name: "display_order", label: labels("displayOrder"), type: "number" },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("branchTypes")} key="branchTypes">
            <SetupGrid
              rows={payload.branch_types}
              columns={branchTypeColumns}
              rowKey="branch_type_code"
              loading={loading}
              apiId="branchTypeDml"
              canAdd
              onDone={reload}
              newDefaults={{ weight: 1, active_flag: "Y" }}
              note="The weight divides the ticket count in every client comparison."
              fields={[
                {
                  name: "branch_type_code",
                  label: "#",
                  type: "text",
                  max: 3,
                  upper: true,
                  keyField: true,
                  required: true,
                },
                { name: "description_p", label: labels("nameEn"), type: "text", max: 40 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 40 },
                { name: "weight", label: labels("weight"), type: "number" },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("aiModels")} key="ai">
            <SetupGrid
              rows={payload.ai_models}
              columns={aiColumns}
              rowKey="model_id"
              loading={loading}
              apiId="aiModelDml"
              canAdd
              identity={["model_id"]}
              onDone={reload}
              newDefaults={{ purpose: "C", default_flag: "N", active_flag: "Y" }}
              note="Only one model stays the default of each purpose."
              fields={[
                {
                  name: "purpose",
                  label: labels("purpose"),
                  type: "select",
                  required: true,
                  options: [
                    { key: "C", value: "chat" },
                    { key: "E", value: "embedding" },
                    { key: "S", value: "summary" },
                  ],
                },
                { name: "provider", label: labels("provider"), type: "text", max: 30 },
                { name: "model_name", label: labels("modelName"), type: "text", max: 80 },
                { name: "base_url", label: labels("baseUrl"), type: "text", max: 300 },
                { name: "api_key_ref", label: labels("apiKeyRef"), type: "text", max: 100 },
                { name: "default_flag", label: labels("isDefault"), type: "switch" },
                { name: "active_flag", label: labels("active"), type: "switch" },
                { name: "notes", label: labels("notes"), type: "textarea" },
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </ShadowSection>
    </>
  );
};

export default GeneralSetupPage;
