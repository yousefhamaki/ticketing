export interface TicketType {
  ticket_id: number;
  title: string;
  description?: string;
  expected_result?: string;
  actual_result?: string;
  internal_flag?: string;
  channel?: string;
  client_id?: number;
  client_name?: string;
  env_type?: string;
  branch_id?: number;
  branch_name?: string;
  organization_no?: string;
  type_code?: string;
  type_name?: string;
  module_id?: string;
  module_name?: string;
  client_priority?: number;
  company_priority?: number;
  status_code?: string;
  status_name?: string;
  open_flag?: string;
  team_id?: number;
  team_name?: string;
  assignee_user_id?: number;
  assignee_name?: string;
  created_user_id?: number;
  created_by_name?: string;
  created_by_email?: string;
  submitted_date?: string;
  accepted_date?: string;
  resolved_date?: string;
  closed_date?: string;
  due_date?: string;
  accept_due_ext?: string;
  resolve_due_ext?: string;
  accept_due_int?: string;
  resolve_due_int?: string;
  home_team_id?: number;
  need_assign_flag?: string;
  esc_level?: number;
  esc_next_date?: string;
  sentiment?: string;
  contract_expired_flag?: string;
  problem_id?: number;
  root_cause_id?: number;
  block_reason?: string;
  resolution_note?: string;
  cancel_reason?: string;
  merged_into_ticket_id?: number;
  env_device?: string;
  os_code?: string;
  env_browser?: string;
  release_number?: string;
  ctx_page_name?: string;
  ctx_user_name?: string;
  ctx_staff_id?: string;
  ctx_error?: string;
  need_cost_flag?: string;
  estimated_cost?: number;
  approved_cost?: number;
  rating?: number;
  client_comment?: string;
}

export interface MessageType {
  message_id: number;
  author_kind: string;
  author_user_id?: number;
  author_name?: string;
  body: string;
  client_visible_flag: string;
  channel?: string;
  ai_article_id?: number;
  message_date: string;
}

export interface HistoryType {
  history_id: number;
  action_code: string;
  status_before?: string;
  status_after?: string;
  old_value?: string;
  new_value?: string;
  notes?: string;
  action_by?: string;
  action_date: string;
}

export interface TicketPayloadType {
  data: TicketType[];
  messages: MessageType[];
  history: HistoryType[];
  attachments: any[];
  next_statuses: { key: string; value: string }[];
  assignees: any[];
  other_viewers: { user_id: number; user_name: string; last_seen_date: string }[];
}
