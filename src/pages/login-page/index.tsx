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
 */
import React, { useCallback, useState } from "react";
import { Alert, Button, Form, Icon, Input, Select } from "antd";
import styled from "styled-components";
import { useBasicMutation } from "../../hooks";
import { useAppConfig, CurrentUserType } from "../../store";
import { useLabels } from "../../labels";

const Page = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.loginPageEdge} 0%,
    ${({ theme }) => theme.colors.loginPageMiddle} 55%,
    ${({ theme }) => theme.colors.loginPageEdge} 100%
  );
`;

const Card = styled.div`
  width: 360px;
  padding: 28px 26px 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.loginCard};
  border: 1px solid ${({ theme }) => theme.colors.borderSlate};
  box-shadow: 0 10px 30px ${({ theme }) => theme.colors.shadowCard};
`;

const Title = styled.h1`
  font-size: 19px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Sub = styled.div`
  text-align: center;
  font-size: 12px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.mutedText};
`;

const LoginPage = () => {
  const labels = useLabels();
  const { setSession, languageId, setLanguageId } = useAppConfig();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <Page>
      <Card>
        <Title>{labels("appName")}</Title>
        <Sub>EXSYS Solutions</Sub>

        {error ? (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: 14 }}
            showIcon
          />
        ) : null}

        <Form onSubmit={onSubmit}>
          <Form.Item>
            <Input
              size="large"
              prefix={<Icon type="user" />}
              placeholder={labels("userName")}
              value={userName}
              autoFocus
              onChange={(event) => setUserName(event.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input
              size="large"
              type="password"
              prefix={<Icon type="lock" />}
              placeholder={labels("password")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Select
              value={languageId}
              onChange={(value: number) => setLanguageId(value)}
              style={{ width: "100%" }}
            >
              <Select.Option value={2}>العربية</Select.Option>
              <Select.Option value={1}>English</Select.Option>
            </Select>
          </Form.Item>
          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            loading={loading}
            disabled={!userName || !password}
          >
            {labels("login")}
          </Button>
        </Form>
      </Card>
    </Page>
  );
};

export default LoginPage;
