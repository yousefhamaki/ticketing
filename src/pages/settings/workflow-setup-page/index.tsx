/*
 * Workflow (management only): the status machine and the lists the ticket
 * screen offers.
 *
 * GET etk_admin2_pkg/workflow_data brings statuses, allowed moves, mandatory
 * fields, ticket types, root causes and canned replies in one call.
 *
 * Two things are deliberately not editable here, and the services refuse them:
 *  - a status's OPEN / FINAL flags: the packages read them to decide what
 *    "closed" means, so flipping one would re-interpret every saved ticket.
 *  - a mandatory field the ticket package cannot read: it would look like a
 *    live rule on screen and never actually fire.
 */
import React, { useCallback, useState } from "react";
import { Alert, Tabs, Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import SetupGrid from "../../../components/setup-grid";
import { useBasicQuery, useLookups } from "../../../hooks";
import { useLabels } from "../../../labels";

interface PayloadType {
  statuses: any[];
  transitions: any[];
  status_fields: any[];
  known_fields: { key: string; value: string }[];
  ticket_types: any[];
  root_causes: any[];
  canned_replies: any[];
}

const EMPTY: PayloadType = {
  statuses: [],
  transitions: [],
  status_fields: [],
  known_fields: [],
  ticket_types: [],
  root_causes: [],
  canned_replies: [],
};

const WorkflowSetupPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const { lookups } = useLookups();
  const [payload, setPayload] = useState<PayloadType>(EMPTY);

  const { loading, runQuery } = useBasicQuery<PayloadType>({
    apiId: "workflowSetup",
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setPayload(!error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY);
    },
  });

  const reload = useCallback(() => runQuery(), [runQuery]);

  const statusOptions = payload.statuses.map((item) => ({
    key: item.status_code,
    value: `${item.status_name} (${item.status_code})`,
  }));

  const statusColumns: ColumnProps<any>[] = [
    { title: "#", dataIndex: "status_code", width: 50 },
    { title: labels("status"), dataIndex: "status_name" },
    {
      title: labels("openFlag"),
      dataIndex: "open_flag",
      width: 100,
      render: (value: string) =>
        value === "Y" ? <Tag color={theme.colors.primary}>✓</Tag> : null,
    },
    {
      title: labels("terminalFlag"),
      dataIndex: "terminal_flag",
      width: 100,
      render: (value: string) => (value === "Y" ? <Tag>✓</Tag> : null),
    },
    {
      title: labels("slaPause"),
      dataIndex: "sla_pause_flag",
      width: 160,
      render: (value: string) =>
        value === "Y" ? (
          <Tag color={theme.colors.warningDark}>⏸</Tag>
        ) : null,
    },
    { title: labels("tickets"), dataIndex: "tickets", width: 100 },
  ];

  const transitionColumns: ColumnProps<any>[] = [
    { title: labels("fromStatus"), dataIndex: "from_name", width: 190 },
    { title: labels("toStatus"), dataIndex: "to_name", width: 190 },
    {
      title: labels("actor"),
      dataIndex: "actor",
      width: 150,
      render: (value: string) =>
        ({
          S: labels("staffUser"),
          C: labels("clientUser"),
          B: labels("viewAll"),
        } as any)[value] || value,
    },
    {
      title: labels("clientTicketOnly"),
      dataIndex: "client_ticket_only_flag",
      width: 170,
      render: (value: string) => (value === "Y" ? <Tag>✓</Tag> : null),
    },
  ];

  const fieldColumns: ColumnProps<any>[] = [
    { title: labels("status"), dataIndex: "status_code", width: 80 },
    { title: labels("fieldCode"), dataIndex: "field_code", width: 190 },
    { title: labels("label"), dataIndex: "label_p" },
    {
      title: labels("inputType"),
      dataIndex: "input_type",
      width: 110,
      render: (value: string) => (value === "L" ? "list" : "text"),
    },
    {
      title: labels("clientVisible"),
      dataIndex: "client_visible_flag",
      width: 140,
      render: (value: string) => (value === "Y" ? <Tag>✓</Tag> : null),
    },
  ];

  const typeColumns: ColumnProps<any>[] = [
    { title: "#", dataIndex: "type_code", width: 50 },
    { title: labels("type"), dataIndex: "type_name" },
    {
      title: labels("internalOnly"),
      dataIndex: "internal_only_flag",
      width: 130,
      render: (value: string) => (value === "Y" ? <Tag>✓</Tag> : null),
    },
    {
      title: labels("clientAllowed"),
      dataIndex: "client_allowed_flag",
      width: 140,
      render: (value: string) =>
        value === "Y" ? <Tag color={theme.colors.primary}>✓</Tag> : null,
    },
    {
      title: labels("aiAllowed"),
      dataIndex: "ai_allowed_flag",
      width: 130,
      render: (value: string) => (value === "Y" ? <Tag>✓</Tag> : null),
    },
  ];

  const causeColumns: ColumnProps<any>[] = [
    { title: labels("nameEn"), dataIndex: "description_p" },
    { title: labels("nameAr"), dataIndex: "description_s" },
    { title: labels("tickets"), dataIndex: "tickets", width: 100 },
    {
      title: labels("active"),
      dataIndex: "active_flag",
      width: 100,
      render: (value: string) =>
        value === "Y" ? null : <Tag>{labels("inactive")}</Tag>,
    },
  ];

  const replyColumns: ColumnProps<any>[] = [
    { title: labels("title"), dataIndex: "title", width: 240 },
    {
      title: labels("body"),
      dataIndex: "body",
      render: (value: string) =>
        value && value.length > 90 ? `${value.slice(0, 90)}…` : value,
    },
    { title: labels("team"), dataIndex: "team_name", width: 160 },
  ];

  return (
    <>
      <Flex margin="0 0 12px">
        <PageTitle>{labels("setupWorkflow")}</PageTitle>
      </Flex>

      <ShadowSection>
        <Tabs defaultActiveKey="statuses">
          <Tabs.TabPane tab={labels("statuses")} key="statuses">
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 10 }}
              message={labels("lockedField")}
            />
            <SetupGrid
              rows={payload.statuses}
              columns={statusColumns}
              rowKey="status_code"
              loading={loading}
              apiId="statusDml"
              identity={["status_code"]}
              onDone={reload}
              fields={[
                { name: "description_p", label: labels("nameEn"), type: "text", max: 30 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 30 },
                { name: "sla_pause_flag", label: labels("slaPause"), type: "switch" },
                { name: "display_order", label: labels("displayOrder"), type: "number" },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("transitions")} key="transitions">
            <SetupGrid
              rows={payload.transitions}
              columns={transitionColumns}
              rowKey="from_status"
              loading={loading}
              apiId="statusNextDml"
              canAdd
              canDelete
              onDone={reload}
              note="A status with no way out would strand its tickets, so the last move cannot be removed."
              newDefaults={{ actor: "S", client_ticket_only_flag: "N" }}
              fields={[
                {
                  name: "from_status",
                  label: labels("fromStatus"),
                  type: "select",
                  options: statusOptions,
                  keyField: true,
                  required: true,
                },
                {
                  name: "to_status",
                  label: labels("toStatus"),
                  type: "select",
                  options: statusOptions,
                  keyField: true,
                  required: true,
                },
                {
                  name: "actor",
                  label: labels("actor"),
                  type: "select",
                  required: true,
                  options: [
                    { key: "S", value: labels("staffUser") },
                    { key: "C", value: labels("clientUser") },
                    { key: "B", value: labels("viewAll") },
                  ],
                },
                {
                  name: "client_ticket_only_flag",
                  label: labels("clientTicketOnly"),
                  type: "switch",
                },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("mandatoryFields")} key="fields">
            <SetupGrid
              rows={payload.status_fields}
              columns={fieldColumns}
              rowKey="field_code"
              loading={loading}
              apiId="statusFieldDml"
              canAdd
              canDelete
              onDone={reload}
              newDefaults={{ input_type: "T", client_visible_flag: "N", display_order: 1 }}
              fields={[
                {
                  name: "status_code",
                  label: labels("status"),
                  type: "select",
                  options: statusOptions,
                  keyField: true,
                  required: true,
                },
                {
                  name: "field_code",
                  label: labels("fieldCode"),
                  type: "select",
                  options: payload.known_fields,
                  keyField: true,
                  required: true,
                },
                { name: "label_p", label: labels("nameEn"), type: "text", max: 60 },
                { name: "label_s", label: labels("nameAr"), type: "text", max: 60 },
                {
                  name: "input_type",
                  label: labels("inputType"),
                  type: "select",
                  options: [
                    { key: "T", value: "text" },
                    { key: "L", value: "list" },
                  ],
                },
                { name: "client_visible_flag", label: labels("clientVisible"), type: "switch" },
                { name: "display_order", label: labels("displayOrder"), type: "number" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("ticketTypes")} key="types">
            <SetupGrid
              rows={payload.ticket_types}
              columns={typeColumns}
              rowKey="type_code"
              loading={loading}
              apiId="ticketTypeDml"
              canAdd
              onDone={reload}
              newDefaults={{
                internal_only_flag: "N",
                client_allowed_flag: "Y",
                ai_allowed_flag: "Y",
                active_flag: "Y",
              }}
              fields={[
                {
                  name: "type_code",
                  label: labels("type"),
                  type: "text",
                  max: 1,
                  upper: true,
                  keyField: true,
                  required: true,
                },
                { name: "description_p", label: labels("nameEn"), type: "text", max: 30 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 30 },
                { name: "internal_only_flag", label: labels("internalOnly"), type: "switch" },
                { name: "client_allowed_flag", label: labels("clientAllowed"), type: "switch" },
                { name: "ai_allowed_flag", label: labels("aiAllowed"), type: "switch" },
                { name: "display_order", label: labels("displayOrder"), type: "number" },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("rootCauses")} key="causes">
            <SetupGrid
              rows={payload.root_causes}
              columns={causeColumns}
              rowKey="root_cause_id"
              loading={loading}
              apiId="rootCauseDml"
              canAdd
              identity={["root_cause_id"]}
              onDone={reload}
              newDefaults={{ active_flag: "Y" }}
              fields={[
                { name: "description_p", label: labels("nameEn"), type: "text", max: 80 },
                { name: "description_s", label: labels("nameAr"), type: "text", max: 80 },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={labels("cannedReplies")} key="replies">
            <SetupGrid
              rows={payload.canned_replies}
              columns={replyColumns}
              rowKey="reply_id"
              loading={loading}
              apiId="cannedReplyDml"
              canAdd
              canDelete
              identity={["reply_id"]}
              onDone={reload}
              newDefaults={{ active_flag: "Y" }}
              fields={[
                { name: "title", label: labels("title"), type: "text", max: 100 },
                { name: "body", label: labels("body"), type: "textarea" },
                {
                  name: "team_id",
                  label: labels("team"),
                  type: "select",
                  options: lookups.teams.map((team) => ({
                    key: Number(team.key),
                    value: team.value,
                  })),
                },
                { name: "active_flag", label: labels("active"), type: "switch" },
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </ShadowSection>
    </>
  );
};

export default WorkflowSetupPage;
