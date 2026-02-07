"use client";

// https://recharts.github.io/en-US/guide/getting-started/
import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DateRange } from "react-date-range";
import trades from "../data/trades.json";
import TooltipView from "./components/TooltipView";

type Trade = {
  signal_name: string;
  symbol: string;
  fill_time: string;
  pnl: number;
  entry_price?: number;
  exit_price?: number;
  direction?: string;
  pnl_percent?: number;
};

type LineGroup = {
  signalName: string;
  symbol: string;
  label: string;
  data: Array<Trade & { fill_time_label: string; pnl: number }>;
};

export default function ChartPage() {
  const [selectedSignal, setSelectedSignal] = useState<string>("all");
  const rows = useMemo<Trade[]>(() => (trades as Trade[][]).flat(), []);
  const dateBounds = useMemo(() => {
    let min: number | null = null;
    let max: number | null = null;
    rows.forEach((row) => {
      const t = new Date(row.fill_time).getTime();
      if (Number.isNaN(t)) return;
      if (min === null || t < min) min = t;
      if (max === null || t > max) max = t;
    });
    return {
      min: min ? new Date(min) : null,
      max: max ? new Date(max) : null,
    };
  }, [rows]);
  const [range, setRange] = useState([
    {
      startDate: dateBounds.min ?? new Date(),
      endDate: dateBounds.max ?? new Date(),
      key: "selection",
    },
  ]);

  const lineGroups = useMemo<LineGroup[]>(() => {
    const grouped = new Map<string, Trade[]>();

    rows.forEach((row) => {
      const key = `${row.signal_name || "unknown"}|${row.symbol || "unknown"}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(row);
    });

    return Array.from(grouped.entries()).map(([compoundKey, group]) => {
      const [signalName, symbol] = compoundKey.split("|");
      const sorted = [...group].sort(
        (a, b) =>
          new Date(a.fill_time).getTime() - new Date(b.fill_time).getTime(),
      );
      return {
        signalName,
        symbol,
        label: `${signalName} · ${symbol}`,
        data: sorted.map((item) => ({
          ...item,
          fill_time_label: new Date(item.fill_time).toLocaleDateString(),
          pnl: Math.round(item.pnl),
        })),
      };
    });
  }, [rows]);

  const colorForIndex = (index: number) => `hsl(${(index * 47) % 360} 70% 45%)`;

  const dateFilteredGroups = useMemo(() => {
    const selection = range[0];
    const startMs = selection.startDate
      ? new Date(selection.startDate).getTime()
      : Number.NEGATIVE_INFINITY;
    const endMs = selection.endDate
      ? new Date(selection.endDate).getTime()
      : Number.POSITIVE_INFINITY;
    return lineGroups
      .map((group) => ({
        ...group,
        data: group.data.filter((item) => {
          const t = new Date(item.fill_time).getTime();
          return t >= startMs && t <= endMs;
        }),
      }))
      .filter((group) => group.data.length > 0);
  }, [lineGroups, range]);

  const signalNames = useMemo(
    () => ["all", ...dateFilteredGroups.map((group) => group.label)],
    [dateFilteredGroups],
  );

  const filteredGroups =
    selectedSignal === "all"
      ? dateFilteredGroups
      : dateFilteredGroups.filter((group) => group.label === selectedSignal);

  useEffect(() => {
    if (selectedSignal !== "all" && !signalNames.includes(selectedSignal)) {
      setSelectedSignal("all");
    }
  }, [selectedSignal, signalNames]);

  return (
    <div className="justify-center items-center flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded border border-gray-300 bg-white text-black text-sm p-2">
          <DateRange
            ranges={range}
            onChange={(item: {
              selection: { startDate: Date; endDate: Date; key: string };
            }) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            editableDateInputs
          />
        </div>
        <label className="text-sm text-gray-700 my-4">
          Signal
          <select
            value={selectedSignal}
            onChange={(event) => setSelectedSignal(event.target.value)}
            className="ml-2 px-3 py-1 rounded border border-gray-300 bg-white text-black text-sm"
          >
            {signalNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
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
        {filteredGroups.map((group, index) => (
          <Line
            key={group.label}
            data={group.data}
            type="monotone"
            dataKey="pnl"
            stroke={colorForIndex(index)}
            strokeWidth={2}
            name={group.label}
          />
        ))}
        <XAxis dataKey="fill_time_label" />
        <YAxis
          width="auto"
          label={{ value: "PNL", position: "insideLeft", angle: -90 }}
        />
        {/* <Legend align="right" /> */}
        <Tooltip content={TooltipView} />
      </LineChart>
    </div>
  );
}
