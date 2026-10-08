"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Opts = Record<"segment" | "region" | "tier" | "state", string[]>;

export function FilterBar({ options }: { options: Opts }) {
  const router = useRouter();
  const params = useSearchParams();

  const set = (key: string, v: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!v || v === "all") next.delete(key);
    else next.set(key, v);
    router.push(`/queue?${next.toString()}`);
  };

  return (
    <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
      {(Object.keys(options) as (keyof Opts)[]).map((key) => {
        const items = [{ value: "all", label: "All" }, ...options[key].map((o) => ({ value: o, label: o }))];
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <Label className="capitalize">{key}</Label>
            <Select items={items} value={params.get(key) ?? "all"} onValueChange={(v) => set(key, v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
      <Button variant="ghost" onClick={() => router.push("/queue")}>
        Reset
      </Button>
    </div>
  );
}
