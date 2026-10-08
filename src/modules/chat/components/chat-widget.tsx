"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquareIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chat } from "./chat";

/** Floating bottom-right assistant. Stays mounted (just hidden) so the conversation survives navigation. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  // The dedicated /ask page already shows the full chat.
  if (usePathname() === "/ask") return null;
  return (
    <>
      <div
        className={cn(
          "bg-background fixed right-4 bottom-20 z-50 flex w-[min(28rem,calc(100vw-2rem))] flex-col rounded-xl border shadow-2xl",
          !open && "hidden",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div>
            <p className="text-sm font-semibold">Ask your portfolio</p>
            <p className="text-muted-foreground text-xs">AI agent · read-only queries · you approve decisions</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close assistant">
            <XIcon className="size-4" />
          </Button>
        </div>
        <Chat className="h-[min(26rem,calc(100vh-12rem))] p-3" />
      </div>
      <Button
        size="icon"
        className="fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <XIcon className="size-5" /> : <MessageSquareIcon className="size-5" />}
      </Button>
    </>
  );
}
