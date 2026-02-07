"use client";

// https://recharts.github.io/en-US/guide/getting-started/
import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import trades from "../data/trades.json";
import TooltipView from "./components/TooltipView";

type Trade = {
  signal_name: string;
  fill_time: string;
  pnl: number;
};

type LineGroup = {
  signalName: string;
  data: Array<Trade & { fill_time: string; pnl: number }>;
};

export default function ChartPage() {
  const [selectedSignal, setSelectedSignal] = useState<string>("all");

  const lineGroups = useMemo<LineGroup[]>(() => {
    const rows = (trades as Trade[][]).flat();
    const grouped = new Map<string, Trade[]>();

    rows.forEach((row) => {
      const key = row.signal_name || "unknown";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(row);
    });

    return Array.from(grouped.entries()).map(([signalName, group]) => {
      const sorted = [...group].sort(
        (a, b) => new Date(a.fill_time).getTime() - new Date(b.fill_time).getTime()
      );
      return {
        signalName,
        data: sorted.map((item) => ({
          ...item,
          fill_time: new Date(item.fill_time).toLocaleDateString(),
          pnl: Math.round(item.pnl),
        })),
      };
    });
  }, []);

  const signalNames = useMemo(
    () => ["all", ...lineGroups.map((group) => group.signalName)],
    [lineGroups]
  );

  const colorForIndex = (index: number) =>
    `hsl(${(index * 47) % 360} 70% 45%)`;

  const visibleGroups =
    selectedSignal === "all"
      ? lineGroups
      : lineGroups.filter((group) => group.signalName === selectedSignal);

  return (
    <div className="w-screen h-screen justify-center items-center flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {signalNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelectedSignal(name)}
            className={`px-3 py-1 rounded border text-sm ${
              selectedSignal === name
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <LineChart
        style={{
          width: "100%",
          aspectRatio: 1.618,
          maxWidth: 800,
        }}
        responsive
      >
        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
        {visibleGroups.map((group, index) => (
          <Line
            key={group.signalName}
            data={group.data}
            type="monotone"
            dataKey="pnl"
            stroke={colorForIndex(index)}
            strokeWidth={2}
            name={group.signalName}
          />
        ))}
        <XAxis dataKey="fill_time" />
        <YAxis
          width="auto"
          label={{ value: "PNL", position: "insideLeft", angle: -90 }}
        />
        <Legend align="right" />
        <Tooltip content={TooltipView} />
      </LineChart>
    </div>
  );
}
