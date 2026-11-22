/*
 * Every action on a ticket goes to ONE service:
 *   POST etk_ticket_pkg/ticket_action_dml
 *   data[0] = { ticket_id, action, ... }
 * actions: accept | status | transfer | assign | merge | priority
 *
 * The allowed next statuses come with the ticket (next_statuses), and the
 * fields a status makes mandatory come from the lookups (status_fields), so a
 * new status or a new mandatory field is data, not a code change here.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  Icon,
  Input,
  InputNumber,
  Modal,
  Rate,
  Select,
  message as antMessage,
} from "antd";
import { Flex } from "../../../components/commons";
import { useBasicMutation, useLookups } from "../../../hooks";
import { useLabels } from "../../../labels";
import { TicketType } from "../index.interface";

type ActionKind =
  | "status"
  | "transfer"
  | "assign"
  | "merge"
  | "priority"
  | null;

interface Props {
  ticket: TicketType;
  nextStatuses: { key: string; value: string }[];
  isStaff: boolean;
  isSupervisorOrManagement: boolean;
  onDone: () => void;
}

const ActionsBar = ({
  ticket,
  nextStatuses,
  isStaff,
  isSupervisorOrManagement,
  onDone,
}: Props) => {
  const labels = useLabels();
  const { lookups } = useLookups();
  const [kind, setKind] = useState<ActionKind>(null);
  const [form, setForm] = useState<{ [key: string]: any }>({});

  const { loading, mutate } = useBasicMutation({ apiId: "ticketAction" });

  const send = useCallback(
    async (payload: { [key: string]: any }) => {
      const { error } = await mutate({ ticket_id: ticket.ticket_id, ...payload });

      if (error) {
        antMessage.error(error);
        return;
      }

      antMessage.success(labels("saved"));
      setKind(null);
      setForm({});
      onDone();
    },
    [mutate, ticket.ticket_id, labels, onDone],
  );

  /* the mandatory fields of the status the user picked */
  const mandatoryFields = useMemo(
    () =>
      lookups.status_fields.filter(
        (field) => field.status_code === form.to_status,
      ),
    [lookups.status_fields, form.to_status],
  );

  const openFlag = ticket.open_flag !== "N";
  const canAccept = isStaff && ticket.status_code === "O" && !ticket.accepted_date;

  const renderModalBody = () => {
    if (kind === "status") {
      return (
        <>
          <Select
            style={{ width: "100%", marginBottom: 12 }}
            placeholder={labels("status")}
            value={form.to_status}
            onChange={(value: string) =>
              setForm({ ...form, to_status: value })
            }
          >
            {nextStatuses.map((item) => (
              <Select.Option key={item.key} value={item.key}>
                {item.value}
              </Select.Option>
            ))}
          </Select>

          {mandatoryFields.map((field) => {
            if (field.field === "root_cause_id") {
              return (
                <Select
                  key={field.field}
                  style={{ width: "100%", marginBottom: 12 }}
                  placeholder={field.label}
                  value={form.root_cause_id}
                  onChange={(value: number) =>
                    setForm({ ...form, root_cause_id: value })
                  }
                >
                  {lookups.root_causes.map((cause) => (
                    <Select.Option key={cause.key} value={Number(cause.key)}>
                      {cause.value}
                    </Select.Option>
                  ))}
                </Select>
              );
            }
            if (field.field === "rating") {
              return (
                <div key={field.field} style={{ marginBottom: 12 }}>
                  <div>{field.label}</div>
                  <Rate
                    value={form.rating}
                    onChange={(value) => setForm({ ...form, rating: value })}
                  />
                </div>
              );
            }
            return (
              <Input.TextArea
                key={field.field}
                rows={3}
                style={{ marginBottom: 12 }}
                placeholder={field.label}
                value={form[field.field] || ""}
                onChange={(event) =>
                  setForm({ ...form, [field.field]: event.target.value })
                }
              />
            );
          })}
        </>
      );
    }

    if (kind === "transfer") {
      return (
        <>
          <Select
            showSearch
            optionFilterProp="children"
            style={{ width: "100%", marginBottom: 12 }}
            placeholder={labels("team")}
            value={form.team_id}
            onChange={(value: number) => setForm({ ...form, team_id: value })}
          >
            {lookups.teams.map((team) => (
              <Select.Option key={team.key} value={Number(team.key)}>
                {team.value}
              </Select.Option>
            ))}
          </Select>
          <Select
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ width: "100%", marginBottom: 12 }}
            placeholder={labels("assignee")}
            value={form.user_id}
            onChange={(value?: number) => setForm({ ...form, user_id: value })}
          >
            {lookups.staff
              .filter(
                (person) =>
                  !form.team_id ||
                  String(person.team_id) === String(form.team_id),
              )
              .map((person) => (
                <Select.Option key={person.key} value={Number(person.key)}>
                  {person.value}
                </Select.Option>
              ))}
          </Select>
          <Input.TextArea
            rows={2}
            placeholder={labels("notes")}
            value={form.notes || ""}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </>
      );
    }

    if (kind === "assign") {
      return (
        <Select
          showSearch
          optionFilterProp="children"
          style={{ width: "100%" }}
          placeholder={labels("assignee")}
          value={form.user_id}
          onChange={(value: number) => setForm({ ...form, user_id: value })}
        >
          {lookups.staff
            .filter(
              (person) =>
                !ticket.team_id ||
                String(person.team_id) === String(ticket.team_id),
            )
            .map((person) => (
              <Select.Option key={person.key} value={Number(person.key)}>
                {person.value}
              </Select.Option>
            ))}
        </Select>
      );
    }

    if (kind === "merge") {
      return (
        <InputNumber
          style={{ width: "100%" }}
          placeholder={labels("mergeInto")}
          value={form.into_ticket_id}
          onChange={(value) => setForm({ ...form, into_ticket_id: value })}
        />
      );
    }

    if (kind === "priority") {
      return (
        <Select
          style={{ width: "100%" }}
          placeholder={labels("companyPriority")}
          value={form.company_priority}
          onChange={(value: number) =>
            setForm({ ...form, company_priority: value })
          }
        >
          {lookups.priorities.map((item) => (
            <Select.Option key={item.key} value={Number(item.key)}>
              {item.value}
            </Select.Option>
          ))}
        </Select>
      );
    }

    return null;
  };

  return (
    <>
      <Flex gap={8} wrap>
        {canAccept ? (
          <Button type="primary" onClick={() => send({ action: "accept" })}>
            <Icon type="check" /> {labels("accept")}
          </Button>
        ) : null}

        {nextStatuses.length ? (
          <Button onClick={() => setKind("status")}>
            <Icon type="swap" /> {labels("changeStatus")}
          </Button>
        ) : null}

        {isStaff && openFlag ? (
          <Button onClick={() => setKind("transfer")}>
            <Icon type="export" /> {labels("transfer")}
          </Button>
        ) : null}

        {isSupervisorOrManagement && openFlag ? (
          <Button onClick={() => setKind("assign")}>
            <Icon type="user-add" /> {labels("assign")}
          </Button>
        ) : null}

        {isStaff && openFlag ? (
          <Button onClick={() => setKind("merge")}>
            <Icon type="merge-cells" /> {labels("merge")}
          </Button>
        ) : null}

        {isSupervisorOrManagement && openFlag ? (
          <Button onClick={() => setKind("priority")}>
            <Icon type="flag" /> {labels("setPriority")}
          </Button>
        ) : null}
      </Flex>

      <Modal
        visible={!!kind}
        title={kind ? labels(kind === "status" ? "changeStatus" : (kind as any)) : ""}
        confirmLoading={loading}
        onCancel={() => {
          setKind(null);
          setForm({});
        }}
        okText={labels("save")}
        cancelText={labels("cancel")}
        onOk={() => send({ action: kind, ...form })}
      >
        {renderModalBody()}
      </Modal>
    </>
  );
};

export default ActionsBar;
