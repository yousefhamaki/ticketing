/*
 * Support contracts.
 * The level sets the SLA factor (normal 100, silver 125, gold 150), and the
 * code defaults to prefix + year on the server, so it is left empty here.
 * An expired contract is shown, not blocked: the client can still open tickets
 * and the supervisor is told.
 */
import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Icon,
  Input,
  Modal,
  Popconfirm,
  Select,
  Tag,
  message,
} from "antd";
import moment from "moment";
import { useTheme } from "styled-components";
import { Flex } from "../../../../components/commons";
import ExsysTable from "../../../../components/exsys-table";
import { useBasicMutation } from "../../../../hooks";
import { useLabels } from "../../../../labels";
import { ContractType } from "../index.interface";

interface Props {
  clientId: number;
  contracts: ContractType[];
  levels: { key: string; value: string; sla_factor_pct: number }[];
  onReload: () => void;
}

const DATE_FORMAT = "YYYY-MM-DD";

const ContractsView = ({ clientId, contracts, levels, onReload }: Props) => {
  const labels = useLabels();
  const theme = useTheme();
  const [editing, setEditing] = useState<Partial<ContractType> | null>(null);
  const { loading, mutate } = useBasicMutation({ apiId: "adminContractDml" });

  const send = async (payload: any) => {
    const { error } = await mutate(payload);
    if (error) {
      message.error(error);
      return;
    }
    message.success(labels("saved"));
    setEditing(null);
    onReload();
  };

  const columns = [
    { title: labels("contractCode"), dataIndex: "contract_code", width: 130 },
    { title: labels("contractYear"), dataIndex: "contract_year", width: 90 },
    {
      title: labels("contractLevel"),
      dataIndex: "level_name",
      width: 150,
      render: (value: string, record: ContractType) =>
        `${value || record.level_code} (${record.sla_factor_pct || 100}%)`,
    },
    { title: labels("startDate"), dataIndex: "start_date", width: 120 },
    { title: labels("endDate"), dataIndex: "end_date", width: 120 },
    {
      title: "",
      dataIndex: "expired_flag",
      width: 100,
      render: (value: string) =>
        value === "Y" ? (
          <Tag color={theme.colors.warningDark}>{labels("expired")}</Tag>
        ) : null,
    },
    {
      title: "",
      dataIndex: "contract_id",
      width: 110,
      render: (value: number, record: ContractType) => (
        <Flex gap={6}>
          <Icon type="edit" onClick={() => setEditing(record)} />
          <Popconfirm
            title={labels("confirmDelete")}
            onConfirm={() => send({ record_status: "d", contract_id: value })}
          >
            <Icon type="delete" />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <Flex justify="flex-end" margin="0 0 10px">
        <Button onClick={() => setEditing({ client_id: clientId, level_code: "N" })}>
          <Icon type="plus" /> {labels("add")}
        </Button>
      </Flex>

      <ExsysTable
        rowKey="contract_id"
        columns={columns as any}
        dataSource={contracts}
        scrollX
      />

      <Modal
        visible={!!editing}
        title={labels("contracts")}
        confirmLoading={loading}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditing(null)}
        onOk={() =>
          send({
            record_status: editing && editing.contract_id ? "u" : "n",
            client_id: clientId,
            contract_id: editing ? editing.contract_id : undefined,
            contract_code: editing ? editing.contract_code : undefined,
            contract_year: editing ? editing.contract_year : undefined,
            level_code: editing ? editing.level_code : "N",
            start_date: editing ? editing.start_date : undefined,
            end_date: editing ? editing.end_date : undefined,
            notes: editing ? editing.notes : undefined,
          })
        }
      >
        {editing ? (
          <>
            <Select
              style={{ width: "100%", marginBottom: 10 }}
              value={editing.level_code}
              onChange={(next: string) =>
                setEditing({ ...editing, level_code: next })
              }
            >
              {levels.map((level) => (
                <Select.Option key={level.key} value={level.key}>
                  {level.value} ({level.sla_factor_pct}%)
                </Select.Option>
              ))}
            </Select>

            <Flex gap={10} margin="0 0 10px">
              <DatePicker
                style={{ width: "100%" }}
                placeholder={labels("startDate")}
                format={DATE_FORMAT}
                value={
                  editing.start_date
                    ? moment(editing.start_date, DATE_FORMAT)
                    : undefined
                }
                onChange={(date) =>
                  setEditing({
                    ...editing,
                    start_date: date ? date.format(DATE_FORMAT) : undefined,
                  })
                }
              />
              <DatePicker
                style={{ width: "100%" }}
                placeholder={labels("endDate")}
                format={DATE_FORMAT}
                value={
                  editing.end_date
                    ? moment(editing.end_date, DATE_FORMAT)
                    : undefined
                }
                onChange={(date) =>
                  setEditing({
                    ...editing,
                    end_date: date ? date.format(DATE_FORMAT) : undefined,
                  })
                }
              />
            </Flex>

            <Input
              placeholder={labels("contractCode")}
              maxLength={12}
              value={editing.contract_code || ""}
              onChange={(event) =>
                setEditing({ ...editing, contract_code: event.target.value })
              }
            />
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default ContractsView;
