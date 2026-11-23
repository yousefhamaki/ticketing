import React from "react";
import styled from "styled-components";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import AppFooter from "./AppFooter";
import ContractBanner from "../contract-banner";

const Shell = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`;

/* 23-11-2026: the page background now sits behind the side menu card too
   (OLD: only behind the content). REASON: Cure+ look. */
const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  background: ${({ theme }) => theme.colors.homePageBackground};
`;

const Content = styled.main`
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 16px;
`;

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <Shell>
    <AppHeader />
    <ContractBanner />
    <Body>
      <Sidebar />
      <Content>{children}</Content>
    </Body>
    {/* 23-11-2026 NEW: footer with the EXSYS logo, like Cure+ */}
    <AppFooter />
  </Shell>
);

export default AppLayout;
