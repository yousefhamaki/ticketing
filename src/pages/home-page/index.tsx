/*
 * Home (staff).
 *
 * Phase 1 has no statistics service yet (the dashboards are phase 3 in the
 * handover), so the boxes here are counted from the saved views the ticket
 * service already answers: one small request per box, poffset_step = 1, and
 * the number is read off `total` on the row. When the statistics service
 * arrives, this file is the only one that changes.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Spin } from "antd";
import {
  Flex,
  PageTitle,
  ShadowSection,
  StatBox,
  StatValue,
  SubText,
} from "../../components/commons";
import { getRequest } from "../../api";
import { useAppConfig } from "../../store";
import { useLabels } from "../../labels";
import { PAGES_PATH_NAMES } from "../../routes/constants";

const BOXES = [
  { view: "mine", labelKey: "viewMine" },
  { view: "unaccepted", labelKey: "viewUnaccepted" },
  { view: "need_assign", labelKey: "viewNeedAssign" },
  { view: "breach", labelKey: "viewBreach" },
  { view: "angry", labelKey: "viewAngry" },
  { view: "open", labelKey: "viewOpen" },
];

const HomePage = () => {
  const labels = useLabels();
  const history = useHistory();
  const { authorization, languageId, user } = useAppConfig();
  const [counts, setCounts] = useState<{ [view: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!authorization) {
      return;
    }
    setLoading(true);

    const results = await Promise.all(
      BOXES.map((box) =>
        getRequest("tickets", {
          authorization,
          planguageid: languageId,
          view: box.view,
          poffset: 0,
          poffset_step: 1,
        }),
      ),
    );

    const next: { [view: string]: number } = {};
    results.forEach((result, index) => {
      const rows = (result.data && result.data.data) || [];
      next[BOXES[index].view] = rows.length ? Number(rows[0].total || 0) : 0;
    });

    setCounts(next);
    setLoading(false);
  }, [authorization, languageId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Flex justify="space-between" margin="0 0 12px">
        <div>
          <PageTitle>{labels("home")}</PageTitle>
          <SubText>
            {user ? `${user.full_name} · ${user.team_name || user.role}` : ""}
          </SubText>
        </div>
      </Flex>

      <ShadowSection>
        {loading ? <Spin /> : null}
        <Flex gap={12} wrap align="stretch">
          {BOXES.map((box) => (
            <StatBox
              key={box.view}
              onClick={() => history.push(PAGES_PATH_NAMES.tickets)}
              style={{ cursor: "pointer" }}
            >
              <SubText>{labels(box.labelKey as any)}</SubText>
              <StatValue>{counts[box.view] || 0}</StatValue>
            </StatBox>
          ))}
        </Flex>
      </ShadowSection>
    </>
  );
};

export default HomePage;
