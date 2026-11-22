/*
 * Change password.
 * POST etk_security_pkg/change_password_dml { authorization, old_password, new_password }
 * After it succeeds the user record is re-read (me_data) so
 * must_change_pwd_flag turns N and the rest of the app opens.
 */
import React, { useCallback, useState } from "react";
import { Alert, Button, Form, Input, message } from "antd";
import styled from "styled-components";
import { useBasicMutation, useBasicQuery } from "../../hooks";
import { useAppConfig, CurrentUserType } from "../../store";
import { useLabels } from "../../labels";
import { ShadowSection, PageTitle } from "../../components/commons";

const Wrapper = styled.div`
  max-width: 420px;
  margin: 40px auto;
`;

const ChangePasswordPage = () => {
  const labels = useLabels();
  const { user, setUser } = useAppConfig();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const { runQuery: reloadMe } = useBasicQuery({
    apiId: "me",
    onResponse: ({ apiValues, error: apiError }) => {
      if (!apiError) {
        const next = (apiValues.data || [])[0] as CurrentUserType;
        if (next) {
          setUser(next);
        }
      }
    },
  });

  const { loading, mutate } = useBasicMutation({
    apiId: "changePassword",
    flatBody: true,
  });

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");

      if (newPassword.length < 8) {
        setError(labels("passwordTooShort"));
        return;
      }
      if (newPassword !== confirm) {
        setError(labels("passwordsDoNotMatch"));
        return;
      }

      const { error: apiError } = await mutate({
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      message.success(labels("saved"));
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      reloadMe();
    },
    [mutate, oldPassword, newPassword, confirm, labels, reloadMe],
  );

  return (
    <Wrapper>
      <ShadowSection padding="20px 22px">
        <PageTitle>{labels("changePassword")}</PageTitle>

        {user && user.must_change_pwd_flag === "Y" ? (
          <Alert
            type="warning"
            showIcon
            message={labels("mustChangePassword")}
            style={{ margin: "12px 0" }}
          />
        ) : null}

        {error ? (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ margin: "12px 0" }}
          />
        ) : null}

        <Form onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <Form.Item label={labels("oldPassword")}>
            <Input
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
            />
          </Form.Item>
          <Form.Item label={labels("newPassword")}>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </Form.Item>
          <Form.Item label={labels("confirmPassword")}>
            <Input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!oldPassword || !newPassword || !confirm}
          >
            {labels("save")}
          </Button>
        </Form>
      </ShadowSection>
    </Wrapper>
  );
};

export default ChangePasswordPage;
