"use client";

import React, { useMemo } from "react";

export default function TooltipView({ payload, label, active }: any) {
  const data = useMemo(() => {
    if (payload && payload.length) {
      return payload[0].payload;
    }
    return null;
  }, [payload]);

  if (active && payload && payload.length && !!data) {
    const isMerged = data.date != null && data.symbol == null;
    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff",
          padding: "10px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {isMerged ? (
          <>
            <p className="text-gray-700 font-medium" style={{ margin: "0 0 6px 0" }}>
              {data.fill_time_label}
            </p>
            {payload.map((entry: { name: string; value?: number; color?: string }) => (
              <p key={entry.name} className="text-black text-sm" style={{ margin: "2px 0" }}>
                <span style={{ color: entry.color }}>●</span> {entry.name}:{" "}
                {typeof entry.value === "number"
                  ? `${((entry.value - 1) * 100).toFixed(2)}%`
                  : "-"}
              </p>
            ))}
          </>
        ) : (
          <>
            <p className="text-black" style={{ margin: "0" }}>{`Symbol: ${data.symbol}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`Symbol Name: ${data.signal_name}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`Entry Price: ${data.entry_price}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`Exit Price: ${data.exit_price}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`Direction: ${data.direction}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`Pnl: ${data.pnl}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`Pnl Percent: ${data.pnl_percent}`}</p>
            <p className="text-black" style={{ margin: "0" }}>{`NAV: ${data.NAV}`}</p>
          </>
        )}
      </div>
    );
  }

  return null;
}
