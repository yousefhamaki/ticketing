/*
 * Notifications.
 * GET  etk_escalation_pkg/notifications_data   (unread count on every row)
 * POST etk_escalation_pkg/notification_dml     - one id marks one as read,
 *                                                no id marks them all.
 */
import React, { useCallback, useState } from "react";
import { Button, Icon, Tag, message as antMessage } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useHistory } from "react-router-dom";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../components/commons";
import ExsysTable from "../../components/exsys-table";
import { useBasicMutation, useBasicQuery } from "../../hooks";
import { useLabels } from "../../labels";
import { ticketPath } from "../../routes/constants";

const PAGE_SIZE = 25;

/* notification type code -> label key (ETK_NOTIFICATION.NOTIF_TYPE) */
const NOTIF_TYPES: { [code: string]: string } = {
  NEW: "ntNew",
  ESCALATE: "ntEscalate",
  ASSIGN: "ntAssign",
  TRANSFER: "ntTransfer",
  REPLY: "ntReply",
  REJECT: "ntReject",
  CONTRACT: "ntContract",
  CONTRACT_W: "ntContractWarn",
  CONTRACT_B: "ntContractStop",
  USERREQ: "ntUserRequest",
  USERREQ_A: "ntUserRequestOk",
  USERREQ_R: "ntUserRequestNo",
};

const notifTypeName = (labels: (key: string) => string, code: string) =>
  NOTIF_TYPES[code] ? labels(NOTIF_TYPES[code]) : code;

const NotificationsPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const history = useHistory();
  const [rows, setRows] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);

  const { loading, runQuery } = useBasicQuery({
    apiId: "notifications",
    params: { poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const { mutate: markRead } = useBasicMutation({ apiId: "notificationDml" });

  const load = useCallback(
    (nextOffset: number) => {
      setOffset(nextOffset);
      runQuery({ poffset: nextOffset, poffset_step: PAGE_SIZE });
    },
    [runQuery],
  );

  const onMarkAll = useCallback(async () => {
    const { error } = await markRead({ record_status: "u" });
    if (error) {
      antMessage.error(error);
      return;
    }
    load(0);
  }, [markRead, load]);

  const columns: ColumnProps<any>[] = [
    {
      title: "",
      dataIndex: "read_flag",
      width: 40,
      render: (value: string) =>
        value === "N" ? (
          <Icon type="bell" style={{ color: theme.colors.primary }} />
        ) : null,
    },
    { title: labels("title"), dataIndex: "title" },
    {
      title: labels("type"),
      dataIndex: "notif_type",
      width: 130,
      // 23-11-2026 OLD: the raw code (ASSIGN, TRANSFER, CONTRACT_B ...)  NEW: words
      render: (value: string) => <Tag>{notifTypeName(labels, value)}</Tag>,
    },
    { title: labels("ticketNo"), dataIndex: "ticket_id", width: 100 },
    { title: labels("date"), dataIndex: "notif_date", width: 150 },
  ];

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px">
        <PageTitle>{labels("notifications")}</PageTitle>
        <Button onClick={onMarkAll}>
          <Icon type="check" /> {labels("markAllRead")}
        </Button>
      </Flex>
      <ShadowSection>
        <ExsysTable
          rowKey="notification_id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          offset={offset}
          pageSize={PAGE_SIZE}
          onPageChange={load}
          onRowClick={async (record) => {
            if (record.read_flag === "N") {
              await markRead({
                record_status: "u",
                notification_id: record.notification_id,
              });
            }
            if (record.ticket_id) {
              history.push(ticketPath(record.ticket_id));
            }
          }}
        />
      </ShadowSection>
    </>
  );
};

export default NotificationsPage;
