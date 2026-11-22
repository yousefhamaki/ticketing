/*
 * Branches.
 * The branch type carries the weight every client comparison is built on, so
 * it is a list, never free text. A branch that already has tickets or users is
 * switched off instead of deleted - the service refuses the delete and says so.
 */
import React, { useState } from "react";
import {
  Button,
  Icon,
  Input,
  Modal,
  Popconfirm,
  Select,
  Tag,
  message,
} from "antd";
import { Flex } from "../../../../components/commons";
import ExsysTable from "../../../../components/exsys-table";
import { useBasicMutation } from "../../../../hooks";
import { useLabels } from "../../../../labels";
import { BranchType } from "../index.interface";

interface Props {
  clientId: number;
  branches: BranchType[];
  branchTypes: { key: string; value: string; weight: number }[];
  onReload: () => void;
}

const BranchesView = ({ clientId, branches, branchTypes, onReload }: Props) => {
  const labels = useLabels();
  const [editing, setEditing] = useState<Partial<BranchType> | null>(null);
  const { loading, mutate } = useBasicMutation({ apiId: "adminBranchDml" });

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
    { title: labels("organizationNo"), dataIndex: "organization_no", width: 130 },
    { title: labels("nameEn"), dataIndex: "description_p" },
    { title: labels("nameAr"), dataIndex: "description_s" },
    { title: labels("branchType"), dataIndex: "branch_type_name", width: 160 },
    { title: labels("weight"), dataIndex: "weight", width: 80 },
    { title: labels("city"), dataIndex: "city", width: 120 },
    {
      title: labels("active"),
      dataIndex: "active_flag",
      width: 90,
      render: (value: string) =>
        value === "Y" ? null : <Tag>{labels("inactive")}</Tag>,
    },
    {
      title: "",
      dataIndex: "branch_id",
      width: 110,
      render: (value: number, record: BranchType) => (
        <Flex gap={6}>
          <Icon type="edit" onClick={() => setEditing(record)} />
          <Popconfirm
            title={labels("confirmDelete")}
            onConfirm={() =>
              send({ record_status: "d", branch_id: value })
            }
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
        <Button
          onClick={() =>
            setEditing({ client_id: clientId, active_flag: "Y" })
          }
        >
          <Icon type="plus" /> {labels("add")}
        </Button>
      </Flex>

      <ExsysTable
        rowKey="branch_id"
        columns={columns as any}
        dataSource={branches}
        scrollX
      />

      <Modal
        visible={!!editing}
        title={labels("branches")}
        confirmLoading={loading}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditing(null)}
        onOk={() =>
          send({
            record_status: editing && editing.branch_id ? "u" : "n",
            client_id: clientId,
            branch_id: editing ? editing.branch_id : undefined,
            organization_no: editing ? editing.organization_no : undefined,
            description_p: editing ? editing.description_p : undefined,
            description_s: editing ? editing.description_s : undefined,
            branch_type_code: editing ? editing.branch_type_code : undefined,
            city: editing ? editing.city : undefined,
            active_flag: editing ? editing.active_flag : "Y",
          })
        }
      >
        {editing ? (
          <>
            <Input
              style={{ marginBottom: 10 }}
              placeholder={labels("organizationNo")}
              maxLength={10}
              value={editing.organization_no || ""}
              onChange={(event) =>
                setEditing({ ...editing, organization_no: event.target.value })
              }
            />
            <Input
              style={{ marginBottom: 10 }}
              placeholder={labels("nameEn")}
              value={editing.description_p || ""}
              onChange={(event) =>
                setEditing({ ...editing, description_p: event.target.value })
              }
            />
            <Input
              style={{ marginBottom: 10 }}
              placeholder={labels("nameAr")}
              value={editing.description_s || ""}
              onChange={(event) =>
                setEditing({ ...editing, description_s: event.target.value })
              }
            />
            <Select
              style={{ width: "100%", marginBottom: 10 }}
              placeholder={labels("branchType")}
              value={editing.branch_type_code}
              onChange={(next: string) =>
                setEditing({ ...editing, branch_type_code: next })
              }
            >
              {branchTypes.map((type) => (
                <Select.Option key={type.key} value={type.key}>
                  {type.value} ({type.weight})
                </Select.Option>
              ))}
            </Select>
            <Input
              placeholder={labels("city")}
              value={editing.city || ""}
              onChange={(event) =>
                setEditing({ ...editing, city: event.target.value })
              }
            />
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default BranchesView;
