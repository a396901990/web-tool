"use client";

// https://recharts.github.io/en-US/guide/getting-started/
import React, { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { btcusdt_1d, ethusdt_1d } from "./data";
import TooltipView from "./components/TooltipView";

export default function ChartPage() {
  const btcData = useMemo(() => {
    return btcusdt_1d.map((item) => ({
      ...item,
      fill_time: new Date(item.fill_time).toLocaleDateString(),
      pnl: item.pnl.toFixed(0),
    }));
  }, []);
  const ethData = useMemo(() => {
    return ethusdt_1d.map((item) => ({
      ...item,
      fill_time: new Date(item.fill_time).toLocaleDateString(),
      pnl: item.pnl.toFixed(0),
    }));
  }, []);
  return (
    <div className="w-screen h-screen justify-center items-center flex">
      <LineChart
        style={{
          width: "100%",
          aspectRatio: 1.618,
          maxWidth: 800,
        }}
        responsive
      >
        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
        <Line
          data={btcData}
          type="monotone"
          dataKey="pnl"
          stroke="purple"
          strokeWidth={2}
          name="PNL"
        />
        <Line
          data={ethData}
          type="monotone"
          dataKey="pnl"
          stroke="orange"
          strokeWidth={2}
          name="PNL"
        />
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
