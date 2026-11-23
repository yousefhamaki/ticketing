/*
 * Ticket history (staff only).
 *
 * 23-11-2026
 *   OLD    : raw codes - "TRANSFER I -> I", "ESCALATE", "Automatic escalation",
 *            and an empty name before the date for the escalation job.
 *   NEW    : the action in words, statuses by name, old -> new value when there
 *            is one, "System" when the job did it.
 *   REASON : the review of 23-11-2026 (owner's account).
 *   BENEFIT: the history reads as sentences in every language.
 */
import React from "react";
import { Timeline } from "antd";
import { SubText } from "../../../components/commons";
import { useLabels } from "../../../labels";
import { useLookups } from "../../../hooks";
import { HistoryType } from "../index.interface";

/* ETK_TICKET_HISTORY.ACTION_CODE -> label key */
const ACTIONS: { [code: string]: string } = {
  ACCEPT: "actAccept",
  STATUS: "actStatus",
  TRANSFER: "actTransfer",
  ASSIGN: "actAssign",
  MERGE: "actMerge",
  PRIORITY: "actPriority",
  ESCALATE: "actEscalate",
  COST: "actCost",
  PROBLEM: "actProblem",
};

const HistoryView = ({ history }: { history: HistoryType[] }) => {
  const labels = useLabels();
  const { lookups } = useLookups();

  if (!history.length) {
    return <SubText>{labels("noData")}</SubText>;
  }

  const statusName = (code?: string) => {
    if (!code) {
      return "";
    }
    const found = lookups.statuses.find((item) => String(item.key) === code);
    return found ? found.value : code;
  };

  const notes = (text?: string) =>
    text === "Automatic escalation" ? labels("autoEscalation") : text;

  return (
    <Timeline>
      {history.map((item) => {
        const statusMove =
          (item.status_before || item.status_after) &&
          item.status_before !== item.status_after;
        const valueMove =
          item.action_code === "ESCALATE" ||
          item.action_code === "PRIORITY" ||
          item.action_code === "COST";
        return (
          <Timeline.Item key={item.history_id}>
            <strong>
              {ACTIONS[item.action_code]
                ? labels(ACTIONS[item.action_code])
                : item.action_code}
            </strong>
            {statusMove ? (
              <span>
                {" : "}
                {statusName(item.status_before)} &rarr;{" "}
                {statusName(item.status_after)}
              </span>
            ) : null}
            {!statusMove && valueMove && (item.old_value || item.new_value) ? (
              <span>
                {" : "}
                {item.old_value || "-"} &rarr; {item.new_value || "-"}
              </span>
            ) : null}
            <div>
              <SubText>
                {item.action_by || labels("systemActor")} · {item.action_date}
              </SubText>
            </div>
            {item.notes ? <div>{notes(item.notes)}</div> : null}
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default HistoryView;
