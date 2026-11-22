/*
 * One place for the paths, like `@app-structure/routes` in cure-plus-fe.
 * Internal portal and client portal are two separate path groups so a client
 * user can never land on a staff screen by typing a URL.
 */
export const PAGES_PATH_NAMES = {
  login: "/login",
  changePassword: "/change-password",
  // internal portal (staff)
  home: "/home",
  tickets: "/tickets",
  ticketDetails: "/tickets/:ticketId",
  escalation: "/escalation",
  notifications: "/notifications",
  clients: "/clients",
  // setup (management only)
  setupClients: "/setup/clients",
  setupUsers: "/setup/users",
  setupTeams: "/setup/teams",
  setupSla: "/setup/sla",
  setupWorkflow: "/setup/workflow",
  setupGeneral: "/setup/general",
  setupUserRequests: "/setup/user-requests",
  // client portal
  clientHome: "/portal",
  clientNewTicket: "/portal/new",
  clientMyTickets: "/portal/tickets",
  clientTicketDetails: "/portal/tickets/:ticketId",
  clientUserRequests: "/portal/user-requests",
};

export const ticketPath = (ticketId: number | string, isClient?: boolean) =>
  isClient ? `/portal/tickets/${ticketId}` : `/tickets/${ticketId}`;
