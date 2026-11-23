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
    // 23-11-2026 OLD: raw column names (site_prefix, env, weight, contract, end, off)
    //            NEW: labels in the user language; an ended contract is red
    { title: labels("sitePrefix"), dataIndex: "site_prefix", width: 110 },
    {
      title: labels("environment"),
      dataIndex: "env_type",
      width: 90,
      render: (value: string) => (
        <Tag color={value === "W" ? theme.colors.primary : theme.colors.mutedText}>
          {value === "W" ? "Web" : "Forms"}
        </Tag>
      ),
    },
    { title: labels("branch"), dataIndex: "branches", width: 90 },
    { title: labels("weight"), dataIndex: "weight", width: 90 },
    { title: labels("contractCode"), dataIndex: "contract_code", width: 120 },
    {
      title: labels("endDate"),
      dataIndex: "contract_end_date",
      width: 140,
      render: (value: string) => {
        if (!value) {
          return null;
        }
        const ended = value < new Date().toISOString().slice(0, 10);
        return ended ? (
          <Tag color={theme.colors.error}>
            {value} · {labels("expired")}
          </Tag>
        ) : (
          value
        );
      },
    },
    {
      title: "",
      dataIndex: "active_flag",
      width: 80,
      render: (value: string) =>
        value === "Y" ? null : (
          <Tag color={theme.colors.error}>{labels("inactive")}</Tag>
        ),
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
