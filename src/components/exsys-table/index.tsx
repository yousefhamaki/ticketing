/*
 * ExsysTable.
 *
 * One wrapper over the Ant Design v3 table. Every list screen goes through it,
 * so when the new Exsys Grid is ready it is swapped in HERE and no screen
 * changes (the decision recorded in the handover, section 6.7).
 *
 * It speaks the server's paging contract directly: `poffset` / `poffset_step`
 * out, and `total` read off the first row, which is how every ETKT GET answers.
 */
import React, { useMemo } from "react";
import { Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import styled from "styled-components";

const TableWrapper = styled.div`
  .ant-table {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.bodyText};
  }
  .ant-table-thead > tr > th {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.headingText};
    font-weight: 600;
    white-space: nowrap;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.tableCellBorder};
  }
  .ant-table-tbody > tr:hover > td {
    background: ${({ theme }) => theme.colors.menuHover};
  }
  .etk-row-late > td {
    background: ${({ theme }) => theme.colors.dangerBackground};
  }
  .etk-row-near > td {
    background: ${({ theme }) => theme.colors.warningBackground};
  }
  .etk-row-clickable {
    cursor: pointer;
  }
`;

export interface ExsysTableProps<T> {
  columns: ColumnProps<T>[];
  dataSource: T[];
  loading?: boolean;
  rowKey: string;
  /*
   * Server paged list: pass offset / pageSize / onPageChange.
   * Short list that arrived complete (the setup screens, a members table):
   * pass none of them and the table shows every row with no pager.
   */
  offset?: number;
  pageSize?: number;
  onPageChange?: (offset: number) => void;
  onRowClick?: (record: T) => void;
  /* paints the row by the server's sla_state (late / near / ok) */
  useSlaRowColor?: boolean;
  scrollX?: number | true;
}

function ExsysTable<T extends { [key: string]: any }>({
  columns,
  dataSource,
  loading,
  rowKey,
  offset,
  pageSize,
  onPageChange,
  onRowClick,
  useSlaRowColor,
  scrollX,
}: ExsysTableProps<T>) {
  // every paged GET puts COUNT(*) OVER () on each row, so the first row carries it
  const total = useMemo(
    () => (dataSource.length ? Number(dataSource[0].total || 0) : 0),
    [dataSource],
  );

  const paged = !!onPageChange && pageSize !== undefined;

  return (
    <TableWrapper>
      <Table<T>
        size="small"
        bordered
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        scroll={scrollX ? { x: scrollX } : undefined}
        rowClassName={(record) => {
          const classes: string[] = [];
          if (onRowClick) {
            classes.push("etk-row-clickable");
          }
          if (useSlaRowColor && record.sla_state === "late") {
            classes.push("etk-row-late");
          }
          if (useSlaRowColor && record.sla_state === "near") {
            classes.push("etk-row-near");
          }
          return classes.join(" ");
        }}
        onRow={(record) => ({
          onClick: () => onRowClick && onRowClick(record),
        })}
        pagination={
          paged
            ? {
                current: Math.floor((offset || 0) / (pageSize as number)) + 1,
                pageSize,
                total,
                showTotal: (count) => `${count}`,
                onChange: (page) =>
                  (onPageChange as (next: number) => void)(
                    (page - 1) * (pageSize as number),
                  ),
              }
            : false
        }
      />
    </TableWrapper>
  );
}

export default ExsysTable;
