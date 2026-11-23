/*
 * New internal task (staff) - 23-11-2026.
 *
 * POST etk_ticket_pkg/ticket_dml  { record_status: "n", client_id: null, ... }
 * A ticket with no client is an internal task: the server sets status I,
 * accepts it at once, and either assigns it (assignee_user_id) or asks the team
 * supervisor to assign it. Nothing new on the server: the service already
 * accepted these fields, only the screen was missing.
 *
 *   REASON : the review of 23-11-2026 - staff had no way to open a task.
 *   BENEFIT: internal work (tests, documentation, reviews) is tracked like tickets.
 */
import React, { useEffect, useMemo, useState } from "react";
import { DatePicker, Input, Modal, Select, message as antMessage } from "antd";
import moment from "moment";
import { Flex, FieldLabel } from "../../../components/commons";
import { useBasicMutation, useLookups } from "../../../hooks";
import { useAppConfig } from "../../../store";
import { useLabels } from "../../../labels";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (ticketId: number) => void;
}

interface TaskType {
  type_code?: string;
  title: string;
  description: string;
  team_id?: number;
  assignee_user_id?: number;
  company_priority?: number;
  module_id?: string;
  due_date?: moment.Moment | null;
}

const NewTaskModal = ({ visible, onClose, onCreated }: Props) => {
  const labels = useLabels();
  const { user } = useAppConfig();
  const { lookups } = useLookups();

  // internal-only types first: they are what a task usually is
  const types = useMemo(
    () =>
      [...lookups.types].sort((a, b) =>
        a.internal_only_flag === b.internal_only_flag
          ? 0
          : a.internal_only_flag === "Y"
          ? -1
          : 1,
      ),
    [lookups.types],
  );

  const blank = (): TaskType => ({
    type_code: types.length ? String(types[0].key) : undefined,
    title: "",
    description: "",
    team_id: user && user.team_id ? Number(user.team_id) : undefined,
    company_priority: 3,
    due_date: null,
  });

  const [task, setTask] = useState<TaskType>(blank);

  useEffect(() => {
    if (visible) {
      setTask(blank());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, types.length]);

  const members = useMemo(
    () =>
      lookups.staff.filter(
        (item) => task.team_id && Number(item.team_id) === Number(task.team_id),
      ),
    [lookups.staff, task.team_id],
  );

  const { loading, mutate } = useBasicMutation({ apiId: "ticketDml" });

  const ready =
    !!task.type_code && !!task.title.trim() && !!task.description.trim() && !!task.team_id;

  const onSave = async () => {
    if (!ready) {
      return;
    }
    const { apiValues, error } = await mutate({
      record_status: "n",
      type_code: task.type_code,
      title: task.title.trim(),
      description: task.description.trim(),
      team_id: task.team_id,
      assignee_user_id: task.assignee_user_id,
      company_priority: task.company_priority,
      module_id: task.module_id,
      due_date: task.due_date ? task.due_date.format("YYYY-MM-DD") : undefined,
    });
    if (error) {
      antMessage.error(error);
      return;
    }
    const row = ((apiValues && apiValues.data) || [])[0];
    antMessage.success(labels("taskCreated"));
    onClose();
    if (row && row.ticket_id) {
      onCreated(Number(row.ticket_id));
    }
  };

  return (
    <Modal
      visible={visible}
      width={720}
      title={labels("newTask")}
      okText={labels("save")}
      cancelText={labels("cancel")}
      confirmLoading={loading}
      okButtonProps={{ disabled: !ready }}
      onCancel={onClose}
      onOk={onSave}
    >
      <Flex column align="stretch" gap={10}>
        <Flex gap={10} align="flex-end">
          <div style={{ flex: 1 }}>
            <FieldLabel>{labels("type")} *</FieldLabel>
            <Select
              style={{ width: "100%" }}
              value={task.type_code}
              onChange={(value: string) => setTask({ ...task, type_code: value })}
            >
              {types.map((item) => (
                <Select.Option key={item.key} value={String(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>{labels("companyPriority")}</FieldLabel>
            <Select
              style={{ width: "100%" }}
              value={task.company_priority}
              onChange={(value: number) =>
                setTask({ ...task, company_priority: Number(value) })
              }
            >
              {lookups.priorities.map((item) => (
                <Select.Option key={item.key} value={Number(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Flex>

        <div>
          <FieldLabel>{labels("title")} *</FieldLabel>
          <Input
            maxLength={200}
            value={task.title}
            onChange={(event) => setTask({ ...task, title: event.target.value })}
          />
        </div>

        <div>
          <FieldLabel>{labels("description")} *</FieldLabel>
          <Input.TextArea
            rows={4}
            maxLength={4000}
            value={task.description}
            onChange={(event) =>
              setTask({ ...task, description: event.target.value })
            }
          />
        </div>

        <Flex gap={10} align="flex-end">
          <div style={{ flex: 1 }}>
            <FieldLabel>{labels("team")} *</FieldLabel>
            <Select
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              value={task.team_id}
              onChange={(value: number) =>
                setTask({ ...task, team_id: Number(value), assignee_user_id: undefined })
              }
            >
              {lookups.teams.map((item) => (
                <Select.Option key={item.key} value={Number(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            {/* empty = the team supervisor assigns it */}
            <FieldLabel>{labels("assignee")}</FieldLabel>
            <Select
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder={labels("viewNeedAssign")}
              value={task.assignee_user_id}
              onChange={(value?: number) =>
                setTask({ ...task, assignee_user_id: value ? Number(value) : undefined })
              }
            >
              {members.map((item) => (
                <Select.Option key={item.key} value={Number(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Flex>

        <Flex gap={10} align="flex-end">
          <div style={{ flex: 1 }}>
            <FieldLabel>{labels("module")}</FieldLabel>
            <Select
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
              value={task.module_id}
              onChange={(value?: string) => setTask({ ...task, module_id: value })}
            >
              {lookups.modules.map((item) => (
                <Select.Option key={item.key} value={String(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>{labels("dueDate")}</FieldLabel>
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder={labels("dueDate")}
              value={task.due_date || undefined}
              disabledDate={(day) => !!day && day.isBefore(moment().startOf("day"))}
              onChange={(day) => setTask({ ...task, due_date: day })}
            />
          </div>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default NewTaskModal;
