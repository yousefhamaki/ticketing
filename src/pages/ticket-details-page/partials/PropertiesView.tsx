/*
 * The right-hand properties panel + the client / EXSYS-context card.
 * The server already hides the internal fields from a client user (they come
 * back null), so the screen only has to skip empty values.
 */
import React from "react";
import { Alert, Divider, Tag } from "antd";
import { useTheme } from "styled-components";
import {
  FieldLabel,
  FieldValue,
  Flex,
  ShadowSection,
} from "../../../components/commons";
import {
  PriorityTag,
  SlaTag,
  StatusTag,
  usePriorityName,
} from "../../../components/ticket-bits";
import { useLabels } from "../../../labels";
import { TicketType } from "../index.interface";

const Field = ({ label, value }: { label: string; value?: any }) =>
  value === undefined || value === null || value === "" ? null : (
    <div style={{ marginBottom: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue>{value}</FieldValue>
    </div>
  );

const PropertiesView = ({
  ticket,
  isStaff,
}: {
  ticket: TicketType;
  isStaff: boolean;
}) => {
  const labels = useLabels();
  const theme = useTheme();
  const priorityName = usePriorityName();

  const hasContext =
    ticket.ctx_page_name || ticket.ctx_user_name || ticket.ctx_error;

  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      <ShadowSection>
        <Flex gap={6} wrap margin="0 0 10px">
          <StatusTag
            statusName={ticket.status_name}
            openFlag={ticket.open_flag}
          />
          <PriorityTag
            priority={ticket.company_priority}
            // 23-11-2026 OLD: the number ("2")  NEW: the priority name
            priorityName={priorityName(
              ticket.company_priority || ticket.client_priority,
            )}
          />
          {ticket.contract_expired_flag === "Y" ? (
            <Tag color={theme.colors.warningDark}>
              {labels("contractExpired")}
            </Tag>
          ) : null}
        </Flex>

        <Field label={labels("client")} value={ticket.client_name} />
        <Field label={labels("branch")} value={ticket.branch_name} />
        <Field label={labels("module")} value={ticket.module_name} />
        <Field label={labels("type")} value={ticket.type_name} />
        <Field label={labels("createdBy")} value={ticket.created_by_name} />
        <Field label={labels("submittedDate")} value={ticket.submitted_date} />

        {isStaff ? (
          <>
            <Divider style={{ margin: "8px 0" }} />
            <Field label={labels("team")} value={ticket.team_name} />
            <Field label={labels("assignee")} value={ticket.assignee_name} />
            <Field
              label={labels("clientPriority")}
              value={priorityName(ticket.client_priority)}
            />
            <Field
              label={labels("companyPriority")}
              value={priorityName(ticket.company_priority)}
            />
            <Field label={labels("acceptDue")} value={ticket.accept_due_int} />
            <Field
              label={labels("resolveDue")}
              value={ticket.resolve_due_int}
            />
            <Field label={labels("escLevel")} value={ticket.esc_level} />
          </>
        ) : (
          <>
            <Divider style={{ margin: "8px 0" }} />
            <Field label={labels("acceptDue")} value={ticket.accept_due_ext} />
            <Field
              label={labels("resolveDue")}
              value={ticket.resolve_due_ext}
            />
          </>
        )}

        <Field label={labels("resolutionNote")} value={ticket.resolution_note} />
        <Field label={labels("blockReason")} value={ticket.block_reason} />
        <Field label={labels("cancelReason")} value={ticket.cancel_reason} />
        <Field label={labels("rating")} value={ticket.rating} />
      </ShadowSection>

      {hasContext && isStaff ? (
        <ShadowSection padding="10px 14px" style={{ marginTop: 12 }}>
          <FieldLabel style={{ fontWeight: 600 }}>
            {labels("exsysContext")}
          </FieldLabel>
          <Field label={labels("page")} value={ticket.ctx_page_name} />
          <Field label={labels("exsysUser")} value={ticket.ctx_user_name} />
          {ticket.ctx_error ? (
            <Alert type="error" message={ticket.ctx_error} />
          ) : null}
        </ShadowSection>
      ) : null}

      {ticket.merged_into_ticket_id ? (
        <Alert
          style={{ marginTop: 12 }}
          type="info"
          showIcon
          message={`${labels("mergeInto")} ${ticket.merged_into_ticket_id}`}
        />
      ) : null}

      <div style={{ marginTop: 12 }}>
        <SlaTag
          slaState={
            ticket.open_flag === "N"
              ? undefined
              : (ticket as any).sla_state
          }
        />
      </div>
    </div>
  );
};

export default PropertiesView;
