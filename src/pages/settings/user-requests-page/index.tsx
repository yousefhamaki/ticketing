/*
 * User requests (management only).
 *
 * A client does not create its own users: the client manager sends a request
 * from the portal, and management approves or refuses it HERE.
 *
 * Two tabs:
 *   requests         - approve (the user is created with a one-time password)
 *                      or refuse (with a reason the client can read)
 *   client managers  - who, at each client, is allowed to send requests
 *
 * Every rule is in ETK_USER_REQUEST_PKG; a non management caller gets -20812.
 */
import React, { useState } from "react";
import { Tabs } from "antd";
import { PageTitle, ShadowSection } from "../../../components/commons";
import { useLabels } from "../../../labels";
import RequestsView from "./partials/RequestsView";
import ClientManagersView from "./partials/ClientManagersView";

const UserRequestsSetupPage = () => {
  const labels = useLabels();
  const [tab, setTab] = useState("requests");

  return (
    <>
      <PageTitle>{labels("userRequests")}</PageTitle>

      <ShadowSection style={{ marginTop: 12 }}>
        <Tabs activeKey={tab} onChange={setTab}>
          <Tabs.TabPane tab={labels("userRequests")} key="requests" />
          <Tabs.TabPane tab={labels("clientManagers")} key="managers" />
        </Tabs>

        {/* mounted only when shown: each tab asks the server when it opens */}
        {tab === "requests" ? <RequestsView /> : <ClientManagersView />}
      </ShadowSection>
    </>
  );
};

export default UserRequestsSetupPage;
