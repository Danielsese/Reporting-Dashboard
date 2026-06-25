"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export interface TrendPoint {
  label: string;
  revenue: number;
}

export function RevenueTrend({ data }: { data: TrendPoint[] }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const brand = dark ? "#6366f1" : "#4f46e5";
  const axis = dark ? "#94a3b8" : "#64748b";
  const grid = dark ? "#273248" : "#eef0f3";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#273248" : "#e5e7eb";

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted">
        No revenue data yet.
      </div>
    );
  }
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={brand} stopOpacity={0.25} />
              <stop offset="100%" stopColor={brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: axis }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: axis }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `$${Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v}`}
          />
          <Tooltip
            formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${tooltipBorder}`,
              background: tooltipBg,
              fontSize: 13,
            }}
            labelStyle={{ color: axis }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={brand}
            strokeWidth={2}
            fill="url(#rev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
