/*
 * Escalation.
 * GET etk_escalation_pkg/escalation_data - the tickets nobody accepted yet,
 * their escalation level and the minutes left before the next step.
 * The job that moves them runs every minute in the database, so the screen
 * just refreshes on the same beat.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useHistory } from "react-router-dom";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../components/commons";
import ExsysTable from "../../components/exsys-table";
import { useBasicQuery } from "../../hooks";
import { useLabels } from "../../labels";
import { usePriorityName } from "../../components/ticket-bits";
import { ticketPath } from "../../routes/constants";

const PAGE_SIZE = 25;

const EscalationPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const history = useHistory();
  const priorityName = usePriorityName();
  const [rows, setRows] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);

  const { loading, runQuery } = useBasicQuery({
    apiId: "escalation",
    params: { poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const load = useCallback(
    (nextOffset: number) => {
      setOffset(nextOffset);
      runQuery({ poffset: nextOffset, poffset_step: PAGE_SIZE });
    },
    [runQuery],
  );

  useEffect(() => {
    const timer = window.setInterval(() => runQuery(), 60000);
    return () => window.clearInterval(timer);
  }, [runQuery]);

  const columns: ColumnProps<any>[] = [
    { title: labels("ticketNo"), dataIndex: "ticket_id", width: 90 },
    { title: labels("title"), dataIndex: "title" },
    { title: labels("client"), dataIndex: "client_name", width: 170 },
    // 23-11-2026 OLD: the priority number  NEW: its name
    {
      title: labels("priority"),
      dataIndex: "company_priority",
      width: 110,
      render: (value: number) => priorityName(value),
    },
    { title: labels("escLevel"), dataIndex: "esc_level_name", width: 150 },
    { title: labels("team"), dataIndex: "team_name", width: 150 },
    { title: labels("oncall"), dataIndex: "oncall_name", width: 150 },
    {
      title: labels("minutesLeft"),
      dataIndex: "minutes_left",
      width: 110,
      render: (value: number) =>
        value === null || value === undefined ? null : (
          <Tag color={value <= 0 ? theme.colors.error : theme.colors.warningDark}>
            {value}
          </Tag>
        ),
    },
    { title: labels("submittedDate"), dataIndex: "submitted_date", width: 150 },
  ];

  return (
    <>
      <Flex margin="0 0 12px">
        <PageTitle>{labels("escalation")}</PageTitle>
      </Flex>
      <ShadowSection>
        <ExsysTable
          rowKey="ticket_id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          offset={offset}
          pageSize={PAGE_SIZE}
          onPageChange={load}
          onRowClick={(record) => history.push(ticketPath(record.ticket_id))}
          scrollX={1200}
        />
      </ShadowSection>
    </>
  );
};

export default EscalationPage;
