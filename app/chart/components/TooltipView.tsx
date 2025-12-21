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
    return (
      <div
        style={{
          border: "1px solid #d88488",
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "1px 1px 2px #d88488",
        }}
      >
        <p className="text-black" style={{ margin: "0" }}>
          {`Symbol: ${data.symbol}`}
        </p>
        <p className="text-black" style={{ margin: "0" }}>
          {`Symbol Name: ${data.beta_2_and_10}`}
        </p>
        <p className="text-black" style={{ margin: "0" }}>
          {`Entry Price: ${data.entry_price}`}
        </p>
        <p className="text-black" style={{ margin: "0" }}>
          {`Exit Price: ${data.exit_price}`}
        </p>
        <p className="text-black" style={{ margin: "0" }}>
          {`Direction: ${data.direction}`}
        </p>
        <p className="text-black" style={{ margin: "0" }}>
          {`Pnl: ${data.pnl}`}
        </p>
        <p className="text-black" style={{ margin: "0" }}>
          {`Pnl Percent: ${data.pnl_percent}`}
        </p>
      </div>
    );
  }

  return null;
}
