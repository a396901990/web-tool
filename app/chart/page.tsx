"use client";

// https://recharts.github.io/en-US/guide/getting-started/
import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "A",
    uv: 400,
    pv: 240,
    amt: 2400,
  },
  {
    name: "B",
    uv: 300,
    pv: 456,
    amt: 2400,
  },
  {
    name: "C",
    uv: 300,
    pv: 139,
    amt: 2400,
  },
  {
    name: "D",
    uv: 200,
    pv: 980,
    amt: 2400,
  },
  {
    name: "E",
    uv: 278,
    pv: 390,
    amt: 2400,
  },
  {
    name: "F",
    uv: 189,
    pv: 480,
    amt: 2400,
  },
];
export default function ChartPage() {
  return (
    <div className="w-screen h-screen justify-center items-center flex">
      <LineChart
        style={{
          width: "100%",
          aspectRatio: 1.618,
          maxWidth: 800,
        }}
        responsive
        data={data}
      >
      <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
      <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="My data series name" />
      <XAxis dataKey="name" />
      <YAxis width="auto" label={{ value: 'UV', position: 'insideLeft', angle: -90 }} />
      <Legend align="right" />
      <Tooltip />
      </LineChart>
    </div>
  );
}
