/*
 * API_IDS: one place that maps a short id used by the screens to the ORDS
 * resource, exactly like `@app-structure/api-constants` in cure-plus-fe.
 * A screen never writes a URL; it passes an apiId to the query / mutation hook.
 *
 * Services are the 14 defined by ETKT_03_PACKAGES_20261121.sql
 * (/ords/etkt/<package>/<procedure>).
 */
export const API_IDS = {
  // security
  login: "etk_security_pkg/login_dml",
  logout: "etk_security_pkg/logout_dml",
  changePassword: "etk_security_pkg/change_password_dml",
  me: "etk_security_pkg/me_data",
  // lookups
  lookups: "etk_lookup_pkg/lookups_data",
  clients: "etk_lookup_pkg/clients_data",
  // tickets
  tickets: "etk_ticket_pkg/tickets_data",
  ticket: "etk_ticket_pkg/ticket_data",
  ticketDml: "etk_ticket_pkg/ticket_dml",
  ticketAction: "etk_ticket_pkg/ticket_action_dml",
  message: "etk_ticket_pkg/message_dml",
  // escalation and notifications
  escalation: "etk_escalation_pkg/escalation_data",
  notifications: "etk_escalation_pkg/notifications_data",
  notificationDml: "etk_escalation_pkg/notification_dml",
  // setup (admin) - management only, script ETKT_06
  adminClient: "etk_admin_pkg/client_data",
  adminClientDml: "etk_admin_pkg/client_dml",
  adminBranchDml: "etk_admin_pkg/branch_dml",
  adminClientModuleDml: "etk_admin_pkg/client_module_dml",
  adminContractDml: "etk_admin_pkg/contract_dml",
  adminUsers: "etk_admin_pkg/users_data",
  adminUserDml: "etk_admin_pkg/user_dml",
  adminUserActionDml: "etk_admin_pkg/user_action_dml",
  adminTeams: "etk_admin_pkg/teams_data",
  adminTeamDml: "etk_admin_pkg/team_dml",
  adminFunctionDml: "etk_admin_pkg/function_dml",
  adminOncallDml: "etk_admin_pkg/oncall_dml",
  // setup part 2 - rules, workflow, general settings (script ETKT_07)
  slaSetup: "etk_admin2_pkg/sla_data",
  priorityDml: "etk_admin2_pkg/priority_dml",
  contractLevelDml: "etk_admin2_pkg/contract_level_dml",
  escalationLevelDml: "etk_admin2_pkg/escalation_level_dml",
  workDayDml: "etk_admin2_pkg/work_day_dml",
  holidayDml: "etk_admin2_pkg/holiday_dml",
  workflowSetup: "etk_admin2_pkg/workflow_data",
  statusDml: "etk_admin2_pkg/status_dml",
  statusNextDml: "etk_admin2_pkg/status_next_dml",
  statusFieldDml: "etk_admin2_pkg/status_field_dml",
  ticketTypeDml: "etk_admin2_pkg/ticket_type_dml",
  rootCauseDml: "etk_admin2_pkg/root_cause_dml",
  cannedReplyDml: "etk_admin2_pkg/canned_reply_dml",
  generalSetup: "etk_admin2_pkg/general_data",
  settingDml: "etk_admin2_pkg/setting_dml",
  moduleDml: "etk_admin2_pkg/module_dml",
  osDml: "etk_admin2_pkg/os_dml",
  branchTypeDml: "etk_admin2_pkg/branch_type_dml",
  aiModelDml: "etk_admin2_pkg/ai_model_dml",
  // statistics, phase 1 (script ETKT_08)
  dashboard: "etk_stats_pkg/dashboard_data",
  // maintenance contract state - the client portal banner
  contractStatus: "etk_contract_pkg/contract_status_data",
  // client user requests (script ETKT_09): the client manager asks for a
  // user, management approves or refuses
  requestRights: "etk_user_request_pkg/request_rights_data",
  userRequests: "etk_user_request_pkg/user_requests_data",
  userRequestDml: "etk_user_request_pkg/user_request_dml",
  userRequestActionDml: "etk_user_request_pkg/user_request_action_dml",
  clientAdmins: "etk_user_request_pkg/client_admins_data",
  clientAdminDml: "etk_user_request_pkg/client_admin_dml",
  // languages (script ETKT_11, 23-11-2026): no authorization, the login page needs them
  languages: "etk_language_pkg/languages_data",
  labels: "etk_language_pkg/labels_data",
} as const;

export type ApiIdType = keyof typeof API_IDS;

/* Error codes raised by the packages that the UI must react to. */
export const ERROR_CODES = {
  SESSION_EXPIRED: -20800,
  BAD_CREDENTIALS: -20801,
  ACCOUNT_LOCKED: -20802,
  MUST_CHANGE_PASSWORD: -20803,
  BAD_BODY: -20810,
  NOT_ALLOWED: -20812,
  BUSINESS_RULE: -20813,
  // the contract trigger refuses a client ticket when the contract is stopped
  CONTRACT_BLOCKED: -20814,
};
