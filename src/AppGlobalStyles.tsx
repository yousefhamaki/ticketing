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
`;

export default AppGlobalStyles;
