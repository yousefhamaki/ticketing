import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppThemeProvider from "./theme";
import AppGlobalStyles from "./AppGlobalStyles";
import { AppConfigProvider, useMakeSelectCurrentLanguageId } from "./store";
import { LabelsProvider } from "./labels";
import {
  ContractStatusProvider,
  LookupsProvider,
  RequestRightsProvider,
} from "./hooks";
import AppRoutes from "./routes";

/*
 * Arabic (planguageid = 2) lays the page out RTL.
 * antd v3 has no ConfigProvider direction prop - that arrived in v4 - so the
 * direction is set on <html>, which is what the v3 projects do.
 */
const DirectionGate = ({ children }: { children: React.ReactNode }) => {
  const languageId = useMakeSelectCurrentLanguageId();

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      languageId === 2 ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute(
      "lang",
      languageId === 2 ? "ar" : "en",
    );
  }, [languageId]);

  return <>{children}</>;
};

const App = () => (
  <AppConfigProvider>
    <AppThemeProvider>
      <AppGlobalStyles />
      <DirectionGate>
        <LabelsProvider>
          <LookupsProvider>
            <ContractStatusProvider>
              <RequestRightsProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </RequestRightsProvider>
            </ContractStatusProvider>
          </LookupsProvider>
        </LabelsProvider>
      </DirectionGate>
    </AppThemeProvider>
  </AppConfigProvider>
);

export default App;
