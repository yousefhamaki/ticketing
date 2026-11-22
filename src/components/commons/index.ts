/*
 * Layout primitives, the small set this app uses out of
 * `@app-structure/commons` in cure-plus-fe, with the same names.
 */
import styled, { css } from "styled-components";

export const Flex = styled.div<{
  column?: boolean;
  gap?: number;
  align?: string;
  justify?: string;
  wrap?: boolean;
  flex?: number | string;
  margin?: string;
  padding?: string;
  width?: string;
}>`
  display: flex;
  flex-direction: ${({ column }) => (column ? "column" : "row")};
  align-items: ${({ align }) => align || "center"};
  justify-content: ${({ justify }) => justify || "flex-start"};
  flex-wrap: ${({ wrap }) => (wrap ? "wrap" : "nowrap")};
  gap: ${({ gap }) => (gap === undefined ? 8 : gap)}px;
  ${({ flex }) => (flex !== undefined ? css`flex: ${flex};` : "")}
  ${({ margin }) => (margin ? css`margin: ${margin};` : "")}
  ${({ padding }) => (padding ? css`padding: ${padding};` : "")}
  ${({ width }) => (width ? css`width: ${width};` : "")}
`;

export const ShadowSection = styled.div<{ padding?: string }>`
  background: ${({ theme }) => theme.colors.shadowSectionBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  padding: ${({ padding }) => padding || "12px 16px"};
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow};
`;

export const PageTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.headingText};
`;

export const SubText = styled.span`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
`;

export const FieldLabel = styled.div`
  color: ${({ theme }) => theme.colors.labelText};
  font-size: 12px;
  margin-bottom: 2px;
`;

export const FieldValue = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 500;
  word-break: break-word;
`;

export const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.statBoxBackground};
  border-radius: 8px;
  padding: 12px 14px;
  min-width: 150px;
  flex: 1;
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.statValueText};
  line-height: 1.2;
`;
