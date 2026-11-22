import React from "react";
import { Button, Icon, Input, Select } from "antd";
import { Flex } from "../../../components/commons";
import { useLookups } from "../../../hooks";
import { useLabels } from "../../../labels";

export interface TicketFiltersType {
  view: string;
  status: string;
  priority?: number;
  type: string;
  team_id?: number;
  client_id?: number;
  search: string;
}

interface Props {
  filters: TicketFiltersType;
  onChange: (next: Partial<TicketFiltersType>) => void;
  onRefresh: () => void;
}

const FiltersView = ({ filters, onChange, onRefresh }: Props) => {
  const labels = useLabels();
  const { lookups } = useLookups();

  return (
    <Flex gap={8} wrap margin="0 0 12px">
      <Input.Search
        allowClear
        style={{ width: 240 }}
        placeholder={labels("search")}
        defaultValue={filters.search}
        onSearch={(value) => onChange({ search: value })}
      />

      <Select
        allowClear
        style={{ width: 150 }}
        placeholder={labels("status")}
        value={filters.status || undefined}
        onChange={(value?: string) => onChange({ status: value || "" })}
      >
        {lookups.statuses.map((item) => (
          <Select.Option key={item.key} value={String(item.key)}>
            {item.value}
          </Select.Option>
        ))}
      </Select>

      <Select
        allowClear
        style={{ width: 150 }}
        placeholder={labels("priority")}
        value={filters.priority}
        onChange={(value?: number) => onChange({ priority: value })}
      >
        {lookups.priorities.map((item) => (
          <Select.Option key={item.key} value={Number(item.key)}>
            {item.value}
          </Select.Option>
        ))}
      </Select>

      <Select
        allowClear
        style={{ width: 150 }}
        placeholder={labels("type")}
        value={filters.type || undefined}
        onChange={(value?: string) => onChange({ type: value || "" })}
      >
        {lookups.types.map((item) => (
          <Select.Option key={item.key} value={String(item.key)}>
            {item.value}
          </Select.Option>
        ))}
      </Select>

      <Select
        allowClear
        showSearch
        optionFilterProp="children"
        style={{ width: 170 }}
        placeholder={labels("team")}
        value={filters.team_id}
        onChange={(value?: number) => onChange({ team_id: value })}
      >
        {lookups.teams.map((item) => (
          <Select.Option key={item.key} value={Number(item.key)}>
            {item.value}
          </Select.Option>
        ))}
      </Select>

      <Button onClick={onRefresh}>
        <Icon type="reload" /> {labels("refresh")}
      </Button>
    </Flex>
  );
};

export default FiltersView;
