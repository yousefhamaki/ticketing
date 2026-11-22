/*
 * Clients.
 * GET etk_lookup_pkg/clients_data - client, environment (Web / Forms), support
 * team, number of branches, the weight that comes from the branch types, and
 * the contract with its end date. Clicking a client filters the ticket list to
 * that client.
 */
import React, { useCallback, useState } from "react";
import { Tag } from "antd";
import { ColumnProps } from "antd/lib/table";
import { useTheme } from "styled-components";
import { Flex, PageTitle, ShadowSection } from "../../components/commons";
import ExsysTable from "../../components/exsys-table";
import { useBasicQuery } from "../../hooks";
import { useLabels } from "../../labels";

const PAGE_SIZE = 25;

const ClientsPage = () => {
  const labels = useLabels();
  const theme = useTheme();
  const [rows, setRows] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");

  const { loading, runQuery } = useBasicQuery({
    apiId: "clients",
    params: { poffset: 0, poffset_step: PAGE_SIZE },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setRows(!error && apiValues ? apiValues.data || [] : []);
    },
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

  const columns: ColumnProps<any>[] = [
    { title: labels("client"), dataIndex: "client_name" },
    { title: "site_prefix", dataIndex: "site_prefix", width: 110 },
    {
      title: "env",
      dataIndex: "env_type",
      width: 90,
      render: (value: string) => (
        <Tag color={value === "W" ? theme.colors.primary : theme.colors.mutedText}>
          {value === "W" ? "Web" : "Forms"}
        </Tag>
      ),
    },
    { title: labels("branch"), dataIndex: "branches", width: 90 },
    { title: "weight", dataIndex: "weight", width: 90 },
    { title: "contract", dataIndex: "contract_code", width: 120 },
    { title: "end", dataIndex: "contract_end_date", width: 120 },
    {
      title: "",
      dataIndex: "active_flag",
      width: 80,
      render: (value: string) =>
        value === "Y" ? null : <Tag color={theme.colors.error}>off</Tag>,
    },
  ];

  return (
    <>
      <Flex margin="0 0 12px">
        <PageTitle>{labels("clients")}</PageTitle>
      </Flex>
      <ShadowSection>
        <ExsysTable
          rowKey="client_id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          offset={offset}
          pageSize={PAGE_SIZE}
          onPageChange={load}
        />
      </ShadowSection>
    </>
  );
};

export default ClientsPage;
