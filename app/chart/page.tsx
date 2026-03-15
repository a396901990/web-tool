"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, subMonths, startOfYear } from "date-fns";
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
  data: Array<Trade & { fill_time_label: string; NAV: number }>;
};

type ZoomPreset = "1m" | "3m" | "6m" | "ytd" | "1y" | "all";

type MergedRow = {
  date: number;
  fill_time_label: string;
  [key: string]: number | string;
};

function getNavAt(
  group: LineGroup,
  t: number,
): number {
  let last = 1;
  for (const item of group.data) {
    const ms = new Date(item.fill_time).getTime();
    if (ms > t) break;
    last = item.NAV;
  }
  return last;
}

export default function ChartPage() {
  const [selectedSignal, setSelectedSignal] = useState<string>("all");
  const [hasFilter, setHasFilter] = useState(false);
  const [zoomPreset, setZoomPreset] = useState<ZoomPreset>("1y");
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
      min: min ?? 0,
      max: max ?? 0,
      minDate: min ? new Date(min) : new Date(),
      maxDate: max ? new Date(max) : new Date(),
    };
  }, [rows]);

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
      let prevNAV = 1;
      return {
        signalName,
        symbol,
        label: `${signalName} · ${symbol}`,
        data: sorted.map((item) => {
          const nav =
            prevNAV * (1 + ((item.pnl_percent ?? 0) * 0.01));
          prevNAV = nav;
          return {
            ...item,
            fill_time_label: new Date(item.fill_time).toLocaleDateString(),
            NAV: nav,
          };
        }),
      };
    });
  }, [rows]);

  const mergedData = useMemo<MergedRow[]>(() => {
    const timeSet = new Set<number>();
    rows.forEach((row) => {
      const t = new Date(row.fill_time).getTime();
      if (!Number.isNaN(t)) timeSet.add(t);
    });
    const timePoints = Array.from(timeSet).sort((a, b) => a - b);
    return timePoints.map((date) => {
      const row: MergedRow = {
        date,
        fill_time_label: format(date, "MMM d, yyyy"),
      };
      lineGroups.forEach((group) => {
        row[group.label] = getNavAt(group, date);
      });
      return row;
    });
  }, [lineGroups, rows]);

  const applyZoomPreset = (preset: ZoomPreset) => {
    const end = dateBounds.maxDate;
    let start: Date;
    switch (preset) {
      case "1m":
        start = subMonths(end, 1);
        break;
      case "3m":
        start = subMonths(end, 3);
        break;
      case "6m":
        start = subMonths(end, 6);
        break;
      case "ytd":
        start = startOfYear(end);
        break;
      case "1y":
        start = subMonths(end, 12);
        break;
      default:
        start = dateBounds.minDate;
    }
    setRange({ startMs: start.getTime(), endMs: end.getTime() });
    setZoomPreset(preset);
    setHasFilter(true);
  };

  const [range, setRange] = useState<{ startMs: number; endMs: number }>(() => {
    const end = dateBounds.maxDate;
    const start = subMonths(end, 12);
    return {
      startMs: start.getTime(),
      endMs: end.getTime(),
    };
  });

  useEffect(() => {
    if (dateBounds.min === 0 && dateBounds.max === 0) return;
    setRange((prev) => ({
      startMs: Math.max(dateBounds.min, prev.startMs),
      endMs: Math.min(dateBounds.max, prev.endMs),
    }));
  }, [dateBounds.min, dateBounds.max]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const palette = [
      "hsl(270 60% 45%)",
      "hsl(200 70% 45%)",
      "hsl(140 50% 40%)",
    ];
    lineGroups.forEach((group, i) => {
      map.set(group.label, palette[i % palette.length]);
    });
    return map;
  }, [lineGroups]);

  const { chartData, brushStartIndex, brushEndIndex } = useMemo(() => {
    const startMs = range.startMs;
    const endMs = range.endMs;
    let startIndex = 0;
    let endIndex = mergedData.length - 1;
    const filtered = mergedData.filter((row) => {
      const inRange = row.date >= startMs && row.date <= endMs;
      return inRange;
    });
    if (mergedData.length > 0) {
      for (let i = 0; i < mergedData.length; i++) {
        if (mergedData[i].date >= startMs) {
          startIndex = i;
          break;
        }
        startIndex = i;
      }
      for (let i = mergedData.length - 1; i >= 0; i--) {
        if (mergedData[i].date <= endMs) {
          endIndex = i;
          break;
        }
        endIndex = i;
      }
    }
    return {
      chartData: filtered,
      brushStartIndex: startIndex,
      brushEndIndex: endIndex,
    };
  }, [mergedData, range]);

  const dateFilteredGroups = useMemo(() => {
    return lineGroups
      .map((group) => ({
        ...group,
        data: group.data.filter((item) => {
          const t = new Date(item.fill_time).getTime();
          return t >= range.startMs && t <= range.endMs;
        }),
      }))
      .filter((group) => group.data.length > 0);
  }, [lineGroups, range]);

  const signalNames = useMemo(
    () => ["all", ...dateFilteredGroups.map((group) => group.label)],
    [dateFilteredGroups],
  );

  const filteredGroups = !hasFilter
    ? []
    : selectedSignal === "all"
      ? dateFilteredGroups
      : dateFilteredGroups.filter((group) => group.label === selectedSignal);

  const displayLabels =
    hasFilter && filteredGroups.length > 0
      ? selectedSignal === "all"
        ? lineGroups.map((g) => g.label)
        : [selectedSignal]
      : lineGroups.map((g) => g.label);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0.4, 1.2];
    let min = 1;
    let max = 1;
    displayLabels.forEach((label) => {
      chartData.forEach((row) => {
        const v = row[label] as number;
        if (typeof v === "number") {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      });
    });
    min = Math.min(min, 1);
    max = Math.max(max, 1);
    const padding = (max - min) * 0.05 || 0.1;
    return [min - padding, max + padding];
  }, [chartData, displayLabels]);

  const handleBrushChange = (rangeIndices: { startIndex?: number; endIndex?: number } | null) => {
    if (!rangeIndices || rangeIndices.startIndex == null || rangeIndices.endIndex == null) return;
    const start = mergedData[rangeIndices.startIndex];
    const end = mergedData[rangeIndices.endIndex];
    if (start && end) {
      setRange({ startMs: start.date, endMs: end.date });
    }
  };

  const rangeLabel = useMemo(() => {
    if (mergedData.length === 0) return "";
    const start = format(range.startMs, "MMM d, yyyy");
    const end = format(range.endMs, "MMM d, yyyy");
    return `${start} → ${end}`;
  }, [range, mergedData.length]);

  useEffect(() => {
    if (selectedSignal !== "all" && !signalNames.includes(selectedSignal)) {
      setSelectedSignal("all");
    }
  }, [selectedSignal, signalNames]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4">
      {/* Top control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Zoom</span>
          {(["1m", "3m", "6m", "YTD", "1y", "All"] as const).map((label) => {
            const value: ZoomPreset =
              label === "YTD" ? "ytd" : label === "All" ? "all" : label;
            const active = zoomPreset === value;
            return (
              <button
                key={label}
                type="button"
                onClick={() => applyZoomPreset(value)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-200 text-blue-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 tabular-nums">
            {rangeLabel}
          </span>
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Signal filter (compact) */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Signal</label>
        <select
          value={selectedSignal}
          onChange={(e) => {
            setSelectedSignal(e.target.value);
            setHasFilter(true);
          }}
          className="px-3 py-1.5 rounded border border-gray-300 bg-white text-black text-sm"
        >
          {signalNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Main chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm w-full">
        <div style={{ width: "100%", aspectRatio: 1.618, maxWidth: 800 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="fill_time_label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(_, i) => {
              const row = chartData[i];
              if (!row || typeof row.date !== "number") return "";
              return format(row.date, "MMM yyyy");
            }}
          />
          <YAxis
            width={48}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            domain={yDomain}
            tickFormatter={(v) => `${((Number(v) - 1) * 100).toFixed(0)}%`}
            label={{
              value: "Return",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#6b7280" },
            }}
          />
          <Tooltip content={TooltipView} />
          {displayLabels.map((label) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={colorMap.get(label) ?? "#444"}
              strokeWidth={2}
              dot={false}
              connectNulls
              name={label}
            />
          ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom navigator with range selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm w-full">
        <p className="text-xs text-gray-500 mb-2">Range selector</p>
        <div style={{ width: "100%", height: 120, maxWidth: 800 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData}
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <XAxis
            dataKey="fill_time_label"
            hide
            tickFormatter={(_, i) => {
              const row = mergedData[i];
              if (!row || typeof row.date !== "number") return "";
              return format(row.date, "yyyy");
            }}
          />
          <YAxis hide domain={yDomain} />
          {displayLabels.map((label) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={colorMap.get(label) ?? "#444"}
              strokeWidth={1}
              dot={false}
              connectNulls
            />
          ))}
          <Brush
            dataKey="fill_time_label"
            height={24}
            stroke="#94a3b8"
            fill="rgba(148, 163, 184, 0.15)"
            startIndex={brushStartIndex}
            endIndex={brushEndIndex}
            onChange={handleBrushChange}
            tickFormatter={(_, i) => {
              const row = mergedData[i];
              if (!row || typeof row.date !== "number") return "";
              return format(row.date, "yyyy");
            }}
          />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
