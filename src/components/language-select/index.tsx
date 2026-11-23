/*
 * Language list (23-11-2026, script ETKT_11).
 * The languages are the active rows of ETK_LANGUAGE (same ids as EXSYS.EXSYS01),
 * each one written in its own language, like the language list of Cure+.
 * Used on the login page and in the header.
 */
import React from "react";
import { Icon, Select } from "antd";
import styled from "styled-components";
import { useAppConfig } from "../../store";
import { useLanguages } from "../../labels";

const Wrap = styled.span<{ round?: boolean }>`
  display: inline-flex;
  align-items: center;

  .ant-select-selection {
    border-radius: ${({ round }) => (round ? "18px" : "4px")};
    border-color: ${({ theme }) => theme.colors.desktopNavDivider};
  }
  .language-globe {
    color: ${({ theme }) => theme.colors.primary};
    margin-inline-end: 6px;
  }
`;

interface LanguageSelectProps {
  width?: number;
  round?: boolean;
  size?: "default" | "small" | "large";
}

const LanguageSelect = ({ width = 140, round, size = "default" }: LanguageSelectProps) => {
  const { languageId, setLanguageId } = useAppConfig();
  const { languages } = useLanguages();

  return (
    <Wrap round={round}>
      <Select
        size={size}
        value={languageId}
        style={{ width }}
        onChange={(value: number) => setLanguageId(Number(value))}
        dropdownMatchSelectWidth={false}
      >
        {languages.map((item) => (
          <Select.Option key={item.language_id} value={item.language_id}>
            <Icon type="global" className="language-globe" />
            <span dir={item.direction}>{item.native_name}</span>
          </Select.Option>
        ))}
      </Select>
    </Wrap>
  );
};

export default LanguageSelect;
