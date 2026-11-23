/*
 * Labels.
 *
 * cure-plus-fe reads its labels from the database through LabelsProvider. The
 * ticketing app has no labels table yet, so the dictionary lives here with the
 * same `useLabels()` shape: when the table is added, only this file changes.
 * 1 = English, 2 = Arabic (EXSYS08 ids), same as `planguageid` on every service.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMakeSelectCurrentLanguageId } from "../store";
import { getRequest } from "../api";

const LABELS: { [key: string]: [string, string] } = {
  appName: ["EXSYS Ticketing System", "نظام تيكتات اكسس"],
  // login
  userName: ["User name", "اسم المستخدم"],
  password: ["Password", "كلمة المرور"],
  login: ["Sign in", "دخول"],
  logout: ["Sign out", "خروج"],
  oldPassword: ["Current password", "كلمة المرور الحالية"],
  newPassword: ["New password", "كلمة المرور الجديدة"],
  confirmPassword: ["Confirm new password", "تأكيد كلمة المرور الجديدة"],
  changePassword: ["Change password", "تغيير كلمة المرور"],
  mustChangePassword: [
    "You must change your password before using the system.",
    "يجب تغيير كلمة المرور قبل استخدام النظام.",
  ],
  passwordsDoNotMatch: ["The two passwords differ.", "كلمتا المرور غير متطابقتين."],
  passwordTooShort: [
    "The password must be at least 8 characters.",
    "كلمة المرور 8 حروف على الأقل.",
  ],
  // login page and app shell (23-11-2026, new Cure+ look)
  welcomeBack: ["Welcome back", "مرحباً بعودتك"],
  signInToContinue: ["Please sign in to continue.", "سجّل الدخول للمتابعة."],
  heroTitle1: ["EXSYS Support", "دعم اكسس"],
  heroTitle2: ["Ticketing System", "نظام التيكتات"],
  heroText: [
    "One place for client requests, internal tasks and follow-up, with clear response times for every ticket.",
    "مكان واحد لطلبات العملاء والمهام الداخلية ومتابعتها، بمواعيد استجابة واضحة لكل تيكت.",
  ],
  featSupport: ["Client support", "دعم العملاء"],
  featSla: ["SLA follow-up", "متابعة الـ SLA"],
  featAi: ["AI assistant", "مساعد ذكي"],
  featSecure: ["Secure access", "دخول آمن"],
  rightsReserved: [
    "All rights reserved © Exsys Solutions",
    "جميع الحقوق محفوظة © Exsys Solutions",
  ],
  managementRole: ["Management", "الإدارة"],
  // 23-11-2026 (script ETKT_12): company board, internal task, codes shown as words
  companyScope: ["Company", "الشركة"],
  allTeams: ["All teams", "كل الفرق"],
  topClients: ["Clients with the most tickets", "العملاء الأكثر تيكتات"],
  newTask: ["New internal task", "تاسك داخلي جديد"],
  taskCreated: ["The task was created.", "تم إنشاء التاسك."],
  dueDate: ["Due date", "تاريخ الاستحقاق"],
  date: ["Date", "التاريخ"],
  clientReply: ["Reply", "رد"],
  actAccept: ["Accepted", "تم الاستلام"],
  actStatus: ["Status changed", "تغيير الحالة"],
  actTransfer: ["Transferred", "تحويل"],
  actAssign: ["Assigned", "توزيع"],
  actMerge: ["Merged", "دمج"],
  actPriority: ["Priority changed", "تغيير الأولوية"],
  actEscalate: ["Escalated", "تصعيد"],
  actCost: ["Cost changed", "تغيير التكلفة"],
  actProblem: ["Linked to a problem", "ربط بمشكلة"],
  autoEscalation: ["Automatic escalation", "تصعيد تلقائي"],
  systemActor: ["System", "النظام"],
  ntNew: ["New ticket", "تيكت جديد"],
  ntEscalate: ["Escalation", "تصعيد"],
  ntAssign: ["Assigned to you", "مسند إليك"],
  ntTransfer: ["Transfer", "تحويل"],
  ntReply: ["Reply", "رد"],
  ntReject: ["Solution refused", "رفض الحل"],
  ntContract: ["Contract", "العقد"],
  ntContractWarn: ["Contract ending", "العقد قارب على الانتهاء"],
  ntContractStop: ["Support stopped", "وقف الدعم"],
  ntUserRequest: ["User request", "طلب مستخدم"],
  ntUserRequestOk: ["Request approved", "تمت الموافقة على الطلب"],
  ntUserRequestNo: ["Request refused", "تم رفض الطلب"],
  inputText: ["Text", "نص"],
  inputList: ["List", "قائمة"],
  hintTransitions: ["A status with no way out would leave its tickets stuck, so its last move cannot be removed.", "الحالة التي ليس لها مخرج ستُعلّق تيكتاتها، لذلك لا يمكن حذف آخر انتقال منها."],
  hintSettings: ["The packages read these values while they run; each value is checked before it is saved.", "تقرأ الباكدجات هذه القيم أثناء التشغيل، وتُراجَع كل قيمة قبل الحفظ."],
  hintModules: ["The module id is the same as in the EXSYS menu (EX_PAGE_MASTER).", "رقم الموديول هو نفسه الموجود في قائمة اكسس (EX_PAGE_MASTER)."],
  hintBranchTypes: ["The weight divides the number of tickets in every comparison between clients.", "يُقسَم عدد التيكتات على الوزن في كل مقارنة بين العملاء."],
  hintAiModels: ["Each purpose has one default model only.", "لكل غرض موديل افتراضي واحد فقط."],
  internalSla: ["Internal SLA", "الـ SLA الداخلي"],
  escMode: ["Escalation mode", "طريقة التصعيد"],
  escModeFixed: ["Fixed minutes", "دقائق ثابتة"],
  escModePct: ["Share of the SLA", "نسبة من الـ SLA"],
  // navigation
  home: ["Home", "الرئيسية"],
  tickets: ["Tickets", "التيكتات"],
  escalation: ["Escalation", "التصعيد"],
  notifications: ["Notifications", "التنبيهات"],
  clients: ["Clients", "العملاء"],
  newTicket: ["New ticket", "تيكت جديد"],
  myTickets: ["My tickets", "تيكتاتي"],
  // ticket fields
  ticketNo: ["Ticket", "رقم التيكت"],
  title: ["Title", "العنوان"],
  description: ["Description", "الوصف"],
  expectedResult: ["Expected result", "النتيجة المتوقعة"],
  actualResult: ["Actual result", "النتيجة الفعلية"],
  type: ["Type", "النوع"],
  module: ["Module", "الموديول"],
  client: ["Client", "العميل"],
  branch: ["Branch", "الفرع"],
  priority: ["Priority", "الأولوية"],
  clientPriority: ["Client priority", "أولوية العميل"],
  companyPriority: ["Company priority", "أولوية الشركة"],
  status: ["Status", "الحالة"],
  team: ["Team", "الفريق"],
  assignee: ["Assignee", "الموظف"],
  createdBy: ["Opened by", "فتحه"],
  submittedDate: ["Opened", "تاريخ الفتح"],
  acceptDue: ["Accept due", "موعد الاستلام"],
  resolveDue: ["Resolve due", "موعد الحل"],
  rootCause: ["Root cause", "السبب الجذري"],
  resolutionNote: ["Resolution", "وصف الحل"],
  blockReason: ["Blocking reason", "سبب التوقف"],
  cancelReason: ["Cancel reason", "سبب الإلغاء"],
  rating: ["Rating", "التقييم"],
  clientComment: ["Your comment", "تعليقك"],
  exsysContext: ["EXSYS context", "سياق اكسس"],
  page: ["Screen", "الشاشة"],
  exsysUser: ["EXSYS user", "مستخدم اكسس"],
  errorMessage: ["Error message", "رسالة الخطأ"],
  // actions
  accept: ["Accept", "استلام"],
  changeStatus: ["Change status", "تغيير الحالة"],
  transfer: ["Transfer", "تحويل"],
  assign: ["Assign", "توزيع"],
  merge: ["Merge", "دمج"],
  setPriority: ["Company priority", "أولوية الشركة"],
  reply: ["Reply to client", "رد للعميل"],
  internalNote: ["Internal note", "ملاحظة داخلية"],
  send: ["Send", "إرسال"],
  save: ["Save", "حفظ"],
  cancel: ["Cancel", "إلغاء"],
  search: ["Search", "بحث"],
  refresh: ["Refresh", "تحديث"],
  cannedReply: ["Canned reply", "رد جاهز"],
  mergeInto: ["Merge into ticket", "دمج في تيكت رقم"],
  notes: ["Notes", "ملاحظات"],
  conversation: ["Conversation", "المحادثة"],
  history: ["History", "السجل"],
  attachments: ["Attachments", "المرفقات"],
  properties: ["Properties", "الخصائص"],
  // views
  viewAll: ["All", "الكل"],
  viewOpen: ["Open", "المفتوحة"],
  viewClosed: ["Closed", "المغلقة"],
  viewMine: ["Mine", "تيكتاتي"],
  viewUnaccepted: ["Not accepted", "لم تُستلم"],
  viewBreach: ["SLA breached", "تجاوزت الـ SLA"],
  viewAngry: ["Angry clients", "عملاء غاضبون"],
  viewNeedAssign: ["Needs assigning", "تنتظر التوزيع"],
  // misc
  minutesLeft: ["Minutes left", "الدقائق الباقية"],
  escLevel: ["Escalation level", "مستوى التصعيد"],
  oncall: ["On call", "المناوب"],
  markAllRead: ["Mark all as read", "تعليم الكل كمقروء"],
  unread: ["Unread", "غير مقروء"],
  noData: ["Nothing to show", "لا توجد بيانات"],
  saved: ["Saved", "تم الحفظ"],
  loading: ["Loading...", "جاري التحميل..."],
  sessionExpired: ["Your session has ended. Sign in again.", "انتهت الجلسة. سجّل الدخول من جديد."],
  contractExpired: ["Support contract expired", "عقد الدعم منتهي"],
  sla: ["SLA", "الـ SLA"],
  slaLate: ["Late", "متأخر"],
  slaNear: ["Due soon", "قرب الموعد"],
  slaOk: ["On time", "في الموعد"],
  language: ["العربية", "English"],
  theme: ["Theme", "المظهر"],
  total: ["Total", "الإجمالي"],
  // setup
  setup: ["Setup", "الإعدادات"],
  setupClients: ["Clients setup", "إعداد العملاء"],
  setupUsers: ["Users", "المستخدمون"],
  setupTeams: ["Teams and functions", "الفرق والوظائف"],
  teams: ["Teams", "الفرق"],
  trend: ["Opened and resolved per day", "المفتوح والمحلول كل يوم"],
  opened: ["Opened", "المفتوحة"],
  resolvedLabel: ["Resolved", "المحلولة"],
  avgResolve: ["Average resolve", "متوسط الحل"],
  hoursShort: ["h", "س"],
  daysShort: ["days", "يوم"],
  setupSla: ["SLA and escalation", "الـ SLA والتصعيد"],
  setupWorkflow: ["Workflow", "سير العمل"],
  setupGeneral: ["General settings", "الإعدادات العامة"],
  priorities: ["Priorities", "الأولويات"],
  contractLevels: ["Contract levels", "مستويات العقود"],
  escalationLadder: ["Escalation ladder", "سلسلة التصعيد"],
  workingHours: ["Working hours", "ساعات العمل"],
  holidays: ["Holidays", "الإجازات"],
  acceptMinutes: ["Pickup (minutes)", "الاستلام (دقائق)"],
  resolveMinutes: ["Resolve (minutes)", "الحل (دقائق)"],
  roundClock: ["Round the clock", "على مدار الساعة"],
  escalates: ["Escalates", "يتصعّد"],
  slaFactor: ["SLA factor %", "نسبة الـ SLA %"],
  levelNo: ["Step", "الخطوة"],
  target: ["Goes to", "يروح لمين"],
  fixedWait: ["Fixed wait (min)", "انتظار ثابت (د)"],
  waitPct: ["Share of SLA %", "نسبة من الـ SLA %"],
  workDay: ["Day", "اليوم"],
  isWorkDay: ["Working day", "يوم عمل"],
  fromTime: ["From", "من"],
  toTime: ["To", "إلى"],
  holidayDate: ["Date", "التاريخ"],
  statuses: ["Statuses", "الحالات"],
  transitions: ["Allowed moves", "الانتقالات المسموحة"],
  mandatoryFields: ["Mandatory fields", "الحقول الإلزامية"],
  ticketTypes: ["Ticket types", "أنواع التيكت"],
  rootCauses: ["Root causes", "الأسباب الجذرية"],
  cannedReplies: ["Canned replies", "الردود الجاهزة"],
  openFlag: ["Open", "مفتوحة"],
  terminalFlag: ["Final", "نهائية"],
  slaPause: ["Stops the SLA clock", "يوقف ساعة الـ SLA"],
  fromStatus: ["From", "من حالة"],
  toStatus: ["To", "إلى حالة"],
  actor: ["Who may do it", "مين ينفذها"],
  clientTicketOnly: ["Client tickets only", "تيكتات العملاء فقط"],
  fieldCode: ["Field", "الحقل"],
  label: ["Label", "العنوان"],
  inputType: ["Input", "الإدخال"],
  clientVisible: ["Client sees it", "العميل يشوفه"],
  internalOnly: ["Internal only", "داخلي فقط"],
  clientAllowed: ["Client may open", "العميل يفتحه"],
  aiAllowed: ["AI may answer", "الـ AI يرد عليه"],
  body: ["Body", "النص"],
  settings: ["Settings", "الإعدادات"],
  settingKey: ["Key", "المفتاح"],
  settingValue: ["Value", "القيمة"],
  moduleGroup: ["Group", "المجموعة"],
  salable: ["Sold", "يتباع"],
  defaultTeam: ["Default team", "الفريق الافتراضي"],
  operatingSystems: ["Operating systems", "أنظمة التشغيل"],
  branchTypes: ["Branch types", "أنواع الفروع"],
  aiModels: ["AI models", "موديلات الـ AI"],
  purpose: ["Purpose", "الغرض"],
  provider: ["Provider", "المزوّد"],
  modelName: ["Model", "الموديل"],
  baseUrl: ["Base URL", "الرابط"],
  apiKeyRef: ["Key reference", "مرجع المفتاح"],
  isDefault: ["Default", "الافتراضي"],
  screens: ["Screens", "الشاشات"],
  usedBy: ["Used by", "مستخدم في"],
  lockedField: [
    "Not editable: the packages read it to know what closed means.",
    "غير قابل للتعديل: الباكدجات تقرؤه لتعرف معنى «مغلق».",
  ],
  add: ["Add", "إضافة"],
  edit: ["Edit", "تعديل"],
  active: ["Active", "نشط"],
  inactive: ["Inactive", "غير نشط"],
  sitePrefix: ["Site prefix", "بادئة العميل"],
  licenseNo: ["License no", "رقم الرخصة"],
  nameEn: ["Name (English)", "الاسم بالإنجليزي"],
  nameAr: ["Name (Arabic)", "الاسم بالعربي"],
  area: ["Area", "المنطقة"],
  environment: ["Environment", "البيئة"],
  supportTeam: ["Support team", "فريق الدعم"],
  exsysUrl: ["EXSYS URL", "رابط اكسس"],
  branches: ["Branches", "الفروع"],
  branchType: ["Branch type", "نوع الفرع"],
  organizationNo: ["Organization no", "رقم المنشأة"],
  city: ["City", "المدينة"],
  weight: ["Weight", "الوزن"],
  modules: ["Modules", "الموديولات"],
  contracts: ["Contracts", "العقود"],
  contractCode: ["Contract code", "كود العقد"],
  contractYear: ["Year", "السنة"],
  contractLevel: ["Level", "المستوى"],
  startDate: ["Start", "البداية"],
  endDate: ["End", "النهاية"],
  expired: ["Expired", "منتهي"],
  fullName: ["Full name", "الاسم"],
  email: ["E-mail", "البريد"],
  mobile: ["Mobile", "الموبايل"],
  userKind: ["Kind", "النوع"],
  staffUser: ["Staff", "موظف"],
  clientUser: ["Client user", "مستخدم عميل"],
  role: ["Role", "الدور"],
  seniority: ["Seniority", "الأقدمية"],
  managementFlag: ["Management", "إدارة"],
  kbApproverFlag: ["Approves articles", "يعتمد المقالات"],
  exsysUserName: ["EXSYS user name", "مستخدم اكسس"],
  staffId: ["Staff id", "رقم الموظف"],
  initialPassword: ["Initial password", "كلمة المرور المبدئية"],
  resetPassword: ["Reset password", "تصفير كلمة المرور"],
  unlock: ["Unlock", "فك القفل"],
  activate: ["Activate", "تفعيل"],
  deactivate: ["Deactivate", "إيقاف"],
  locked: ["Locked", "مقفل"],
  lastLogin: ["Last login", "آخر دخول"],
  mustChange: ["Must change password", "لازم يغيّر كلمة المرور"],
  passwordWillBeOneTime: [
    "The user must change this password on the next login.",
    "المستخدم لازم يغيّر كلمة المرور دي أول دخول.",
  ],
  functions: ["Functions", "الوظائف"],
  functionName: ["Function", "الوظيفة"],
  supervisor: ["Supervisor", "السوبرفايزر"],
  teamCode: ["Team code", "كود الفريق"],
  backupTeam: ["Backup team", "الفريق البديل"],
  members: ["Members", "الأعضاء"],
  oncallRoster: ["On-call roster", "جدول المناوبة"],
  oncallPerson: ["On call", "المناوب"],
  backupPerson: ["Backup", "البديل"],
  from: ["From", "من"],
  to: ["To", "إلى"],
  current: ["Now", "الحالي"],
  supportFlag: ["Support function", "وظيفة دعم"],
  displayOrder: ["Order", "الترتيب"],
  deleteRow: ["Delete", "حذف"],
  confirmDelete: ["Delete this row?", "تحذف السطر ده؟"],
  // client user requests (script ETKT_09)
  userRequests: ["User requests", "طلبات المستخدمين"],
  newUserRequest: ["Request a new user", "طلب مستخدم جديد"],
  clientManagers: ["Client managers", "مديرو العملاء"],
  clientManager: ["Client manager", "مدير العميل"],
  clientManagerHint: [
    "Only the client manager can send a request for a new user.",
    "مدير العميل فقط هو من يرسل طلب مستخدم جديد.",
  ],
  userRequestHint: [
    "The request goes to the company management. You will be notified when it is approved or refused.",
    "الطلب يذهب إلى إدارة الشركة، وسيصلك تنبيه عند الموافقة أو الرفض.",
  ],
  suggestedUserName: ["Suggested user name (optional)", "اسم المستخدم المقترح (اختياري)"],
  jobTitle: ["Job title", "المسمى الوظيفي"],
  allBranches: ["All branches", "كل الفروع"],
  requestedBy: ["Requested by", "صاحب الطلب"],
  requestDate: ["Request date", "تاريخ الطلب"],
  decidedBy: ["Decided by", "صاحب القرار"],
  decisionDate: ["Decision date", "تاريخ القرار"],
  rejectReason: ["Refusal reason", "سبب الرفض"],
  approve: ["Approve", "موافقة"],
  reject: ["Refuse", "رفض"],
  approveRequest: ["Approve and create the user", "موافقة وإنشاء المستخدم"],
  rejectRequest: ["Refuse the request", "رفض الطلب"],
  cancelRequest: ["Cancel the request", "إلغاء الطلب"],
  confirmCancelRequest: ["Cancel this request?", "تلغي الطلب ده؟"],
  createdUser: ["Created user", "المستخدم المنشأ"],
  reqWaiting: ["Waiting", "في الانتظار"],
  reqApproved: ["Approved", "تمت الموافقة"],
  reqRefused: ["Refused", "مرفوض"],
  reqCancelled: ["Cancelled", "ملغي"],
  reqAll: ["All", "الكل"],
  managementOnly: [
    "Setup screens are for management only.",
    "شاشات الإعدادات للإدارة فقط.",
  ],
};

type LabelKey = keyof typeof LABELS;

/*
 * 23-11-2026 - many languages (script ETKT_11)
 *   OLD    : two languages only, from the dictionary above.
 *   NEW    : the active languages come from ETK_LANGUAGE (languages_data) and the
 *            texts of the chosen language from ETK_LABEL (labels_data). The
 *            dictionary above stays as the fallback (English / Arabic) while the
 *            texts load or if the service cannot be reached.
 *   REASON : Khaled - EXSYS works in many languages; the screens must too.
 *   BENEFIT: a new language or a corrected word is a row in ETK_LABEL, no new build.
 */
export interface LanguageType {
  language_id: number;
  language_code: string;
  language_name: string;
  native_name: string;
  direction: "rtl" | "ltr";
}

/* used until languages_data answers (same ids as EXSYS.EXSYS01) */
const FALLBACK_LANGUAGES: LanguageType[] = [
  { language_id: 1, language_code: "en", language_name: "English", native_name: "English", direction: "ltr" },
  { language_id: 2, language_code: "ar", language_name: "Arabic", native_name: "العربية", direction: "rtl" },
];
/* right-to-left EXSYS languages: Arabic, Urdu, Kurdish */
const RTL_IDS = [2, 4, 13];

interface LabelsContextProps {
  translate: (key: LabelKey) => string;
  languages: LanguageType[];
  current?: LanguageType;
  isRtl: boolean;
}

const LabelsContext = createContext<LabelsContextProps>({
  translate: (key) => String(key),
  languages: FALLBACK_LANGUAGES,
  isRtl: false,
});

export const LabelsProvider = ({ children }: { children: React.ReactNode }) => {
  const languageId = useMakeSelectCurrentLanguageId();
  const [languages, setLanguages] = useState<LanguageType[]>(FALLBACK_LANGUAGES);
  const [texts, setTexts] = useState<{ [key: string]: string }>({});

  // the language list: once
  useEffect(() => {
    let alive = true;
    getRequest("languages", { planguageid: languageId }).then(({ data, error }) => {
      const rows = (!error && data && data.data) || [];
      if (alive && rows.length) {
        setLanguages(
          rows.map((row: any) => ({
            ...row,
            language_id: Number(row.language_id),
          })),
        );
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the texts: every time the language changes
  useEffect(() => {
    let alive = true;
    setTexts({});
    getRequest("labels", { planguageid: languageId }).then(({ data, error }) => {
      const rows = (!error && data && data.data) || [];
      if (!alive) {
        return;
      }
      const next: { [key: string]: string } = {};
      rows.forEach((row: any) => {
        if (row.key && row.text) {
          next[row.key] = row.text;
        }
      });
      setTexts(next);
    });
    return () => {
      alive = false;
    };
  }, [languageId]);

  const value = useMemo(() => {
    const index = languageId === 2 ? 1 : 0;
    const current = languages.find((item) => item.language_id === languageId);
    const isRtl = current
      ? current.direction === "rtl"
      : RTL_IDS.indexOf(languageId) >= 0;
    return {
      translate: (key: LabelKey) => {
        const fromDb = texts[key as string];
        if (fromDb) {
          return fromDb;
        }
        const entry = LABELS[key as string];
        return entry ? entry[index] : String(key);
      },
      languages,
      current,
      isRtl,
    };
  }, [languageId, languages, texts]);

  return (
    <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
  );
};

export const useLabels = () => useContext(LabelsContext).translate;
export const useLanguages = () => {
  const { languages, current, isRtl } = useContext(LabelsContext);
  return { languages, current, isRtl };
};
export const useIsArabic = () => useMakeSelectCurrentLanguageId() === 2;
