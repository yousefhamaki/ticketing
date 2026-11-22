/*
 * Clients setup (management only).
 *
 * Left  : the client list, the same clients_data service the staff screens use.
 * Right : one client, loaded with etk_admin_pkg/client_data, which brings the
 *         branches, the module tick list, the contracts and the two reference
 *         lists in a single call.
 */
import React, { useCallback, useState } from "react";
import { Button, Icon, Input, Modal, Spin, Tabs, message } from "antd";
import {
  Flex,
  PageTitle,
  ShadowSection,
  SubText,
} from "../../../components/commons";
import { useBasicMutation, useBasicQuery } from "../../../hooks";
import { useLabels } from "../../../labels";
import ClientFormView from "./partials/ClientFormView";
import BranchesView from "./partials/BranchesView";
import ModulesView from "./partials/ModulesView";
import ContractsView from "./partials/ContractsView";
import { ClientPayloadType, ClientSetupType } from "./index.interface";

const EMPTY: ClientPayloadType = {
  data: [],
  branches: [],
  modules: [],
  contracts: [],
  branch_types: [],
  contract_levels: [],
};

const ClientsSetupPage = () => {
  const labels = useLabels();
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [payload, setPayload] = useState<ClientPayloadType>(EMPTY);
  const [form, setForm] = useState<Partial<ClientSetupType>>({});
  const [adding, setAdding] = useState(false);

  const { loading: listLoading, runQuery: runList } = useBasicQuery({
    apiId: "clients",
    params: { poffset: 0, poffset_step: 200 },
    callOnFirstRender: true,
    onResponse: ({ apiValues, error }) => {
      setList(!error && apiValues ? apiValues.data || [] : []);
    },
  });

  const { loading: oneLoading, runQuery: runOne } =
    useBasicQuery<ClientPayloadType>({
      apiId: "adminClient",
      onResponse: ({ apiValues, error }) => {
        const next = !error && apiValues ? { ...EMPTY, ...apiValues } : EMPTY;
        setPayload(next);
        setForm(next.data[0] || {});
      },
    });

  const { loading: saving, mutate: saveClient } = useBasicMutation({
    apiId: "adminClientDml",
  });

  const openClient = useCallback(
    (id: number) => {
      setClientId(id);
      runOne({ client_id: id });
    },
    [runOne],
  );

  const reloadOne = useCallback(() => {
    if (clientId) {
      runOne({ client_id: clientId });
    }
  }, [clientId, runOne]);

  const onSave = useCallback(async () => {
    const { apiValues, error } = await saveClient({
      record_status: clientId ? "u" : "n",
      client_id: clientId || undefined,
      ...form,
    });

    if (error) {
      message.error(error);
      return;
    }

    message.success(labels("saved"));
    const created = (apiValues.data || [])[0];
    runList({ search });

    if (!clientId && created) {
      setAdding(false);
      openClient(created.id);
    } else {
      reloadOne();
    }
  }, [saveClient, clientId, form, labels, runList, search, openClient, reloadOne]);

  const client = payload.data[0];

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px">
        <PageTitle>{labels("setupClients")}</PageTitle>
        <Button
          type="primary"
          onClick={() => {
            setAdding(true);
            setClientId(null);
            setForm({ env_type: "W", active_flag: "Y" });
          }}
        >
          <Icon type="plus" /> {labels("add")}
        </Button>
      </Flex>

      <Flex align="flex-start" gap={14}>
        <ShadowSection padding="10px" style={{ width: 280, flexShrink: 0 }}>
          <Input.Search
            allowClear
            placeholder={labels("search")}
            onSearch={(value) => {
              setSearch(value);
              runList({ search: value });
            }}
          />
          {listLoading ? <Spin style={{ marginTop: 10 }} /> : null}
          <div style={{ maxHeight: "65vh", overflow: "auto", marginTop: 8 }}>
            {list.map((item) => (
              <div
                key={item.client_id}
                onClick={() => openClient(item.client_id)}
                style={{
                  padding: "6px 8px",
                  cursor: "pointer",
                  fontWeight: item.client_id === clientId ? 600 : 400,
                }}
              >
                {item.client_name}
                <div>
                  <SubText>
                    {item.site_prefix} · {item.env_type === "W" ? "Web" : "Forms"}
                  </SubText>
                </div>
              </div>
            ))}
          </div>
        </ShadowSection>

        <div style={{ flex: 1, minWidth: 0 }}>
          {oneLoading ? <Spin /> : null}

          {client ? (
            <ShadowSection>
              <Tabs defaultActiveKey="client">
                <Tabs.TabPane tab={labels("client")} key="client">
                  <ClientFormView
                    value={form}
                    isNew={false}
                    saving={saving}
                    onChange={(next) => setForm({ ...form, ...next })}
                    onSave={onSave}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab={labels("branches")} key="branches">
                  <BranchesView
                    clientId={client.client_id}
                    branches={payload.branches}
                    branchTypes={payload.branch_types}
                    onReload={reloadOne}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab={labels("modules")} key="modules">
                  <ModulesView
                    clientId={client.client_id}
                    modules={payload.modules}
                    onReload={reloadOne}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab={labels("contracts")} key="contracts">
                  <ContractsView
                    clientId={client.client_id}
                    contracts={payload.contracts}
                    levels={payload.contract_levels}
                    onReload={reloadOne}
                  />
                </Tabs.TabPane>
              </Tabs>
            </ShadowSection>
          ) : (
            <ShadowSection>
              <SubText>{labels("noData")}</SubText>
            </ShadowSection>
          )}
        </div>
      </Flex>

      <Modal
        visible={adding}
        width={820}
        title={labels("add")}
        footer={null}
        onCancel={() => setAdding(false)}
      >
        <ClientFormView
          value={form}
          isNew
          saving={saving}
          onChange={(next) => setForm({ ...form, ...next })}
          onSave={onSave}
        />
      </Modal>
    </>
  );
};

export default ClientsSetupPage;
