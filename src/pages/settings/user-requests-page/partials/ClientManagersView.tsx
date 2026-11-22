/*
 * Who is the client manager.
 *
 * GET  etk_user_request_pkg/client_admins_data  - the client users + the flag
 * POST etk_user_request_pkg/client_admin_dml    - { user_id, client_admin_flag }
 *
 * Only a user with the flag can send a user request from the portal.
 * "Has no branch" does not make a user the manager: management says who is.
 */
import React, { useCallback, useState } from "react";
import { Input, Switch, Tag, message } from "antd";
import { ColumnProps } from "antd/lib/table";
import { Flex } from "../../../../components/commons";
import ExsysTable from "../../../../components/exsys-table";
import { useBasicMutation, useBasicQuery } from "../../../../hooks";
import { useLabels } from "../../../../labels";
import { ClientAdminRowType } from "../index.interface";

const PAGE_SIZE = 25;

const ClientManagersView = () => {
  const labels = useLabels();

  const [rows, setRows] = useState<ClientAdminRowType[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");

  const { loading, runQuery } = useBasicQuery({
    apiId: "clientAdmins",
    params: { poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      if (error) {
        message.error(error);
      }
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const { loading: saving, mutate: setFlag } = useBasicMutation({
    apiId: "clientAdminDml",
  });

  const load = useCallback(
    (nextOffset: number, nextSearch = search) => {
      setOffset(nextOffset);
      setSearch(nextSearch);
      runQuery({
        search: nextSearch,
        poffset: nextOffset,
        poffset_step: PAGE_SIZE,
      });
    },
    [runQuery, search],
  );

  const onToggle = useCallback(
    async (userId: number, checked: boolean) => {
      const { error } = await setFlag({
        user_id: userId,
        client_admin_flag: checked ? "Y" : "N",
      });

      if (error) {
        message.error(error);
        return;
      }

      message.success(labels("saved"));
      load(offset);
    },
    [setFlag, labels, load, offset],
  );

  const columns: ColumnProps<ClientAdminRowType>[] = [
    { title: labels("client"), dataIndex: "client_name", width: 200 },
    { title: labels("userName"), dataIndex: "user_name", width: 160 },
    { title: labels("fullName"), dataIndex: "full_name", width: 200 },
    {
      title: labels("branch"),
      dataIndex: "branch_name",
      width: 170,
      render: (value?: string) => value || labels("allBranches"),
    },
    { title: labels("email"), dataIndex: "email", width: 200 },
    {
      title: "",
      dataIndex: "active_flag",
      width: 100,
      render: (value: string) =>
        value === "N" ? <Tag>{labels("inactive")}</Tag> : null,
    },
    {
      title: labels("clientManager"),
      dataIndex: "client_admin_flag",
      width: 130,
      render: (value: string, record) => (
        <Switch
          loading={saving}
          checked={value === "Y"}
          onChange={(checked) => onToggle(record.user_id, checked)}
        />
      ),
    },
  ];

  return (
    <>
      <Flex gap={8} margin="0 0 12px" wrap>
        <Input.Search
          allowClear
          style={{ width: 240 }}
          placeholder={labels("search")}
          onSearch={(value) => load(0, value)}
        />
        <span style={{ opacity: 0.7, fontSize: 12 }}>
          {labels("clientManagerHint")}
        </span>
      </Flex>

      <ExsysTable
        rowKey="user_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        offset={offset}
        pageSize={PAGE_SIZE}
        onPageChange={(next) => load(next)}
        scrollX={1200}
      />
    </>
  );
};

export default ClientManagersView;
