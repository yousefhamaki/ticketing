/*
 * Client portal: new ticket.
 *
 * POST etk_ticket_pkg/ticket_dml  record_status = "n"
 * The branch and module lists are the client's own (the lookups service only
 * returns what this client has), and the EXSYS context fields are filled from
 * the URL when the ticket is opened from inside EXSYS:
 *   /portal/new?page=..&user=..&staff=..&error=..
 * A Forms 6i client signs in directly and sends no context, exactly as decided.
 */
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Button, Form, Input, Select, message } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { PageTitle, ShadowSection, SubText } from "../../../components/commons";
import { useBasicMutation, useContractStatus, useLookups } from "../../../hooks";
import { useAppConfig } from "../../../store";
import { useLabels } from "../../../labels";
import { PAGES_PATH_NAMES } from "../../../routes/constants";

const ClientNewTicketPage = () => {
  const labels = useLabels();
  const history = useHistory();
  const location = useLocation();
  const { user } = useAppConfig();
  const { lookups } = useLookups();
  const { status: contract } = useContractStatus();
  const canOpen = contract.can_open_ticket_flag !== "N";

  const context = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return {
      ctx_page_name: search.get("page") || "",
      ctx_user_name: search.get("user") || "",
      ctx_staff_id: search.get("staff") || "",
      ctx_error: search.get("error") || "",
    };
  }, [location.search]);

  const [form, setForm] = useState<{ [key: string]: any }>({
    branch_id: user?.branch_id,
    client_priority: 3,
  });
  const [error, setError] = useState("");

  const { loading, mutate } = useBasicMutation({ apiId: "ticketDml" });

  const onSubmit = useCallback(async () => {
    setError("");

    const { apiValues, error: apiError } = await mutate({
      record_status: "n",
      ...form,
      ...context,
    });

    if (apiError) {
      setError(apiError);
      return;
    }

    const created = (apiValues.data || [])[0];
    message.success(labels("saved"));
    history.push(
      created && created.ticket_id
        ? `/portal/tickets/${created.ticket_id}`
        : PAGES_PATH_NAMES.clientMyTickets,
    );
  }, [mutate, form, context, labels, history]);

  // a client user tied to one branch does not choose a branch
  const branches = lookups.branches;
  const types = lookups.types.filter(
    (type) => type.internal_only_flag !== "Y",
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <PageTitle>{labels("newTicket")}</PageTitle>
      <SubText>{user?.client_name}</SubText>

      <ShadowSection style={{ marginTop: 12 }}>
        {!canOpen ? (
          <Alert
            type="error"
            showIcon
            message={contract.message}
            style={{ marginBottom: 12 }}
          />
        ) : null}

        {error ? (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 12 }}
          />
        ) : null}

        {context.ctx_page_name ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message={`${labels("exsysContext")}: ${context.ctx_page_name}`}
            description={context.ctx_error || undefined}
          />
        ) : null}

        <Form layout="vertical">
          <Form.Item label={labels("title")} required>
            <Input
              value={form.title || ""}
              maxLength={200}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </Form.Item>

          <Form.Item label={labels("type")} required>
            <Select
              value={form.type_code}
              onChange={(value: string) =>
                setForm({ ...form, type_code: value })
              }
            >
              {types.map((type) => (
                <Select.Option key={type.key} value={String(type.key)}>
                  {type.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={labels("module")} required>
            <Select
              showSearch
              optionFilterProp="children"
              value={form.module_id}
              onChange={(value: string) =>
                setForm({ ...form, module_id: value })
              }
            >
              {lookups.modules.map((item) => (
                <Select.Option key={item.key} value={String(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {user?.role === "CLA" && branches.length > 1 ? (
            <Form.Item label={labels("branch")} required>
              <Select
                value={form.branch_id}
                onChange={(value: number) =>
                  setForm({ ...form, branch_id: value })
                }
              >
                {branches.map((branch) => (
                  <Select.Option key={branch.key} value={Number(branch.key)}>
                    {branch.value}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}

          <Form.Item label={labels("clientPriority")}>
            <Select
              value={form.client_priority}
              onChange={(value: number) =>
                setForm({ ...form, client_priority: value })
              }
            >
              {lookups.priorities.map((item) => (
                <Select.Option key={item.key} value={Number(item.key)}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={labels("description")} required>
            <Input.TextArea
              rows={5}
              value={form.description || ""}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </Form.Item>

          <Form.Item label={labels("expectedResult")}>
            <Input.TextArea
              rows={2}
              value={form.expected_result || ""}
              onChange={(event) =>
                setForm({ ...form, expected_result: event.target.value })
              }
            />
          </Form.Item>

          <Form.Item label={labels("actualResult")}>
            <Input.TextArea
              rows={2}
              value={form.actual_result || ""}
              onChange={(event) =>
                setForm({ ...form, actual_result: event.target.value })
              }
            />
          </Form.Item>

          <Button
            type="primary"
            loading={loading}
            disabled={
              !canOpen ||
              !form.title ||
              !form.description ||
              !form.type_code ||
              !form.module_id
            }
            onClick={onSubmit}
          >
            {labels("send")}
          </Button>
        </Form>
      </ShadowSection>
    </div>
  );
};

export default ClientNewTicketPage;
