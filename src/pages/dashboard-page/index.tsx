/*
 * The board (phase 1).
 *
 * GET etk_stats_pkg/dashboard_data?scope=me|team&from_date=..&to_date=..
 *
 * One call fills the whole screen: the KPI tiles, three breakdowns, the daily
 * trend and - for a team - the members table. The server decides what a scope
 * is allowed to mean, so the screen only asks.
 *
 * Phase 2 adds scope "company" with the client comparison, phase 3 the
 * client's own board. Both arrive as a new scope on this same screen.
 */
import React, { useCallback, useMemo, useState } from "react";
import { DatePicker, Radio, Spin, Tag } from "antd";
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
import { useBasicQuery } from "../../hooks";
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
  const [payload, setPayload] = useState<PayloadType>(EMPTY);
  const [scope, setScope] = useState("me");
  const [period, setPeriod] = useState("30");
  const [range, setRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(29, "days"),
    moment(),
  ]);

  const { loading, runQuery } = useBasicQuery<PayloadType>({
    apiId: "dashboard",
    params: { scope: "me" },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setPayload(!error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY);
    },
  });

  const load = useCallback(
    (nextScope: string, from: moment.Moment, to: moment.Moment) => {
      runQuery({
        scope: nextScope,
        from_date: from.format(DATE_FORMAT),
        to_date: to.format(DATE_FORMAT),
      });
    },
    [runQuery],
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

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px" wrap gap={10}>
        <div>
          <PageTitle>{labels("home")}</PageTitle>
          <SubText>
            {user ? `${user.full_name} · ${user.team_name || user.role}` : ""}
          </SubText>
        </div>

        <Flex gap={10} wrap>
          {canSeeTeam ? (
            <Radio.Group
              value={scope}
              buttonStyle="solid"
              onChange={(event) => onScope(event.target.value)}
            >
              <Radio.Button value="me">{labels("viewMine")}</Radio.Button>
              <Radio.Button value="team">{labels("team")}</Radio.Button>
            </Radio.Group>
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
