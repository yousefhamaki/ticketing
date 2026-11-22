/*
 * The conversation, and the reply box with its two tabs:
 *   "Reply to client"  -> client_visible_flag = Y
 *   "Internal note"    -> client_visible_flag = N (the default on the server)
 * A client user only ever sees the Y messages, because the server filters them
 * out of the payload, not the screen.
 */
import React, { useCallback, useState } from "react";
import { Button, Icon, Select, Tabs, message as antMessage } from "antd";
import styled, { useTheme } from "styled-components";
import { Flex, SubText } from "../../../components/commons";
import { useBasicMutation, useLookups } from "../../../hooks";
import { useLabels } from "../../../labels";
import { MessageType } from "../index.interface";

const Bubble = styled.div<{ internal?: boolean; mine?: boolean }>`
  border: 1px solid
    ${({ theme, internal }) =>
      internal ? theme.colors.warningDark : theme.colors.borderLight};
  background: ${({ theme, internal }) =>
    internal ? theme.colors.warningBackground : theme.colors.background};
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
  white-space: pre-wrap;
  word-break: break-word;
`;

interface Props {
  ticketId: number;
  messages: MessageType[];
  isStaff: boolean;
  canWrite: boolean;
  onSent: () => void;
}

const ConversationView = ({
  ticketId,
  messages,
  isStaff,
  canWrite,
  onSent,
}: Props) => {
  const labels = useLabels();
  const theme = useTheme();
  const { lookups } = useLookups();
  const [tab, setTab] = useState("client");
  const [body, setBody] = useState("");

  const { loading, mutate } = useBasicMutation({ apiId: "message" });

  const onSend = useCallback(async () => {
    if (!body.trim()) {
      return;
    }

    const { error } = await mutate({
      record_status: "n",
      ticket_id: ticketId,
      body,
      client_visible_flag: tab === "client" ? "Y" : "N",
    });

    if (error) {
      antMessage.error(error);
      return;
    }

    setBody("");
    onSent();
  }, [mutate, body, ticketId, tab, onSent]);

  return (
    <div>
      {messages.map((item) => (
        <Bubble
          key={item.message_id}
          internal={item.client_visible_flag === "N"}
        >
          <Flex justify="space-between" margin="0 0 4px">
            <strong style={{ color: theme.colors.headingText }}>
              {item.author_name}
              {item.author_kind === "A" ? (
                <Icon type="robot" style={{ marginInlineStart: 6 }} />
              ) : null}
            </strong>
            <SubText>{item.message_date}</SubText>
          </Flex>
          <div>{item.body}</div>
          {item.ai_article_id ? (
            <SubText>article #{item.ai_article_id}</SubText>
          ) : null}
        </Bubble>
      ))}

      {!messages.length ? <SubText>{labels("noData")}</SubText> : null}

      {canWrite ? (
        <div style={{ marginTop: 14 }}>
          <Tabs activeKey={tab} onChange={setTab} size="small">
            <Tabs.TabPane tab={labels("reply")} key="client" />
            {isStaff ? (
              <Tabs.TabPane tab={labels("internalNote")} key="internal" />
            ) : null}
          </Tabs>

          {isStaff && lookups.canned_replies.length ? (
            <Select
              showSearch
              optionFilterProp="children"
              style={{ width: "100%", marginBottom: 8 }}
              placeholder={labels("cannedReply")}
              onChange={(key: string) => {
                const found = lookups.canned_replies.find(
                  (reply) => String(reply.key) === String(key),
                );
                if (found) {
                  setBody(found.body || found.value);
                }
              }}
            >
              {lookups.canned_replies.map((reply) => (
                <Select.Option key={reply.key} value={String(reply.key)}>
                  {reply.value}
                </Select.Option>
              ))}
            </Select>
          ) : null}

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.inputBackground,
              color: theme.colors.text,
            }}
          />

          <Button
            type="primary"
            loading={loading}
            disabled={!body.trim()}
            onClick={onSend}
            style={{ marginTop: 8 }}
          >
            {labels("send")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ConversationView;
