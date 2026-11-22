import React from "react";
import styled from "styled-components";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import ContractBanner from "../contract-banner";

const Shell = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const Content = styled.main`
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 16px;
  background: ${({ theme }) => theme.colors.homePageBackground};
`;

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <Shell>
    <AppHeader />
    <ContractBanner />
    <Body>
      <Sidebar />
      <Content>{children}</Content>
    </Body>
  </Shell>
);

export default AppLayout;
