import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppThemeProvider from "./theme";
import AppGlobalStyles from "./AppGlobalStyles";
import { AppConfigProvider, useMakeSelectCurrentLanguageId } from "./store";
import { LabelsProvider, useLanguages } from "./labels";
import {
  ContractStatusProvider,
  LookupsProvider,
  RequestRightsProvider,
} from "./hooks";
import AppRoutes from "./routes";

/*
 * The page direction follows the language.
 * antd v3 has no ConfigProvider direction prop - that arrived in v4 - so the
 * direction is set on <html>, which is what the v3 projects do.
 * 23-11-2026 OLD: rtl only for planguageid = 2
 *            NEW: rtl for every right-to-left language of ETK_LANGUAGE (Arabic, Urdu, Kurdish)
 *            REASON: many languages (script ETKT_11)
 */
const DirectionGate = ({ children }: { children: React.ReactNode }) => {
  const languageId = useMakeSelectCurrentLanguageId();
  const { current, isRtl } = useLanguages();

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    document.documentElement.setAttribute(
      "lang",
      current ? current.language_code : languageId === 2 ? "ar" : "en",
    );
  }, [languageId, current, isRtl]);

  return <>{children}</>;
};

const App = () => (
  <AppConfigProvider>
    <AppThemeProvider>
      <AppGlobalStyles />
      {/* 23-11-2026: LabelsProvider now outside DirectionGate - the gate reads the language direction from it */}
      <LabelsProvider>
        <DirectionGate>
          <LookupsProvider>
            <ContractStatusProvider>
              <RequestRightsProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </RequestRightsProvider>
            </ContractStatusProvider>
          </LookupsProvider>
        </DirectionGate>
      </LabelsProvider>
    </AppThemeProvider>
  </AppConfigProvider>
);

export default App;
