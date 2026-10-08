import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBrief } from "../actions";
import { OutreachPanel } from "./brief-panel";

/** Server component: the brief is generated (or read from cache) when the page renders; no button. */
export async function BriefSection({ customerId, state }: { customerId: string; state: string }) {
  const res = await generateBrief(customerId);
  if ("error" in res)
    return (
      <Card>
        <CardContent className="text-destructive py-6 text-sm">{res.error}</CardContent>
      </Card>
    );
  const b = res.brief;
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Brief</CardTitle>
          <CardDescription>
            {res.source === "ai" ? "AI-generated" : "Template fallback (AI unavailable)"}
            {res.dropped > 0 && ` · ${res.dropped} uncited claim(s) dropped`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          <p className="text-base leading-relaxed">{b.summary}</p>
          <div className="flex items-start gap-2">
            <span className="shrink-0 font-medium">Likely driver</span>
            <Badge className="h-auto shrink whitespace-normal rounded-lg text-left">{b.likely_driver}</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 font-medium">Evidence</div>
              <ul className="space-y-2">
                {b.evidence.map((e) => (
                  <li key={`${e.type}-${e.id}`}>
                    <a href={`#${e.type}-${e.id}`} className="text-primary font-mono text-xs hover:underline">
                      {e.id}
                    </a>{" "}
                    {e.claim}
                  </li>
                ))}
                {b.evidence.length === 0 && <li className="text-muted-foreground">No verified evidence.</li>}
              </ul>
            </div>
            <div>
              <div className="mb-2 font-medium">Proposed actions</div>
              <ul className="list-disc space-y-2 pl-5">
                {b.actions.map((a) => (
                  <li key={a.label}>
                    <span className="font-medium">{a.label}</span>: {a.rationale}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Outreach</CardTitle>
          <CardDescription>AI-generated, not sent. Edit, then approve or dismiss.</CardDescription>
        </CardHeader>
        <CardContent>
          <OutreachPanel customerId={customerId} state={state} initialDraft={b.draft_email} />
        </CardContent>
      </Card>
    </>
  );
}
