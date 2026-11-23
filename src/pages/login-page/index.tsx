/*
 * Sign in.
 *
 * POST /ords/etkt/etk_security_pkg/login_dml
 * body  { user_name, password, planguageid, login_source: "W" }
 * reply { status, authorization, expire_date, data: [ user ] }
 *
 * A user still carrying the initial password comes back with
 * must_change_pwd_flag = Y; the router then shows nothing but the
 * change-password screen, because the packages answer -20803 to everything
 * else until it is changed.
 *
 * 23-11-2026 - new look (same idea as the Cure+ login):
 *   OLD    : one small card in the middle, title text only, no logo.
 *   NEW    : brand side (EXSYS logo + product line + 4 features) and the
 *            sign-in card (logo, welcome line, rounded fields, language
 *            pills, gradient button), with the shared footer at the bottom.
 *   REASON : Khaled - the login page did not look like our product and had
 *            no EXSYS logo.
 *   BENEFIT: clients and staff see the EXSYS brand first; the page matches
 *            Cure+. The sign-in logic itself is unchanged.
 */
import React, { useCallback, useState } from "react";
import { Alert, Button, Form, Icon, Input } from "antd";
import styled from "styled-components";
import { useBasicMutation } from "../../hooks";
import { useAppConfig, CurrentUserType } from "../../store";
import { useLabels } from "../../labels";
import ExsysLogo from "../../components/exsys-logo";
import AppFooter from "../../components/app-layout/AppFooter";
import LanguageSelect from "../../components/language-select";

const Page = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.loginPageEdge};
`;

const Main = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64px;
  padding: 32px 48px;
  background: radial-gradient(
      circle at 15% 20%,
      ${({ theme }) => theme.colors.accentSky}26 0%,
      transparent 45%
    ),
    radial-gradient(
      circle at 85% 85%,
      ${({ theme }) => theme.colors.primary}1f 0%,
      transparent 50%
    ),
    linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.loginPageEdge} 0%,
      ${({ theme }) => theme.colors.loginPageMiddle} 60%,
      ${({ theme }) => theme.colors.loginPageEdge} 100%
    );
`;

/* ---------- brand side ---------- */
const Hero = styled.div`
  flex: 1;
  max-width: 520px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const HeroTitle = styled.h1`
  margin: 26px 0 10px;
  font-size: 38px;
  line-height: 1.25;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.brandNavy};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const HeroText = styled.p`
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 30px;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.loginCard};
  border: 1px solid ${({ theme }) => theme.colors.borderSlate};
  color: ${({ theme }) => theme.colors.headingText};
  font-size: 14px;
  font-weight: 600;

  .feature-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.infoBackground};
  }
`;

/* ---------- sign-in card ---------- */
const Card = styled.div`
  width: 400px;
  max-width: 100%;
  flex-shrink: 0;
  padding: 34px 32px 26px;
  border-radius: 22px;
  background: ${({ theme }) => theme.colors.loginCard};
  border: 1px solid ${({ theme }) => theme.colors.borderSlate};
  box-shadow: 0 18px 45px ${({ theme }) => theme.colors.shadowCard};

  .ant-input-affix-wrapper .ant-input {
    height: 46px;
    border-radius: 23px;
  }
  .ant-input-affix-wrapper .ant-input-prefix {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

const CardHead = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const Welcome = styled.div`
  margin-top: 18px;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.brandNavy};
`;

const WelcomeSub = styled.div`
  margin-top: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.mutedText};
`;

const LangRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
`;

const SubmitButton = styled(Button)`
  &.ant-btn {
    height: 46px;
    border-radius: 23px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary} 0%,
      ${({ theme }) => theme.colors.accentSky} 100%
    );
  }
  &.ant-btn[disabled] {
    opacity: 0.55;
    color: #ffffff;
  }
`;

const LoginPage = () => {
  const labels = useLabels();
  const { setSession } = useAppConfig();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { loading, mutate } = useBasicMutation({
    apiId: "login",
    excludeAuthorization: true,
    flatBody: true,
  });

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");

      const { apiValues, error: apiError } = await mutate({
        user_name: userName,
        password,
        login_source: "W",
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      const user = (apiValues.data || [])[0] as CurrentUserType;

      if (!user || !apiValues.authorization) {
        setError(labels("sessionExpired"));
        return;
      }

      setSession(apiValues.authorization, user);
    },
    [mutate, userName, password, setSession, labels],
  );

  const features = [
    { icon: "customer-service", label: labels("featSupport") },
    { icon: "clock-circle", label: labels("featSla") },
    { icon: "robot", label: labels("featAi") },
    { icon: "safety-certificate", label: labels("featSecure") },
  ];

  return (
    <Page>
      <Main>
        <Hero>
          <ExsysLogo height={58} />
          <HeroTitle>
            {labels("heroTitle1")}
            <br />
            <span>{labels("heroTitle2")}</span>
          </HeroTitle>
          <HeroText>{labels("heroText")}</HeroText>
          <Features>
            {features.map((item) => (
              <Feature key={item.icon}>
                <span className="feature-icon">
                  <Icon type={item.icon} />
                </span>
                {item.label}
              </Feature>
            ))}
          </Features>
        </Hero>

        <Card>
          <CardHead>
            <ExsysLogo height={46} />
            <Welcome>{labels("welcomeBack")}</Welcome>
            <WelcomeSub>{labels("signInToContinue")}</WelcomeSub>
          </CardHead>

          {error ? (
            <Alert
              type="error"
              message={error}
              style={{ marginBottom: 14, borderRadius: 12 }}
              showIcon
            />
          ) : null}

          {/* 23-11-2026: the active languages of ETK_LANGUAGE (was: 2 buttons) */}
          <LangRow>
            <LanguageSelect width={200} round />
          </LangRow>

          <Form onSubmit={onSubmit}>
            <Form.Item>
              <Input
                prefix={<Icon type="user" />}
                placeholder={labels("userName")}
                value={userName}
                autoFocus
                autoComplete="username"
                onChange={(event) => setUserName(event.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Input
                type={showPassword ? "text" : "password"}
                prefix={<Icon type="lock" />}
                suffix={
                  <Icon
                    type={showPassword ? "eye" : "eye-invisible"}
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                }
                placeholder={labels("password")}
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </Form.Item>
            <SubmitButton
              type="primary"
              block
              htmlType="submit"
              loading={loading}
              disabled={!userName || !password}
            >
              {labels("login")}
            </SubmitButton>
          </Form>
        </Card>
      </Main>
      <AppFooter />
    </Page>
  );
};

export default LoginPage;
