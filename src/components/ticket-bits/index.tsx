/*
 * The small pieces every ticket screen repeats: status tag, priority bar,
 * SLA tag, sentiment icon. Kept together so the colors are decided once.
 */
import React from "react";
import { Tag, Icon, Tooltip } from "antd";
import styled, { useTheme } from "styled-components";
import { useLabels } from "../../labels";

/* company priority 1..5 -> the colored bar on the ticket card */
const PRIORITY_COLORS: { [key: number]: string } = {
  1: "error",
  2: "accentOrange",
  3: "warning",
  4: "primary",
  5: "mutedText",
};

export const PriorityBar = styled.span<{ priority?: number }>`
  display: inline-block;
  width: 4px;
  align-self: stretch;
  min-height: 16px;
  border-radius: 2px;
  background: ${({ theme, priority }) =>
    (theme.colors as any)[PRIORITY_COLORS[priority || 5]] ||
    theme.colors.mutedText};
`;

export const StatusTag = ({
  statusName,
  openFlag,
}: {
  statusName?: string;
  openFlag?: string;
}) => {
  const theme = useTheme();
  if (!statusName) {
    return null;
  }
  return (
    <Tag color={openFlag === "N" ? theme.colors.success : theme.colors.primary}>
      {statusName}
    </Tag>
  );
};

export const PriorityTag = ({
  priority,
  priorityName,
}: {
  priority?: number;
  priorityName?: string;
}) => {
  const theme = useTheme();
  if (!priorityName) {
    return null;
  }
  const colorKey = PRIORITY_COLORS[priority || 5];
  return (
    <Tag color={(theme.colors as any)[colorKey] || theme.colors.mutedText}>
      {priorityName}
    </Tag>
  );
};

/* sla_state comes from etk_util_pkg.sla_state: late | near | ok */
export const SlaTag = ({ slaState }: { slaState?: string }) => {
  const theme = useTheme();
  const labels = useLabels();

  if (!slaState) {
    return null;
  }

  if (slaState === "late") {
    return <Tag color={theme.colors.error}>{labels("slaLate")}</Tag>;
  }
  if (slaState === "near") {
    return <Tag color={theme.colors.warningDark}>{labels("slaNear")}</Tag>;
  }
  return <Tag color={theme.colors.success}>{labels("slaOk")}</Tag>;
};

/* sentiment: A = angry, N = neutral, H = happy */
export const SentimentIcon = ({ sentiment }: { sentiment?: string }) => {
  const theme = useTheme();

  if (sentiment === "A") {
    return (
      <Tooltip title="angry">
        <Icon type="frown" style={{ color: theme.colors.error }} />
      </Tooltip>
    );
  }
  if (sentiment === "H") {
    return (
      <Tooltip title="happy">
        <Icon type="smile" style={{ color: theme.colors.success }} />
      </Tooltip>
    );
  }
  return null;
};
