/*
 * The client's own fields.
 * The site prefix is the key EXSYS joins on, so it is typed once when the
 * client is created and is read only afterwards - the service refuses to
 * change it either way.
 */
import React from "react";
import { Button, Form, Input, Select } from "antd";
import { Flex } from "../../../../components/commons";
import { useLookups } from "../../../../hooks";
import { useLabels } from "../../../../labels";
import { ClientSetupType } from "../index.interface";

interface Props {
  value: Partial<ClientSetupType>;
  isNew: boolean;
  saving: boolean;
  onChange: (next: Partial<ClientSetupType>) => void;
  onSave: () => void;
}

const ClientFormView = ({ value, isNew, saving, onChange, onSave }: Props) => {
  const labels = useLabels();
  const { lookups } = useLookups();

  return (
    <Form layout="vertical">
      <Flex gap={12} wrap align="flex-start">
        <Form.Item label={labels("sitePrefix")} style={{ width: 140 }} required>
          <Input
            maxLength={6}
            disabled={!isNew}
            value={value.site_prefix || ""}
            onChange={(event) =>
              onChange({ site_prefix: event.target.value.toUpperCase() })
            }
          />
        </Form.Item>

        <Form.Item label={labels("licenseNo")} style={{ width: 180 }}>
          <Input
            maxLength={20}
            value={value.license_no || ""}
            onChange={(event) => onChange({ license_no: event.target.value })}
          />
        </Form.Item>

        <Form.Item label={labels("nameEn")} style={{ width: 260 }} required>
          <Input
            maxLength={100}
            value={value.description_p || ""}
            onChange={(event) => onChange({ description_p: event.target.value })}
          />
        </Form.Item>

        <Form.Item label={labels("nameAr")} style={{ width: 260 }}>
          <Input
            maxLength={100}
            value={value.description_s || ""}
            onChange={(event) => onChange({ description_s: event.target.value })}
          />
        </Form.Item>

        <Form.Item label={labels("area")} style={{ width: 160 }}>
          <Input
            maxLength={50}
            value={value.area || ""}
            onChange={(event) => onChange({ area: event.target.value })}
          />
        </Form.Item>

        <Form.Item label={labels("environment")} style={{ width: 150 }}>
          <Select
            value={value.env_type || "W"}
            onChange={(next: string) => onChange({ env_type: next })}
          >
            <Select.Option value="W">Web</Select.Option>
            <Select.Option value="F">Forms 6i</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label={labels("supportTeam")} style={{ width: 200 }}>
          <Select
            allowClear
            showSearch
            optionFilterProp="children"
            value={value.support_team_id}
            onChange={(next?: number) => onChange({ support_team_id: next })}
          >
            {lookups.teams.map((team) => (
              <Select.Option key={team.key} value={Number(team.key)}>
                {team.value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={labels("active")} style={{ width: 120 }}>
          <Select
            value={value.active_flag || "Y"}
            onChange={(next: string) => onChange({ active_flag: next })}
          >
            <Select.Option value="Y">{labels("active")}</Select.Option>
            <Select.Option value="N">{labels("inactive")}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label={labels("exsysUrl")} style={{ width: 360 }}>
          <Input
            maxLength={300}
            value={value.exsys_url || ""}
            onChange={(event) => onChange({ exsys_url: event.target.value })}
          />
        </Form.Item>
      </Flex>

      <Button type="primary" loading={saving} onClick={onSave}>
        {labels("save")}
      </Button>
    </Form>
  );
};

export default ClientFormView;
