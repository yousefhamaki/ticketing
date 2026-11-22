/*
 * SLA, escalation ladder, working hours and holidays (management only).
 *
 * GET etk_admin2_pkg/sla_data brings the five lists plus the handful of
 * settings this screen owns, in one call.
 *
 * These numbers are the ones the ticket package reads when it works out
 * accept_due / resolve_due and when the job walks the escalation ladder, so a
 * change here changes the behaviour of every new ticket - no code, no deploy.
 */
import React, { useCallback, useState } from "react";
import { Alert, Tabs, Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import SetupGrid from "../../../components/setup-grid";
import { useBasicQuery } from "../../../hooks";
import { useLabels } from "../../../labels";

interface PayloadType {
  priorities: any[];
  contract_levels: any[];
  escalation_levels: any[];
  work_days: any[];
  holidays: any[];
  settings: any[];
}

const EMPTY: PayloadType = {
  priorities: [],
  contract_levels: [],
  escalation_levels: [],
  work_days: [],
  holidays: [],
  settings: [],
};

/* minutes from midnight <-> HH:MM, which is how the table stores the day */
const toClock = (minute?: number) =>
  minute === null || minute === undefined
    ? ""
    : `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(
        minute % 60,
      ).padStart(2, "0")}`;

const SlaSetupPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const [payload, setPayload] = useState<PayloadType>(EMPTY);

  const { loading, runQuery } = useBasicQuery<PayloadType>({
    apiId: "slaSetup",
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setPayload(!error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY);
    },
  });

  const reload = useCallback(() => runQuery(), [runQuery]);

  const setting = (key: string) => {
    const found = payload.settings.find((item) => item.setting_key === key);
    return found ? found.setting_value : "";
  };

  const priorityColumns: ColumnProps<any>[] = [
    { title: "#", dataIndex: "priority_code", width: 50 },
    { title: labels("priority"), dataIndex: "priority_name" },
    { title: labels("acceptMinutes"), dataIndex: "accept_minutes", width: 140 },
    { title: labels("resolveMinutes"), dataIndex: "resolve_minutes", width: 140 },
    {
      title: labels("roundClock"),
      dataIndex: "round_clock_flag",
      width: 130,
      render: (value: string) =>
        value === "Y" ? <Tag color={theme.colors.primary}>24/7</Tag> : null,
    },
    {
      title: labels("escalates"),
      dataIndex: "escalation_flag",
      width: 110,
      render: (value: string) => (value === "Y" ? <Tag>✓</Tag> : null),
    },
  ];

  const levelColumns: ColumnProps<any>[] = [
    { title: labels("contractLevel"), dataIndex: "level_name" },
    { title: labels("slaFactor"), dataIndex: "sla_factor_pct", width: 130 },
    { title: labels("contracts"), dataIndex: "contracts", width: 110 },
  ];

  const escColumns: ColumnProps<any>[] = [
    { title: labels("levelNo"), dataIndex: "level_no", width: 70 },
    { title: labels("escLevel"), dataIndex: "level_name" },
    {
      title: labels("target"),
      dataIndex: "target_kind",
      width: 150,
      render: (value: string) =>
        ({
          T: labels("team"),
          B: labels("backupTeam"),
          S: labels("supervisor"),
          M: labels("managementFlag"),
        } as any)[value] || value,
    },
    { title: labels("fixedWait"), dataIndex: "fixed_wait_minutes", width: 140 },
    { title: labels("waitPct"), dataIndex: "wait_pct", width: 140 },
  ];

  const dayColumns: ColumnProps<any>[] = [
    { title: labels("workDay"), dataIndex: "day_name" },
    {
      title: labels("isWorkDay"),
      dataIndex: "work_flag",
      width: 130,
      render: (value: string) =>
        value === "Y" ? (
          <Tag color={theme.colors.success}>{labels("isWorkDay")}</Tag>
        ) : (
          <Tag>{labels("inactive")}</Tag>
        ),
    },
    {
      title: labels("fromTime"),
      dataIndex: "from_minute",
      width: 110,
      render: (value: number) => toClock(value),
    },
    {
      title: labels("toTime"),
      dataIndex: "to_minute",
      width: 110,
      render: (value: number) => toClock(value),
    },
  ];

  const holidayColumns: ColumnProps<any>[] = [
    { title: labels("holidayDate"), dataIndex: "holiday_date", width: 160 },
    { title: labels("description"), dataIndex: "description" },
  ];

  return (
    <>
      <Flex margin="0 0 12px">
        <PageTitle>{labels("setupSla")}</PageTitle>
      </Flex>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message={`${labels("sla")}: ${labels("internalNote")} = ${setting(
          "INTERNAL_SLA_PCT",
        )}%  ·  ESC_MODE = ${setting("ESC_MODE")}`}
      />

      <ShadowSection>
        <Tabs defaultActiveKey="priorities">
          <Tabs.TabPane tab={labels("priorities")} key="priorities">
            <SetupGrid
              rows={payload.priorities}
              columns={priorityColumns}
              rowKey="priority_code"
              loading={loading}
              apiId="priorityDml"
              identity={["priority_code"]}
              onDone={reload}
              fields={[
                { name: "description_p", label: labels("nameEn"), type: "text", max: 20 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 20 },
                { name: "accept_minutes", label: labels("acceptMinutes"), type: "number" },
                { name: "resolve_minutes", label: labels("resolveMinutes"), type: "number" },
                { name: "round_clock_flag", label: labels("roundClock"), type: "switch" },
                { name: "escalation_flag", label: labels("escalates"), type: "switch" },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("contractLevels")} key="levels">
            <SetupGrid
              rows={payload.contract_levels}
              columns={levelColumns}
              rowKey="level_code"
              loading={loading}
              apiId="contractLevelDml"
              canAdd
              onDone={reload}
              newDefaults={{ sla_factor_pct: 100 }}
              fields={[
                {
                  name: "level_code",
                  label: labels("contractLevel"),
                  type: "text",
                  max: 1,
                  upper: true,
                  keyField: true,
                  required: true,
                },
                { name: "description_p", label: labels("nameEn"), type: "text", max: 20 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 20 },
                { name: "sla_factor_pct", label: labels("slaFactor"), type: "number" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("escalationLadder")} key="escalation">
            <SetupGrid
              rows={payload.escalation_levels}
              columns={escColumns}
              rowKey="level_no"
              loading={loading}
              apiId="escalationLevelDml"
              identity={["level_no"]}
              onDone={reload}
              note={`ESC_MODE = ${setting("ESC_MODE")}`}
              fields={[
                { name: "description_p", label: labels("nameEn"), type: "text", max: 40 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 40 },
                {
                  name: "target_kind",
                  label: labels("target"),
                  type: "select",
                  required: true,
                  options: [
                    { key: "T", value: labels("team") },
                    { key: "B", value: labels("backupTeam") },
                    { key: "S", value: labels("supervisor") },
                    { key: "M", value: labels("managementFlag") },
                  ],
                },
                { name: "fixed_wait_minutes", label: labels("fixedWait"), type: "number" },
                { name: "wait_pct", label: labels("waitPct"), type: "number" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("workingHours")} key="days">
            <SetupGrid
              rows={payload.work_days}
              columns={dayColumns}
              rowKey="day_no"
              loading={loading}
              apiId="workDayDml"
              identity={["day_no"]}
              onDone={reload}
              fields={[
                { name: "work_flag", label: labels("isWorkDay"), type: "switch" },
                {
                  name: "from_minute",
                  label: labels("fromTime"),
                  type: "number",
                  hint: "480 = 08:00",
                },
                {
                  name: "to_minute",
                  label: labels("toTime"),
                  type: "number",
                  hint: "960 = 16:00",
                },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("holidays")} key="holidays">
            <SetupGrid
              rows={payload.holidays}
              columns={holidayColumns}
              rowKey="holiday_date"
              loading={loading}
              apiId="holidayDml"
              canAdd
              canDelete
              onDone={reload}
              fields={[
                {
                  name: "holiday_date",
                  label: labels("holidayDate"),
                  type: "date",
                  keyField: true,
                  required: true,
                },
                { name: "description", label: labels("description"), type: "text", max: 100 },
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </ShadowSection>
    </>
  );
};

export default SlaSetupPage;
