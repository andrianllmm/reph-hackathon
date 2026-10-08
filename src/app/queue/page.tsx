import { FilterBar } from "@/modules/queue/components/filter-bar";
import { QueueTable } from "@/modules/queue/components/queue-table";
import { filterOptions, listQueue } from "@/modules/queue/queries";

export const dynamic = "force-dynamic";

export default async function QueuePage({ searchParams }: PageProps<"/queue">) {
  const sp = await searchParams;
  const f = {
    segment: one(sp.segment),
    region: one(sp.region),
    tier: one(sp.tier),
    state: one(sp.state),
  };
  const [rows, opts] = await Promise.all([listQueue(f), filterOptions()]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Accounts at risk</h1>
        <p className="text-muted-foreground">Ranked by risk score, then ARR, then renewal date.</p>
      </div>

      <FilterBar options={{ ...opts, state: ["pending", "approved", "dismissed"] }} />

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <QueueTable rows={rows} />
      </div>
      <p className="text-muted-foreground text-xs">
        Showing top {rows.length} by score, then ARR, then renewal date. A prioritization aid, not a churn
        predictor.
      </p>
    </main>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
