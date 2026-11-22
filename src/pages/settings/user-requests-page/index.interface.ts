/*
 * One row of etk_user_request_pkg/user_requests_data.
 * Shared by the management screen and the client portal screen, so the two
 * never drift from what the service answers.
 */
export interface UserRequestRowType {
  total?: number;
  request_id: number;
  client_id: number;
  client_name?: string;
  branch_id?: number;
  branch_name?: string;
  user_name?: string;
  full_name_p: string;
  full_name_s?: string;
  full_name?: string;
  email?: string;
  mobile?: string;
  job_title?: string;
  language_id: number;
  notes?: string;
  /* P waiting · A approved · R refused · C cancelled by the client */
  status: string;
  status_name?: string;
  requested_by?: number;
  requested_by_name?: string;
  request_date?: string;
  decided_by_name?: string;
  decision_date?: string;
  reject_reason?: string;
  created_user_id?: number;
  created_user_name?: string;
}

/* One row of etk_user_request_pkg/client_admins_data. */
export interface ClientAdminRowType {
  total?: number;
  user_id: number;
  user_name: string;
  full_name?: string;
  email?: string;
  client_id: number;
  client_name?: string;
  branch_id?: number;
  branch_name?: string;
  active_flag: string;
  client_admin_flag: string;
}
