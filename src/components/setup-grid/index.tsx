/*
 * SetupGrid.
 *
 * The setup screens are all the same shape: a table of rows, an edit form of a
 * few fields, and one `..._dml` service. Writing that three more times would
 * mean three places to fix one bug, so the shape lives here once and each
 * screen passes its columns, its fields and its apiId.
 *
 * It sends exactly what the services expect:
 *   { record_status: n | u | d, ...the field values }
 * and it reloads the screen's single GET after every write.
 */
import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Icon,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Switch,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import moment from "moment";
import { Flex, SubText } from "../commons";
import ExsysTable from "../exsys-table";
import { useBasicMutation } from "../../hooks";
import { useLabels } from "../../labels";
import { ApiIdType } from "../../api";

export interface SetupFieldType {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "switch" | "date";
  options?: { key: string | number; value: string }[];
  /* a key column: typed when adding, read only afterwards */
  keyField?: boolean;
  required?: boolean;
  max?: number;
  upper?: boolean;
  hint?: string;
}

interface SetupGridProps<T> {
  rows: T[];
  columns: ColumnProps<T>[];
  fields: SetupFieldType[];
  apiId: ApiIdType;
  rowKey: string;
  loading?: boolean;
  canAdd?: boolean;
  canDelete?: boolean;
  /* fields that must travel with every write so the server finds the row */
  identity?: string[];
  newDefaults?: { [key: string]: any };
  onDone: () => void;
  note?: string;
}

const DATE_FORMAT = "YYYY-MM-DD";

function SetupGrid<T extends { [key: string]: any }>({
  rows,
  columns,
  fields,
  apiId,
  rowKey,
  loading,
  canAdd,
  canDelete,
  identity,
  newDefaults,
  onDone,
  note,
}: SetupGridProps<T>) {
  const labels = useLabels();
  const [editing, setEditing] = useState<{ [key: string]: any } | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { loading: saving, mutate } = useBasicMutation({ apiId });

  const send = async (payload: { [key: string]: any }) => {
    const { error } = await mutate(payload);

    if (error) {
      message.error(error);
      return;
    }

    message.success(labels("saved"));
    setEditing(null);
    onDone();
  };

  const onSave = () => {
    if (!editing) {
      return;
    }

    const payload: { [key: string]: any } = {
      record_status: isNew ? "n" : "u",
    };

    (identity || []).forEach((name) => {
      payload[name] = editing[name];
    });
    fields.forEach((field) => {
      payload[field.name] = editing[field.name];
    });

    send(payload);
  };

  const actionColumn: ColumnProps<T> = {
    title: "",
    dataIndex: rowKey,
    width: canDelete ? 100 : 70,
    render: (value: any, record: T) => (
      <Flex gap={10}>
        <Icon
          type="edit"
          onClick={() => {
            setIsNew(false);
            setEditing({ ...record });
          }}
        />
        {canDelete ? (
          <Popconfirm
            title={labels("confirmDelete")}
            onConfirm={() => {
              const payload: { [key: string]: any } = { record_status: "d" };
              (identity || []).forEach((name) => {
                payload[name] = (record as any)[name];
              });
              fields
                .filter((field) => field.keyField)
                .forEach((field) => {
                  payload[field.name] = (record as any)[field.name];
                });
              send(payload);
            }}
          >
            <Icon type="delete" />
          </Popconfirm>
        ) : null}
      </Flex>
    ),
  };

  const renderField = (field: SetupFieldType) => {
    const value = editing ? editing[field.name] : undefined;
    const disabled = !!field.keyField && !isNew;
    const set = (next: any) =>
      setEditing({ ...(editing || {}), [field.name]: next });

    if (field.type === "select") {
      return (
        <Select
          style={{ width: "100%" }}
          allowClear={!field.required}
          showSearch
          optionFilterProp="children"
          placeholder={field.label}
          disabled={disabled}
          value={value === null ? undefined : value}
          onChange={(next: any) => set(next)}
        >
          {(field.options || []).map((option) => (
            <Select.Option key={String(option.key)} value={option.key}>
              {option.value}
            </Select.Option>
          ))}
        </Select>
      );
    }

    if (field.type === "switch") {
      return (
        <Flex gap={8}>
          <Switch
            checked={value === "Y"}
            onChange={(checked) => set(checked ? "Y" : "N")}
          />
          <span>{field.label}</span>
        </Flex>
      );
    }

    if (field.type === "number") {
      return (
        <InputNumber
          style={{ width: "100%" }}
          placeholder={field.label}
          disabled={disabled}
          value={value}
          onChange={(next) => set(next)}
        />
      );
    }

    if (field.type === "date") {
      return (
        <DatePicker
          style={{ width: "100%" }}
          format={DATE_FORMAT}
          placeholder={field.label}
          disabled={disabled}
          value={value ? moment(value, DATE_FORMAT) : undefined}
          onChange={(date) => set(date ? date.format(DATE_FORMAT) : undefined)}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Input.TextArea
          rows={4}
          placeholder={field.label}
          value={value || ""}
          onChange={(event) => set(event.target.value)}
        />
      );
    }

    return (
      <Input
        placeholder={field.label}
        maxLength={field.max}
        disabled={disabled}
        value={value || ""}
        onChange={(event) =>
          set(field.upper ? event.target.value.toUpperCase() : event.target.value)
        }
      />
    );
  };

  return (
    <>
      <Flex justify="space-between" margin="0 0 10px">
        <SubText>{note || ""}</SubText>
        {canAdd ? (
          <Button
            onClick={() => {
              setIsNew(true);
              setEditing({ ...(newDefaults || {}) });
            }}
          >
            <Icon type="plus" /> {labels("add")}
          </Button>
        ) : (
          <span />
        )}
      </Flex>

      <ExsysTable<T>
        rowKey={rowKey}
        loading={loading}
        columns={columns.concat([actionColumn])}
        dataSource={rows}
        scrollX
      />

      <Modal
        visible={!!editing}
        title={isNew ? labels("add") : labels("edit")}
        confirmLoading={saving}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onCancel={() => setEditing(null)}
        onOk={onSave}
      >
        <Flex column align="stretch" gap={12}>
          {fields.map((field) => (
            <div key={field.name}>
              {field.type !== "switch" ? (
                <SubText>{field.label}</SubText>
              ) : null}
              {renderField(field)}
              {field.hint ? <SubText>{field.hint}</SubText> : null}
            </div>
          ))}
        </Flex>
      </Modal>
    </>
  );
}

export default SetupGrid;
