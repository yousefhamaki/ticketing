import { createGlobalStyle } from "styled-components";

/* The page follows the user's language: Arabic is laid out RTL. */
const AppGlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    font-family: Tahoma, "Segoe UI", -apple-system, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.bodyText};
  }

  .ant-modal-content,
  .ant-modal-header {
    background: ${({ theme }) => theme.colors.modalBackground};
  }
  .ant-modal-title,
  .ant-form-item-label > label {
    color: ${({ theme }) => theme.colors.text};
  }
  .ant-input,
  .ant-select-selection,
  .ant-input-number-input {
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }

  /* 23-11-2026 NEW: antd v3 puts the icon gap on the right only, so in Arabic
     the icon touched its text ("تحديث", menu items). REASON: RTL looked broken.
     BENEFIT: same gap in both directions. */
  html[dir="rtl"] .ant-btn > .anticon + span,
  html[dir="rtl"] .ant-btn > span + .anticon {
    margin-left: 0;
    margin-right: 8px;
  }
  /* 23-11-2026 NEW: the close (x) of a dialog sat on its title in RTL */
  html[dir="rtl"] .ant-modal-close {
    right: auto;
    left: 0;
  }
  html[dir="rtl"] .ant-menu-item .anticon,
  html[dir="rtl"] .ant-menu-submenu-title .anticon {
    margin-right: 0;
    margin-left: 10px;
  }
`;

export default AppGlobalStyles;
