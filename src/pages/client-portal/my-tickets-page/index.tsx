/*
 * Client portal: my tickets.
 * Same tickets_data service; the server decides whether this user sees the
 * whole group (CLA) or one branch (CLU), so the screen sends no filter for it.
 */
import React, { useCallback, useState } from "react";
import { Button, Icon, Tabs, Tooltip } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useHistory } from "react-router-dom";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import ExsysTable from "../../../components/exsys-table";
import { SlaTag, StatusTag } from "../../../components/ticket-bits";
import { useBasicQuery, useContractStatus } from "../../../hooks";
import { useLabels } from "../../../labels";
import { PAGES_PATH_NAMES, ticketPath } from "../../../routes/constants";

const PAGE_SIZE = 25;

const ClientMyTicketsPage = () => {
  const labels = useLabels();
  const history = useHistory();
  const [view, setView] = useState("open");
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const { status: contract } = useContractStatus();
  // the screen only greys the button out; the database refuses the ticket
  // itself with -20814, so this is comfort, not security
  const canOpen = contract.can_open_ticket_flag !== "N";

  const { loading, runQuery } = useBasicQuery({
    apiId: "tickets",
    params: { view: "open", poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const load = useCallback(
    (nextView: string, nextOffset: number) => {
      setView(nextView);
      setOffset(nextOffset);
      runQuery({
        view: nextView,
        poffset: nextOffset,
        poffset_step: PAGE_SIZE,
      });
    },
    [runQuery],
  );

  const columns: ColumnProps<any>[] = [
    { title: labels("ticketNo"), dataIndex: "ticket_id", width: 90 },
    { title: labels("title"), dataIndex: "title" },
    { title: labels("module"), dataIndex: "module_name", width: 130 },
    { title: labels("branch"), dataIndex: "branch_name", width: 140 },
    {
      title: labels("status"),
      dataIndex: "status_name",
      width: 130,
      render: (value: string, record: any) => (
        <StatusTag statusName={value} openFlag={record.open_flag} />
      ),
    },
    {
      title: labels("sla"),
      dataIndex: "sla_state",
      width: 95,
      render: (value: string) => <SlaTag slaState={value} />,
    },
    { title: labels("submittedDate"), dataIndex: "submitted_date", width: 150 },
  ];

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px">
        <PageTitle>{labels("myTickets")}</PageTitle>
        <Tooltip title={canOpen ? "" : contract.message || ""}>
          <Button
            type="primary"
            disabled={!canOpen}
            onClick={() => history.push(PAGES_PATH_NAMES.clientNewTicket)}
          >
            <Icon type="plus" /> {labels("newTicket")}
          </Button>
        </Tooltip>
      </Flex>

      <ShadowSection>
        <Tabs activeKey={view} onChange={(next) => load(next, 0)}>
          <Tabs.TabPane tab={labels("viewOpen")} key="open" />
          <Tabs.TabPane tab={labels("viewClosed")} key="closed" />
          <Tabs.TabPane tab={labels("viewAll")} key="all" />
        </Tabs>

        <ExsysTable
          rowKey="ticket_id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          offset={offset}
          pageSize={PAGE_SIZE}
          onPageChange={(nextOffset) => load(view, nextOffset)}
          onRowClick={(record) =>
            history.push(ticketPath(record.ticket_id, true))
          }
          scrollX={1000}
        />
      </ShadowSection>
    </>
  );
};

export default ClientMyTicketsPage;
