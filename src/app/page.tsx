import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CaseTrendChart,
  DriversChart,
  RenewalPipelineChart,
  ScoreDistributionChart,
  SegmentArrChart,
  UsageTrendChart,
} from "@/modules/dashboard/components/charts";
import { dashboardData } from "@/modules/dashboard/queries";
import { ScoreBadge } from "@/modules/signals/score-badge";

export const dynamic = "force-dynamic";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const compactUsd = (n: number) =>
  `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default async function DashboardPage() {
  const d = await dashboardData();
  const k = d.kpis;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Portfolio health</h1>
          <p className="text-muted-foreground">
            {k.accounts.toLocaleString()} accounts scored. Flagged means risk score ≥ 5.
          </p>
        </div>
        <Link href="/queue" className={buttonVariants()}>
          Open work queue →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Accounts flagged"
          value={k.flagged.toLocaleString()}
          hint={`${pct(k.flagged / k.accounts)} of portfolio`}
        />
        <Kpi label="ARR at risk" value={compactUsd(k.flaggedArr)} hint={`${pct(k.arrShare)} of total ARR`} />
        <Kpi
          label="Flagged, renewing ≤ 90 days"
          value={k.renewing90.toLocaleString()}
          hint={`${compactUsd(k.renewing90Arr)} ARR up for renewal`}
        />
        <Kpi
          label="Flagged accounts reviewed"
          value={`${k.reviewed} / ${k.flagged}`}
          hint={`${pct(k.flagged ? k.reviewed / k.flagged : 0)} triaged by a CSM`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Renewal pipeline at risk" desc="Flagged ARR by renewal month, next 12 months">
          <RenewalPipelineChart data={d.renewals} />
        </Panel>
        <Panel title="ARR at risk by segment" desc="Sum of ARR for flagged accounts">
          <SegmentArrChart data={d.segments} />
        </Panel>
        <Panel title="Risk score distribution" desc="All accounts; flagged scores (≥ 5) highlighted">
          <ScoreDistributionChart data={d.scoreDist} />
        </Panel>
        <Panel title="What's driving risk" desc="How often each rule fires among flagged accounts">
          <DriversChart data={d.drivers} />
        </Panel>
        <Panel title="Portfolio usage" desc="Total sessions per month, all accounts">
          <UsageTrendChart data={d.usage} />
        </Panel>
        <Panel title="Support cases" desc="Cases opened per month, last 12 months">
          <CaseTrendChart data={d.caseTrend} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Largest flagged accounts" desc="By ARR" className="lg:col-span-2">
          <ul className="divide-y">
            {d.topAccounts.map((a) => (
              <li key={a.customerId} className="flex items-center gap-3 py-2.5">
                <ScoreBadge score={a.score} />
                <div className="min-w-0 flex-1">
                  <Link href={`/accounts/${a.customerId}`} className="font-medium hover:underline">
                    {a.name}
                  </Link>
                  <div className="text-muted-foreground truncate text-xs">
                    {a.segment} · {a.topReason}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium tabular-nums">{usd(a.arr)}</div>
                  <div className="text-muted-foreground text-xs">renews {a.nextRenewal ?? "—"}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent decisions" desc="Human-reviewed actions">
          {d.recentDecisions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No decisions yet. Review accounts from the queue.</p>
          ) : (
            <ul className="divide-y">
              {d.recentDecisions.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/accounts/${r.customerId}`} className="block truncate font-medium hover:underline">
                      {r.name}
                    </Link>
                    <div className="text-muted-foreground text-xs">{r.createdAt.slice(0, 10)}</div>
                  </div>
                  <Badge variant={r.action === "approved" ? "secondary" : "outline"}>{r.action}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className="text-muted-foreground text-xs">
        Computed live from the loaded data. A prioritization aid, not a churn predictor.
      </p>
    </main>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        <div className="text-muted-foreground text-xs">{hint}</div>
      </CardContent>
    </Card>
  );
}

function Panel({
  title,
  desc,
  className,
  children,
}: {
  title: string;
  desc: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
