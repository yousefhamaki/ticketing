import React from "react";
import { Timeline } from "antd";
import { SubText } from "../../../components/commons";
import { useLabels } from "../../../labels";
import { HistoryType } from "../index.interface";

const HistoryView = ({ history }: { history: HistoryType[] }) => {
  const labels = useLabels();

  if (!history.length) {
    return <SubText>{labels("noData")}</SubText>;
  }

  return (
    <Timeline>
      {history.map((item) => (
        <Timeline.Item key={item.history_id}>
          <strong>{item.action_code}</strong>
          {item.status_before || item.status_after ? (
            <span>
              {" "}
              {item.status_before} &rarr; {item.status_after}
            </span>
          ) : null}
          <div>
            <SubText>
              {item.action_by} · {item.action_date}
            </SubText>
          </div>
          {item.notes ? <div>{item.notes}</div> : null}
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default HistoryView;
