/* The saved views the server understands on tickets_data (p_view). */
export const TICKET_VIEWS = [
  { key: "open", labelKey: "viewOpen" },
  { key: "mine", labelKey: "viewMine" },
  { key: "unaccepted", labelKey: "viewUnaccepted" },
  { key: "need_assign", labelKey: "viewNeedAssign" },
  { key: "breach", labelKey: "viewBreach" },
  { key: "angry", labelKey: "viewAngry" },
  { key: "closed", labelKey: "viewClosed" },
  { key: "all", labelKey: "viewAll" },
] as const;

export const PAGE_SIZE = 25;
