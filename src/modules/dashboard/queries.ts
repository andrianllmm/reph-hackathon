import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { accountHealth, cases, customers, decisions, usageMonthly } from "@/modules/signals/schema";
import { AS_OF, type Reason } from "@/modules/signals/score";

const FLAG = 5;

const RULE_LABELS: Record<string, string> = {
  usage_drop_50: "Usage down >50%",
  usage_drop_25: "Usage down 25–50%",
  escalated: "Escalated case (90d)",
  low_csat: "CSAT < 3.5 (90d)",
  many_cases: "2+ cases (90d)",
};

/** Everything the home dashboard renders, computed live from the loaded tables. */
export async function dashboardData() {
  const [totals, scoreDist, flagged, usage, caseTrend, recentDecisions] = await Promise.all([
    db
      .select({
        accounts: sql<number>`count(*)`,
        arr: sql<number>`coalesce(sum(${accountHealth.arr}), 0)`,
        reviewed: sql<number>`coalesce(sum(case when ${accountHealth.score} >= ${FLAG} and ${accountHealth.state} != 'pending' then 1 else 0 end), 0)`,
      })
      .from(accountHealth),
    db
      .select({ score: accountHealth.score, count: sql<number>`count(*)` })
      .from(accountHealth)
      .groupBy(accountHealth.score)
      .orderBy(asc(accountHealth.score)),
    db
      .select({
        customerId: accountHealth.customerId,
        name: customers.name,
        segment: customers.segment,
        arr: accountHealth.arr,
        nextRenewal: accountHealth.nextRenewal,
        score: accountHealth.score,
        reasons: accountHealth.reasons,
      })
      .from(accountHealth)
      .innerJoin(customers, eq(customers.customerId, accountHealth.customerId))
      .where(sql`${accountHealth.score} >= ${FLAG}`)
      .orderBy(desc(accountHealth.arr)),
    db
      .select({ month: usageMonthly.month, sessions: sql<number>`sum(${usageMonthly.sessions})` })
      .from(usageMonthly)
      .groupBy(usageMonthly.month)
      .orderBy(asc(usageMonthly.month)),
    db
      .select({
        month: sql<string>`substr(${cases.createdAt}, 1, 7)`,
        total: sql<number>`count(*)`,
        escalated: sql<number>`coalesce(sum(${cases.escalated}), 0)`,
      })
      .from(cases)
      .where(sql`${cases.createdAt} > date(${AS_OF}, '-12 month')`)
      .groupBy(sql`substr(${cases.createdAt}, 1, 7)`)
      .orderBy(sql`1`),
    db
      .select({
        customerId: decisions.customerId,
        name: customers.name,
        action: decisions.action,
        createdAt: decisions.createdAt,
      })
      .from(decisions)
      .innerJoin(customers, eq(customers.customerId, decisions.customerId))
      .orderBy(desc(decisions.createdAt))
      .limit(5),
  ]);

  const in90 = addDays(AS_OF, 90);
  const renewing90 = flagged.filter((f) => f.nextRenewal && f.nextRenewal <= in90);

  const bySegment = new Map<string, { arr: number; count: number }>();
  const byRule = new Map<string, number>();
  for (const f of flagged) {
    const s = bySegment.get(f.segment) ?? { arr: 0, count: 0 };
    bySegment.set(f.segment, { arr: s.arr + f.arr, count: s.count + 1 });
    for (const r of JSON.parse(f.reasons) as Reason[]) byRule.set(r.rule, (byRule.get(r.rule) ?? 0) + 1);
  }

  // Flagged ARR renewing in each of the next 12 months (empty months kept so the axis is continuous).
  const months = Array.from({ length: 12 }, (_, i) => addMonths(AS_OF.slice(0, 7), i));
  const renewals = months.map((month) => {
    const rows = flagged.filter((f) => f.nextRenewal?.startsWith(month));
    return { month, arr: sum(rows.map((r) => r.arr)), count: rows.length };
  });

  const t = totals[0];
  const flaggedArr = sum(flagged.map((f) => f.arr));
  return {
    kpis: {
      accounts: t.accounts,
      flagged: flagged.length,
      flaggedArr,
      arrShare: t.arr ? flaggedArr / t.arr : 0,
      renewing90: renewing90.length,
      renewing90Arr: sum(renewing90.map((r) => r.arr)),
      reviewed: t.reviewed,
    },
    scoreDist: scoreDist.map((s) => ({ score: String(s.score), count: s.count, flagged: s.score >= FLAG })),
    segments: [...bySegment]
      .map(([segment, v]) => ({ segment, ...v }))
      .sort((a, b) => b.arr - a.arr),
    drivers: [...byRule]
      .map(([rule, count]) => ({ driver: RULE_LABELS[rule] ?? rule, count }))
      .sort((a, b) => b.count - a.count),
    renewals,
    usage,
    caseTrend,
    topAccounts: flagged.slice(0, 6).map(({ reasons, ...f }) => ({
      ...f,
      topReason: (JSON.parse(reasons) as Reason[])[0]?.text ?? "",
    })),
    recentDecisions,
  };
}

export type DashboardData = Awaited<ReturnType<typeof dashboardData>>;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}
