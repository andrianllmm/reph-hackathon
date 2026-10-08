"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DashboardData } from "@/modules/dashboard/queries";

const compactUsd = (n: number) =>
  `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

const axis = { tickLine: false, axisLine: false, tickMargin: 8, fontSize: 12 } as const;

export function ScoreDistributionChart({ data }: { data: DashboardData["scoreDist"] }) {
  const config = { count: { label: "Accounts", color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="h-56 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="score" {...axis} />
        <YAxis {...axis} width={40} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelFormatter={(v) => `Score ${v}`} />}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.score} fill={d.flagged ? "var(--color-count)" : "var(--muted-foreground)"} fillOpacity={d.flagged ? 1 : 0.3} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function SegmentArrChart({ data }: { data: DashboardData["segments"] }) {
  const config = { arr: { label: "ARR at risk", color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" {...axis} tickFormatter={compactUsd} />
        <YAxis type="category" dataKey="segment" {...axis} width={130} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(v, _n, item) => (
                <span>
                  {usd(Number(v))} · {item.payload.count} accounts
                </span>
              )}
            />
          }
        />
        <Bar dataKey="arr" fill="var(--color-arr)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export function DriversChart({ data }: { data: DashboardData["drivers"] }) {
  const config = { count: { label: "Flagged accounts", color: "var(--chart-2)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" {...axis} allowDecimals={false} />
        <YAxis type="category" dataKey="driver" {...axis} width={140} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export function RenewalPipelineChart({ data }: { data: DashboardData["renewals"] }) {
  const config = { arr: { label: "Flagged ARR renewing", color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" {...axis} tickFormatter={monthLabel} />
        <YAxis {...axis} width={56} tickFormatter={compactUsd} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(v) => monthLabel(String(v))}
              formatter={(v, _n, item) => (
                <span>
                  {usd(Number(v))} · {item.payload.count} accounts
                </span>
              )}
            />
          }
        />
        <Bar dataKey="arr" fill="var(--color-arr)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function UsageTrendChart({ data }: { data: DashboardData["usage"] }) {
  const config = { sessions: { label: "Sessions", color: "var(--chart-1)" } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <defs>
          <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" {...axis} tickFormatter={monthLabel} minTickGap={24} />
        <YAxis
          {...axis}
          width={48}
          tickFormatter={(n) => Intl.NumberFormat("en-US", { notation: "compact" }).format(n)}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="line" labelFormatter={(v) => monthLabel(String(v))} />}
        />
        <Area
          dataKey="sessions"
          type="monotone"
          stroke="var(--color-sessions)"
          strokeWidth={2}
          fill="url(#fillSessions)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function CaseTrendChart({ data }: { data: DashboardData["caseTrend"] }) {
  const config = {
    other: { label: "Not escalated", color: "var(--chart-3)" },
    escalated: { label: "Escalated", color: "var(--chart-2)" },
  } satisfies ChartConfig;
  const rows = data.map((d) => ({ month: d.month, escalated: d.escalated, other: d.total - d.escalated }));
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={rows} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" {...axis} tickFormatter={monthLabel} minTickGap={16} />
        <YAxis {...axis} width={40} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(v) => monthLabel(String(v))} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="escalated" stackId="a" fill="var(--color-escalated)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="other" stackId="a" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
