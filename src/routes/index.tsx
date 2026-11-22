/*
 * Routing + the role guard.
 *
 * Rules (same table as the packages enforce server side):
 *   staff  (MGT / SUP / AGT / DEV) -> internal portal
 *   client (CLA / CLU)             -> client portal only
 * The server checks it too; this only keeps the UI honest.
 */
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { PAGES_PATH_NAMES } from "./constants";
import { isManagement, isStaffUser, useAppConfig } from "../store";
import AppLayout from "../components/app-layout";
import LoginPage from "../pages/login-page";
import ChangePasswordPage from "../pages/change-password-page";
import DashboardPage from "../pages/dashboard-page";
import TicketsPage from "../pages/tickets-page";
import TicketDetailsPage from "../pages/ticket-details-page";
import EscalationPage from "../pages/escalation-page";
import NotificationsPage from "../pages/notifications-page";
import ClientsPage from "../pages/clients-page";
import ClientsSetupPage from "../pages/settings/clients-setup-page";
import UsersSetupPage from "../pages/settings/users-setup-page";
import TeamsSetupPage from "../pages/settings/teams-setup-page";
import SlaSetupPage from "../pages/settings/sla-setup-page";
import WorkflowSetupPage from "../pages/settings/workflow-setup-page";
import GeneralSetupPage from "../pages/settings/general-setup-page";
import ClientNewTicketPage from "../pages/client-portal/new-ticket-page";
import ClientMyTicketsPage from "../pages/client-portal/my-tickets-page";
import UserRequestsSetupPage from "../pages/settings/user-requests-page";
import ClientUserRequestsPage from "../pages/client-portal/user-requests-page";

const AppRoutes = () => {
  const { authorization, user } = useAppConfig();

  if (!authorization || !user) {
    return (
      <Switch>
        <Route path={PAGES_PATH_NAMES.login} component={LoginPage} />
        <Redirect to={PAGES_PATH_NAMES.login} />
      </Switch>
    );
  }

  // a user with the initial password can reach nothing but this screen,
  // because every other service answers -20803 until the password changes
  if (user.must_change_pwd_flag === "Y") {
    return (
      <Switch>
        <Route
          path={PAGES_PATH_NAMES.changePassword}
          component={ChangePasswordPage}
        />
        <Redirect to={PAGES_PATH_NAMES.changePassword} />
      </Switch>
    );
  }

  const staff = isStaffUser(user);
  const management = isManagement(user);

  return (
    <AppLayout>
      <Switch>
        <Route
          exact
          path={PAGES_PATH_NAMES.changePassword}
          component={ChangePasswordPage}
        />
        {staff ? (
          <Route exact path={PAGES_PATH_NAMES.home} component={DashboardPage} />
        ) : null}
        {staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.tickets}
            component={TicketsPage}
          />
        ) : null}
        {staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.ticketDetails}
            component={TicketDetailsPage}
          />
        ) : null}
        {staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.escalation}
            component={EscalationPage}
          />
        ) : null}
        {staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.notifications}
            component={NotificationsPage}
          />
        ) : null}
        {staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.clients}
            component={ClientsPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupClients}
            component={ClientsSetupPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupUsers}
            component={UsersSetupPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupTeams}
            component={TeamsSetupPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupSla}
            component={SlaSetupPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupWorkflow}
            component={WorkflowSetupPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupGeneral}
            component={GeneralSetupPage}
          />
        ) : null}
        {management ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.setupUserRequests}
            component={UserRequestsSetupPage}
          />
        ) : null}
        {/* open to every client user on purpose: only the SERVER knows who
            the client manager is, and it answers -20812 to anybody else */}
        {!staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.clientUserRequests}
            component={ClientUserRequestsPage}
          />
        ) : null}
        {!staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.clientNewTicket}
            component={ClientNewTicketPage}
          />
        ) : null}
        {!staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.clientMyTickets}
            component={ClientMyTicketsPage}
          />
        ) : null}
        {!staff ? (
          <Route
            exact
            path={PAGES_PATH_NAMES.clientTicketDetails}
            component={TicketDetailsPage}
          />
        ) : null}
        <Redirect
          to={
            staff ? PAGES_PATH_NAMES.home : PAGES_PATH_NAMES.clientMyTickets
          }
        />
      </Switch>
    </AppLayout>
  );
};

export default AppRoutes;
