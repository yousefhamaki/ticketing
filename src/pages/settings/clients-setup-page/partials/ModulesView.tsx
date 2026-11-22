/*
 * The client's modules: a tick list, because the service answers with every
 * active module and a flag, not with two lists to keep in step.
 * Unticking does not delete the row - old tickets still point at the module.
 */
import React from "react";
import { Checkbox, message } from "antd";
import { Flex } from "../../../../components/commons";
import { useBasicMutation } from "../../../../hooks";
import { useLabels } from "../../../../labels";

interface Props {
  clientId: number;
  modules: { module_id: string; module_name: string; selected: string }[];
  onReload: () => void;
}

const ModulesView = ({ clientId, modules, onReload }: Props) => {
  const labels = useLabels();
  const { mutate } = useBasicMutation({ apiId: "adminClientModuleDml" });

  const toggle = async (moduleId: string, checked: boolean) => {
    const { error } = await mutate({
      record_status: checked ? "n" : "d",
      client_id: clientId,
      module_id: moduleId,
    });

    if (error) {
      message.error(error);
      return;
    }
    message.success(labels("saved"));
    onReload();
  };

  return (
    <Flex column align="stretch" gap={6}>
      {modules.map((item) => (
        <Checkbox
          key={item.module_id}
          checked={item.selected === "Y"}
          onChange={(event) => toggle(item.module_id, event.target.checked)}
        >
          {item.module_name} <span style={{ opacity: 0.6 }}>({item.module_id})</span>
        </Checkbox>
      ))}
    </Flex>
  );
};

export default ModulesView;
