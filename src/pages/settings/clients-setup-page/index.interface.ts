export interface ClientSetupType {
  client_id: number;
  site_prefix: string;
  license_no?: string;
  description_p: string;
  description_s?: string;
  area?: string;
  env_type: string;
  support_team_id?: number;
  exsys_url?: string;
  active_flag: string;
  notes?: string;
}

export interface BranchType {
  branch_id: number;
  client_id: number;
  organization_no: string;
  description_p: string;
  description_s?: string;
  branch_type_code: string;
  branch_type_name?: string;
  weight?: number;
  city?: string;
  active_flag: string;
}

export interface ContractType {
  contract_id: number;
  client_id: number;
  contract_code: string;
  contract_year: number;
  level_code: string;
  level_name?: string;
  sla_factor_pct?: number;
  start_date: string;
  end_date: string;
  expired_flag: string;
  notes?: string;
}

export interface ClientPayloadType {
  data: ClientSetupType[];
  branches: BranchType[];
  modules: { module_id: string; module_name: string; selected: string }[];
  contracts: ContractType[];
  branch_types: { key: string; value: string; weight: number }[];
  contract_levels: { key: string; value: string; sla_factor_pct: number }[];
}
