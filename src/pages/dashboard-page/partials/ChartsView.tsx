/*
 * The three charts of the board. chart.js 2.9 through react-chartjs-2 2.9 -
 * the versions cure-plus-fe already uses, so the look matches its charts.
 *
 * The colours come from the theme's dashboardChartsColors, which is the same
 * ordered palette cure-plus-fe uses for dashboard slices.
 */
import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useTheme } from "styled-components";
import { Flex, ShadowSection, SubText } from "../../../components/commons";
import { useLabels } from "../../../labels";

interface SliceType {
  name: string;
  value: number;
}

interface TrendType {
  day: string;
  opened: number;
  resolved: number;
}

const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <ShadowSection padding="10px 14px" style={{ flex: 1, minWidth: 300 }}>
    <SubText>{title}</SubText>
    <div style={{ height: 240 }}>{children}</div>
  </ShadowSection>
);

const ChartsView = ({
  byStatus,
  byPriority,
  byModule,
  trend,
}: {
  byStatus: SliceType[];
  byPriority: SliceType[];
  byModule: SliceType[];
  trend: TrendType[];
}) => {
  const labels = useLabels();
  const theme = useTheme();
  const palette = theme.colors.dashboardChartsColors as unknown as string[];

  const options = {
    maintainAspectRatio: false,
    legend: { position: "bottom" as const, labels: { boxWidth: 12 } },
  };

  const slices = (rows: SliceType[]) => ({
    labels: rows.map((row) => row.name),
    datasets: [
      {
        data: rows.map((row) => row.value),
        backgroundColor: rows.map(
          (row, index) => palette[index % palette.length],
        ),
      },
    ],
  });

  return (
    <>
      <Flex gap={12} wrap align="stretch" margin="12px 0 0">
        <Panel title={labels("status")}>
          <Pie data={slices(byStatus)} options={options} />
        </Panel>
        <Panel title={labels("priority")}>
          <Bar
            data={slices(byPriority)}
            options={{
              ...options,
              legend: { display: false },
              scales: { yAxes: [{ ticks: { beginAtZero: true, precision: 0 } /* 23-11-2026: whole numbers only (was 0.2, 0.4 ...) */ }] },
            }}
          />
        </Panel>
        <Panel title={labels("module")}>
          <Bar
            data={slices(byModule)}
            options={{
              ...options,
              legend: { display: false },
              scales: { yAxes: [{ ticks: { beginAtZero: true, precision: 0 } /* 23-11-2026: whole numbers only (was 0.2, 0.4 ...) */ }] },
            }}
          />
        </Panel>
      </Flex>

      <ShadowSection padding="10px 14px" style={{ marginTop: 12 }}>
        <SubText>{labels("trend")}</SubText>
        <div style={{ height: 260 }}>
          <Line
            data={{
              labels: trend.map((row) => row.day),
              datasets: [
                {
                  label: labels("opened"),
                  data: trend.map((row) => row.opened),
                  borderColor: theme.colors.primary,
                  backgroundColor: "transparent",
                  lineTension: 0.25,
                },
                {
                  label: labels("resolvedLabel"),
                  data: trend.map((row) => row.resolved),
                  borderColor: theme.colors.success,
                  backgroundColor: "transparent",
                  lineTension: 0.25,
                },
              ],
            }}
            options={{
              ...options,
              scales: { yAxes: [{ ticks: { beginAtZero: true, precision: 0 } /* 23-11-2026: whole numbers only (was 0.2, 0.4 ...) */ }] },
            }}
          />
        </div>
      </ShadowSection>
    </>
  );
};

export default ChartsView;
