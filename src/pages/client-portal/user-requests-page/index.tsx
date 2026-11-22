/*
 * Client portal: user requests (the client manager only).
 *
 * A client does not create its own users. The client manager sends a request
 * here and the company management approves or refuses it.
 *
 * GET  etk_user_request_pkg/user_requests_data  - the requests of HIS client
 * POST etk_user_request_pkg/user_request_dml    - n new, u edit, d cancel
 *
 * The server decides who the client manager is (ETK_USER.CLIENT_ADMIN_FLAG);
 * anybody else gets -20812 and this screen just shows the reason.
 * No password is typed here: management sets a one-time password on approval.
 */
import React, { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Icon,
  Input,
  Modal,
  Popconfirm,
  Select,
  Tabs,
  Tag,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { ERROR_CODES } from "../../../api";
import { Flex, PageTitle, ShadowSection } from "../../../components/commons";
import ExsysTable from "../../../components/exsys-table";
import {
  useBasicMutation,
  useBasicQuery,
  useLookups,
  useRequestRights,
} from "../../../hooks";
import { useLabels } from "../../../labels";
import { UserRequestRowType } from "../../settings/user-requests-page/index.interface";

const PAGE_SIZE = 25;

const ClientUserRequestsPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const { lookups } = useLookups();
  const { reload: reloadRights } = useRequestRights();

  const [rows, setRows] = useState<UserRequestRowType[]>([]);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState("P");
  const [notAllowed, setNotAllowed] = useState("");
  const [editing, setEditing] = useState<Partial<UserRequestRowType> | null>(
    null,
  );

  const { loading, runQuery } = useBasicQuery({
    apiId: "userRequests",
    params: { status: "P", poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error, errorCode }) => {
      setNotAllowed(errorCode === ERROR_CODES.NOT_ALLOWED ? error : "");
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const { loading: saving, mutate: saveRequest } = useBasicMutation({
    apiId: "userRequestDml",
  });

  const load = useCallback(
    (nextStatus: string, nextOffset: number) => {
      setStatus(nextStatus);
      setOffset(nextOffset);
      runQuery({
        status: nextStatus === "ALL" ? undefined : nextStatus,
        poffset: nextOffset,
        poffset_step: PAGE_SIZE,
      });
    },
    [runQuery],
  );

  const afterChange = useCallback(() => {
    message.success(labels("saved"));
    setEditing(null);
    load(status, offset);
    reloadRights();
  }, [labels, load, status, offset, reloadRights]);

  const onSave = useCallback(async () => {
    if (!editing) {
      return;
    }

    const { error } = await saveRequest({
      record_status: editing.request_id ? "u" : "n",
      request_id: editing.request_id,
      user_name: editing.user_name,
      full_name_p: editing.full_name_p,
      full_name_s: editing.full_name_s,
      email: editing.email,
      mobile: editing.mobile,
      job_title: editing.job_title,
      branch_id: editing.branch_id,
      language_id: editing.language_id,
      notes: editing.notes,
    });

    if (error) {
      message.error(error);
      return;
    }
    afterChange();
  }, [editing, saveRequest, afterChange]);

  const onCancelRequest = useCallback(
    async (requestId: number) => {
      const { error } = await saveRequest({
        record_status: "d",
        request_id: requestId,
      });

      if (error) {
        message.error(error);
        return;
      }
      afterChange();
    },
    [saveRequest, afterChange],
  );

  const statusColor = (value: string) =>
    value === "A"
      ? theme.colors.success
      : value === "R"
      ? theme.colors.error
      : value === "P"
      ? theme.colors.warningDark
      : undefined;

  const columns: ColumnProps<UserRequestRowType>[] = [
    { title: labels("fullName"), dataIndex: "full_name", width: 190 },
    { title: labels("userName"), dataIndex: "user_name", width: 150 },
    { title: labels("jobTitle"), dataIndex: "job_title", width: 150 },
    {
      title: labels("branch"),
      dataIndex: "branch_name",
      width: 160,
      render: (value?: string) => value || labels("allBranches"),
    },
    {
      title: labels("status"),
      dataIndex: "status",
      width: 130,
      render: (value: string, record) => (
        <Tag color={statusColor(value)}>{record.status_name}</Tag>
      ),
    },
    { title: labels("requestDate"), dataIndex: "request_date", width: 140 },
    { title: labels("decisionDate"), dataIndex: "decision_date", width: 140 },
    {
      title: labels("rejectReason"),
      dataIndex: "reject_reason",
      render: (value?: string) => value || "",
    },
    {
      title: "",
      dataIndex: "request_id",
      width: 90,
      render: (value: number, record) =>
        // a decided request is history: the server refuses a change (-20813)
        record.status === "P" ? (
          <Flex gap={12}>
            <Icon type="edit" onClick={() => setEditing(record)} />
            <Popconfirm
              title={labels("confirmCancelRequest")}
              onConfirm={() => onCancelRequest(value)}
            >
              <Icon type="close-circle" />
            </Popconfirm>
          </Flex>
        ) : null,
    },
  ];

  if (notAllowed) {
    return (
      <>
        <PageTitle>{labels("userRequests")}</PageTitle>
        <Alert
          style={{ marginTop: 12 }}
          type="warning"
          showIcon
          message={notAllowed}
        />
      </>
    );
  }

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px">
        <PageTitle>{labels("userRequests")}</PageTitle>
        <Button
          type="primary"
          onClick={() => setEditing({ language_id: 2 })}
        >
          <Icon type="user-add" /> {labels("newUserRequest")}
        </Button>
      </Flex>

      <ShadowSection>
        <Tabs activeKey={status} onChange={(next) => load(next, 0)}>
          <Tabs.TabPane tab={labels("reqWaiting")} key="P" />
          <Tabs.TabPane tab={labels("reqApproved")} key="A" />
          <Tabs.TabPane tab={labels("reqRefused")} key="R" />
          <Tabs.TabPane tab={labels("reqAll")} key="ALL" />
        </Tabs>

        <ExsysTable
          rowKey="request_id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          offset={offset}
          pageSize={PAGE_SIZE}
          onPageChange={(nextOffset) => load(status, nextOffset)}
          scrollX={1300}
        />
      </ShadowSection>

      <Modal
        visible={!!editing}
        width={680}
        title={labels("newUserRequest")}
        confirmLoading={saving}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditing(null)}
        onOk={onSave}
      >
        {editing ? (
          <Flex column align="stretch" gap={10}>
            <Alert type="info" showIcon message={labels("userRequestHint")} />

            <Flex gap={10}>
              <Input
                placeholder={labels("nameEn")}
                maxLength={100}
                value={editing.full_name_p || ""}
                onChange={(event) =>
                  setEditing({ ...editing, full_name_p: event.target.value })
                }
              />
              <Input
                placeholder={labels("nameAr")}
                maxLength={100}
                value={editing.full_name_s || ""}
                onChange={(event) =>
                  setEditing({ ...editing, full_name_s: event.target.value })
                }
              />
            </Flex>

            <Flex gap={10}>
              <Input
                placeholder={labels("email")}
                maxLength={100}
                value={editing.email || ""}
                onChange={(event) =>
                  setEditing({ ...editing, email: event.target.value })
                }
              />
              <Input
                placeholder={labels("mobile")}
                maxLength={20}
                value={editing.mobile || ""}
                onChange={(event) =>
                  setEditing({ ...editing, mobile: event.target.value })
                }
              />
            </Flex>

            <Flex gap={10}>
              <Input
                placeholder={labels("jobTitle")}
                maxLength={100}
                value={editing.job_title || ""}
                onChange={(event) =>
                  setEditing({ ...editing, job_title: event.target.value })
                }
              />
              <Input
                placeholder={labels("suggestedUserName")}
                maxLength={30}
                value={editing.user_name || ""}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    user_name: event.target.value.toUpperCase(),
                  })
                }
              />
            </Flex>

            <Flex gap={10}>
              {/* empty = the user sees every branch of the client */}
              <Select
                style={{ width: "100%" }}
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder={labels("allBranches")}
                value={editing.branch_id}
                onChange={(value?: number) =>
                  setEditing({ ...editing, branch_id: value })
                }
              >
                {lookups.branches.map((branch) => (
                  <Select.Option key={branch.key} value={Number(branch.key)}>
                    {branch.value}
                  </Select.Option>
                ))}
              </Select>
              <Select
                style={{ width: 170 }}
                value={editing.language_id}
                onChange={(value: number) =>
                  setEditing({ ...editing, language_id: value })
                }
              >
                <Select.Option value={2}>العربية</Select.Option>
                <Select.Option value={1}>English</Select.Option>
              </Select>
            </Flex>

            <Input.TextArea
              rows={3}
              maxLength={500}
              placeholder={labels("notes")}
              value={editing.notes || ""}
              onChange={(event) =>
                setEditing({ ...editing, notes: event.target.value })
              }
            />
          </Flex>
        ) : null}
      </Modal>
    </>
  );
};

export default ClientUserRequestsPage;
