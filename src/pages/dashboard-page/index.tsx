/*
 * The board (phase 1).
 *
 * GET etk_stats_pkg/dashboard_data?scope=me|team&from_date=..&to_date=..
 *
 * One call fills the whole screen: the KPI tiles, three breakdowns, the daily
 * trend and - for a team - the members table. The server decides what a scope
 * is allowed to mean, so the screen only asks.
 *
 * 23-11-2026 NEW: scope "company" for management (script ETKT_12):
 *   OLD    : management had "mine / team" only; a manager with no team saw zeros.
 *   NEW    : "company" = every ticket, or one team when a team is chosen,
 *            with a teams table and the clients with the most tickets.
 *            Management opens the board on "company".
 *   REASON : the owner's first screen was empty (review of 23-11-2026).
 * Phase 3 adds the client's own board as another scope on this same screen.
 */
import React, { useCallback, useMemo, useState } from "react";
import { DatePicker, Radio, Select, Spin, Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import { useTheme } from "styled-components";
import {
  Flex,
  PageTitle,
  ShadowSection,
  StatBox,
  StatValue,
  SubText,
} from "../../components/commons";
import ExsysTable from "../../components/exsys-table";
import { useBasicQuery, useLookups } from "../../hooks";
import { isManagement, isSupervisor, useAppConfig } from "../../store";
import { useLabels } from "../../labels";
import ChartsView from "./partials/ChartsView";

const DATE_FORMAT = "YYYY-MM-DD";

interface KpiType {
  code: string;
  label: string;
  value: number;
  kind: string;
}

interface PayloadType {
  scope: string;
  from_date: string;
  to_date: string;
  team_id?: number;
  is_supervisor: string;
  kpis: KpiType[];
  by_status: any[];
  by_priority: any[];
  by_module: any[];
  trend: any[];
  members: any[];
  teams: any[];
  clients: any[];
}

const EMPTY: PayloadType = {
  scope: "me",
  from_date: "",
  to_date: "",
  is_supervisor: "N",
  kpis: [],
  by_status: [],
  by_priority: [],
  by_module: [],
  trend: [],
  members: [],
  teams: [],
  clients: [],
};

/* the periods a daily board actually gets asked for */
const PERIODS = [
  { key: "7", days: 6 },
  { key: "30", days: 29 },
  { key: "90", days: 89 },
  { key: "365", days: 364 },
];

const DashboardPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const { user } = useAppConfig();
  const { lookups } = useLookups();
  const management = !!user && isManagement(user);
  const firstScope = management ? "company" : "me";
  const [payload, setPayload] = useState<PayloadType>(EMPTY);
  const [scope, setScope] = useState(firstScope);
  const [teamId, setTeamId] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState("30");
  const [range, setRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(29, "days"),
    moment(),
  ]);

  const { loading, runQuery } = useBasicQuery<PayloadType>({
    apiId: "dashboard",
    params: { scope: firstScope },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setPayload(!error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY);
    },
  });

  const load = useCallback(
    (
      nextScope: string,
      from: moment.Moment,
      to: moment.Moment,
      nextTeam: number | undefined = teamId,
    ) => {
      runQuery({
        scope: nextScope,
        from_date: from.format(DATE_FORMAT),
        to_date: to.format(DATE_FORMAT),
        team_id: nextScope === "company" ? nextTeam : undefined,
      });
    },
    [runQuery, teamId],
  );

  const onPeriod = useCallback(
    (key: string) => {
      setPeriod(key);
      const found = PERIODS.find((item) => item.key === key);
      if (!found) {
        return;
      }
      const next: [moment.Moment, moment.Moment] = [
        moment().subtract(found.days, "days"),
        moment(),
      ];
      setRange(next);
      load(scope, next[0], next[1]);
    },
    [scope, load],
  );

  const onScope = useCallback(
    (next: string) => {
      setScope(next);
      load(next, range[0], range[1]);
    },
    [range, load],
  );

  /* the server says how to format; the screen never does the maths */
  const showValue = (kpi: KpiType) => {
    if (kpi.kind === "pct") {
      return `${kpi.value}%`;
    }
    if (kpi.kind === "hours") {
      return `${kpi.value} ${labels("hoursShort")}`;
    }
    return kpi.value;
  };

  const kpiColor = (kpi: KpiType) => {
    if (kpi.code === "breached" && kpi.value > 0) {
      return theme.colors.error;
    }
    if (kpi.code === "unaccepted" && kpi.value > 0) {
      return theme.colors.warningDark;
    }
    if (
      (kpi.code === "accept_pct" || kpi.code === "resolve_pct") &&
      kpi.value > 0
    ) {
      return kpi.value >= 90 ? theme.colors.success : theme.colors.warningDark;
    }
    return undefined;
  };

  const canSeeTeam = useMemo(
    () => !!user && (!!user.team_id || isSupervisor(user) || isManagement(user)),
    [user],
  );

  const memberColumns: ColumnProps<any>[] = [
    { title: labels("fullName"), dataIndex: "user_name" },
    { title: labels("team"), dataIndex: "team_name", width: 170 },
    { title: labels("tickets"), dataIndex: "tickets", width: 100 },
    { title: labels("viewOpen"), dataIndex: "open_now", width: 110 },
    { title: labels("resolvedLabel"), dataIndex: "resolved", width: 110 },
    {
      title: labels("slaLate"),
      dataIndex: "late",
      width: 100,
      render: (value: number) =>
        value > 0 ? <Tag color={theme.colors.error}>{value}</Tag> : value,
    },
    { title: labels("avgResolve"), dataIndex: "avg_hours", width: 130 },
    { title: labels("rating"), dataIndex: "avg_rating", width: 110 },
  ];

  const lateTag = (value: number) =>
    value > 0 ? <Tag color={theme.colors.error}>{value}</Tag> : value;

  const teamColumns: ColumnProps<any>[] = [
    { title: labels("team"), dataIndex: "team_name" },
    { title: labels("members"), dataIndex: "members", width: 100 },
    { title: labels("tickets"), dataIndex: "tickets", width: 100 },
    { title: labels("viewOpen"), dataIndex: "open_now", width: 110 },
    { title: labels("viewUnaccepted"), dataIndex: "unaccepted", width: 130 },
    { title: labels("resolvedLabel"), dataIndex: "resolved", width: 110 },
    { title: labels("slaLate"), dataIndex: "late", width: 100, render: lateTag },
    { title: labels("avgResolve"), dataIndex: "avg_hours", width: 130 },
    { title: labels("rating"), dataIndex: "avg_rating", width: 110 },
  ];

  const clientColumns: ColumnProps<any>[] = [
    { title: labels("client"), dataIndex: "client_name" },
    { title: labels("tickets"), dataIndex: "tickets", width: 100 },
    { title: labels("viewOpen"), dataIndex: "open_now", width: 110 },
    { title: labels("slaLate"), dataIndex: "late", width: 100, render: lateTag },
    { title: labels("viewAngry"), dataIndex: "angry", width: 130, render: lateTag },
    { title: labels("rating"), dataIndex: "avg_rating", width: 110 },
  ];

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px" wrap gap={10}>
        <div>
          <PageTitle>{labels("home")}</PageTitle>
          <SubText>
            {/* OLD: team_name || user.role  -> showed "MGT" for management
                NEW: team_name, else "Management" for management users
                REASON: a role code is not text for people (owner saw "MGT") */}
            {user
              ? `${user.full_name} · ${
                  user.team_name ||
                  (user.management_flag === "Y" ? labels("managementRole") : "")
                }`
              : ""}
          </SubText>
        </div>

        <Flex gap={10} wrap>
          {canSeeTeam ? (
            <Radio.Group
              value={scope}
              buttonStyle="solid"
              onChange={(event) => onScope(event.target.value)}
            >
              {management ? (
                <Radio.Button value="company">{labels("companyScope")}</Radio.Button>
              ) : null}
              <Radio.Button value="me">{labels("viewMine")}</Radio.Button>
              {!management || (user && user.team_id) ? (
                <Radio.Button value="team">{labels("team")}</Radio.Button>
              ) : null}
            </Radio.Group>
          ) : null}

          {management && scope === "company" ? (
            <Select
              allowClear
              style={{ width: 180 }}
              placeholder={labels("allTeams")}
              value={teamId}
              onChange={(value?: number) => {
                const next = value ? Number(value) : undefined;
                setTeamId(next);
                load(scope, range[0], range[1], next);
              }}
            >
              {lookups.teams.map((item) => (
                <Select.Option key={item.key} value={Number(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          ) : null}

          <Radio.Group
            value={period}
            onChange={(event) => onPeriod(event.target.value)}
          >
            {PERIODS.map((item) => (
              <Radio.Button key={item.key} value={item.key}>
                {item.key} {labels("daysShort")}
              </Radio.Button>
            ))}
          </Radio.Group>

          <DatePicker.RangePicker
            format={DATE_FORMAT}
            value={range}
            onChange={(dates) => {
              if (dates && dates.length === 2) {
                const next: [moment.Moment, moment.Moment] = [
                  dates[0] as moment.Moment,
                  dates[1] as moment.Moment,
                ];
                setRange(next);
                setPeriod("");
                load(scope, next[0], next[1]);
              }
            }}
          />
        </Flex>
      </Flex>

      <ShadowSection>
        {loading ? <Spin /> : null}

        <Flex gap={12} wrap align="stretch">
          {payload.kpis.map((kpi) => (
            <StatBox key={kpi.code}>
              <SubText>{kpi.label}</SubText>
              <StatValue style={{ color: kpiColor(kpi) }}>
                {showValue(kpi)}
              </StatValue>
            </StatBox>
          ))}
        </Flex>
      </ShadowSection>

      <ChartsView
        byStatus={payload.by_status}
        byPriority={payload.by_priority}
        byModule={payload.by_module}
        trend={payload.trend}
      />

      {scope === "company" && payload.teams.length ? (
        <ShadowSection style={{ marginTop: 12 }}>
          <SubText>{labels("teams")}</SubText>
          <ExsysTable
            rowKey="team_id"
            columns={teamColumns}
            dataSource={payload.teams}
            scrollX
          />
        </ShadowSection>
      ) : null}

      {scope === "company" && payload.clients.length ? (
        <ShadowSection style={{ marginTop: 12 }}>
          <SubText>{labels("topClients")}</SubText>
          <ExsysTable
            rowKey="client_id"
            columns={clientColumns}
            dataSource={payload.clients}
            scrollX
          />
        </ShadowSection>
      ) : null}

      {scope === "team" && payload.members.length ? (
        <ShadowSection style={{ marginTop: 12 }}>
          <SubText>{labels("members")}</SubText>
          <ExsysTable
            rowKey="user_id"
            columns={memberColumns}
            dataSource={payload.members}
            scrollX
          />
        </ShadowSection>
      ) : null}
    </>
  );
};

export default DashboardPage;
