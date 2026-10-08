import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/modules/signals/score-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefSection } from "@/modules/ai-brief/components/brief-card";
import { CaseTable } from "@/modules/queue/components/case-table";
import { UsageChart } from "@/modules/queue/components/usage-chart";
import { getAccount } from "@/modules/queue/queries";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: PageProps<"/accounts/[id]">) {
  const { id } = await params;
  const a = await getAccount(id);
  if (!a) notFound();
  const { customer: c, health: h } = a;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
      <div>
        <Link href="/queue" className="text-muted-foreground text-sm hover:underline">
          ← Queue
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{c.name}</h1>
          <ScoreBadge score={h.score} />
        </div>
        <p className="text-muted-foreground text-sm">
          {c.segment} · {c.region} · {c.tier} · owner {c.ownerId ?? "—"} · ARR ${Math.round(h.arr).toLocaleString()} ·
          renews {h.nextRenewal ?? "—"}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Suspense
            fallback={
              <div className="space-y-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <BriefSection customerId={c.customerId} state={h.state} />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Triggered rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {h.reasons.map((r) => (
                <div key={r.rule} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span>{r.text}</span>
                  <Badge variant="secondary">+{r.points}</Badge>
                </div>
              ))}
              {h.reasons.length === 0 && (
                <p className="text-muted-foreground">No rules triggered; this account is not flagged.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sessions per month</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageChart data={a.usage} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Decision log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {a.decisions.map((d) => (
                <div key={d.id}>
                  <span className="font-medium">{d.action}</span>{" "}
                  <span className="text-muted-foreground text-xs">{d.createdAt.slice(0, 19)}</span>
                  {d.note && <div className="text-muted-foreground">{d.note}</div>}
                </div>
              ))}
              {a.decisions.length === 0 && <p className="text-muted-foreground">No decisions yet.</p>}
            </CardContent>
          </Card>
        </div>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case timeline</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <CaseTable rows={a.cases} />
        </CardContent>
      </Card>
    </main>
  );
}
