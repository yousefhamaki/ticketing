/*
 * The requests list with the two decisions.
 *
 * GET  etk_user_request_pkg/user_requests_data
 * POST etk_user_request_pkg/user_request_action_dml   action: approve | reject
 *
 * approve : management confirms the user name and types a ONE-TIME password.
 *           The service creates the client user on the client (and branch) of
 *           the request and forces a password change on first sign-in.
 * reject  : the reason is mandatory, the client manager reads it.
 */
import React, { useCallback, useState } from "react";
import { Icon, Input, Modal, Select, Tag, Tooltip, message } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { Flex, FieldLabel, FieldValue } from "../../../../components/commons";
import ExsysTable from "../../../../components/exsys-table";
import {
  useBasicMutation,
  useBasicQuery,
  useRequestRights,
} from "../../../../hooks";
import { useLabels } from "../../../../labels";
import { UserRequestRowType } from "../index.interface";

const PAGE_SIZE = 25;

interface DecisionType {
  row: UserRequestRowType;
  action: "approve" | "reject";
  user_name: string;
  password: string;
  reject_reason: string;
}

const RequestsView = () => {
  const labels = useLabels();
  const theme = useTheme();
  const { reload: reloadRights } = useRequestRights();

  const [rows, setRows] = useState<UserRequestRowType[]>([]);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<{ status?: string; search: string }>({
    status: "P",
    search: "",
  });
  const [decision, setDecision] = useState<DecisionType | null>(null);

  const { loading, runQuery } = useBasicQuery({
    apiId: "userRequests",
    params: { status: "P", poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      if (error) {
        message.error(error);
      }
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const { loading: saving, mutate: decide } = useBasicMutation({
    apiId: "userRequestActionDml",
  });

  const load = useCallback(
    (nextOffset: number, nextFilters = filters) => {
      setOffset(nextOffset);
      setFilters(nextFilters);
      runQuery({
        status: nextFilters.status,
        search: nextFilters.search,
        poffset: nextOffset,
        poffset_step: PAGE_SIZE,
      });
    },
    [runQuery, filters],
  );

  const onDecide = useCallback(async () => {
    if (!decision) {
      return;
    }

    const { error } = await decide(
      decision.action === "approve"
        ? {
            request_id: decision.row.request_id,
            action: "approve",
            user_name: decision.user_name,
            password: decision.password,
          }
        : {
            request_id: decision.row.request_id,
            action: "reject",
            reject_reason: decision.reject_reason,
          },
    );

    if (error) {
      message.error(error);
      return;
    }

    message.success(labels("saved"));
    setDecision(null);
    load(offset);
    // the badge in the menu counts the waiting requests
    reloadRights();
  }, [decision, decide, labels, load, offset, reloadRights]);

  const openDecision = (
    row: UserRequestRowType,
    action: "approve" | "reject",
  ) =>
    setDecision({
      row,
      action,
      user_name: row.user_name || "",
      password: "",
      reject_reason: "",
    });

  const statusColor = (value: string) =>
    value === "A"
      ? theme.colors.success
      : value === "R"
      ? theme.colors.error
      : value === "P"
      ? theme.colors.warningDark
      : undefined;

  const columns: ColumnProps<UserRequestRowType>[] = [
    { title: labels("client"), dataIndex: "client_name", width: 180 },
    { title: labels("fullName"), dataIndex: "full_name", width: 180 },
    { title: labels("userName"), dataIndex: "user_name", width: 140 },
    { title: labels("jobTitle"), dataIndex: "job_title", width: 140 },
    {
      title: labels("branch"),
      dataIndex: "branch_name",
      width: 150,
      render: (value?: string) => value || labels("allBranches"),
    },
    { title: labels("email"), dataIndex: "email", width: 180 },
    { title: labels("mobile"), dataIndex: "mobile", width: 120 },
    { title: labels("requestedBy"), dataIndex: "requested_by_name", width: 160 },
    { title: labels("requestDate"), dataIndex: "request_date", width: 140 },
    {
      title: labels("status"),
      dataIndex: "status",
      width: 130,
      render: (value: string, record) => (
        <Tag color={statusColor(value)}>{record.status_name}</Tag>
      ),
    },
    { title: labels("decidedBy"), dataIndex: "decided_by_name", width: 160 },
    { title: labels("decisionDate"), dataIndex: "decision_date", width: 140 },
    {
      title: labels("createdUser"),
      dataIndex: "created_user_name",
      width: 140,
    },
    { title: labels("rejectReason"), dataIndex: "reject_reason", width: 220 },
    { title: labels("notes"), dataIndex: "notes", width: 220 },
    {
      title: "",
      dataIndex: "request_id",
      width: 90,
      fixed: "right",
      render: (_value: number, record) =>
        record.status === "P" ? (
          <Flex gap={14}>
            <Tooltip title={labels("approve")}>
              <Icon
                type="check-circle"
                style={{ color: theme.colors.success }}
                onClick={() => openDecision(record, "approve")}
              />
            </Tooltip>
            <Tooltip title={labels("reject")}>
              <Icon
                type="close-circle"
                style={{ color: theme.colors.error }}
                onClick={() => openDecision(record, "reject")}
              />
            </Tooltip>
          </Flex>
        ) : null,
    },
  ];

  const isApprove = !!decision && decision.action === "approve";

  return (
    <>
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
          placeholder={labels("reqAll")}
          value={filters.status}
          onChange={(value?: string) => load(0, { ...filters, status: value })}
        >
          <Select.Option value="P">{labels("reqWaiting")}</Select.Option>
          <Select.Option value="A">{labels("reqApproved")}</Select.Option>
          <Select.Option value="R">{labels("reqRefused")}</Select.Option>
          <Select.Option value="C">{labels("reqCancelled")}</Select.Option>
        </Select>
      </Flex>

      <ExsysTable
        rowKey="request_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        offset={offset}
        pageSize={PAGE_SIZE}
        onPageChange={(next) => load(next)}
        scrollX={2500}
      />

      <Modal
        visible={!!decision}
        title={isApprove ? labels("approveRequest") : labels("rejectRequest")}
        confirmLoading={saving}
        okText={isApprove ? labels("approve") : labels("reject")}
        okType={isApprove ? "primary" : "danger"}
        cancelText={labels("cancel")}
        onCancel={() => setDecision(null)}
        onOk={onDecide}
      >
        {decision ? (
          <Flex column align="stretch" gap={10}>
            <div>
              <FieldLabel>{labels("client")}</FieldLabel>
              <FieldValue>
                {decision.row.client_name}
                {" - "}
                {decision.row.branch_name || labels("allBranches")}
              </FieldValue>
            </div>
            <div>
              <FieldLabel>{labels("fullName")}</FieldLabel>
              <FieldValue>{decision.row.full_name}</FieldValue>
            </div>

            {isApprove ? (
              <>
                <Input
                  placeholder={labels("userName")}
                  maxLength={30}
                  value={decision.user_name}
                  onChange={(event) =>
                    setDecision({
                      ...decision,
                      user_name: event.target.value.toUpperCase(),
                    })
                  }
                />
                <Input.Password
                  placeholder={labels("initialPassword")}
                  value={decision.password}
                  onChange={(event) =>
                    setDecision({ ...decision, password: event.target.value })
                  }
                />
                <span style={{ opacity: 0.7, fontSize: 12 }}>
                  {labels("passwordWillBeOneTime")}
                </span>
              </>
            ) : (
              <Input.TextArea
                rows={3}
                maxLength={500}
                placeholder={labels("rejectReason")}
                value={decision.reject_reason}
                onChange={(event) =>
                  setDecision({ ...decision, reject_reason: event.target.value })
                }
              />
            )}
          </Flex>
        ) : null}
      </Modal>
    </>
  );
};

export default RequestsView;
