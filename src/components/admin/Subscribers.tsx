"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, Mail, Trash2 } from "lucide-react";
import type { Subscriber } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { api, Button, Card, Empty, PageHeader, SearchInput, downloadCsv, useConfirm, useToast } from "./ui";

export default function Subscribers({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const list = useMemo(() => [...subscribers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((s) => s.email.includes(q.toLowerCase())), [subscribers, q]);
  const month = subscribers.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 30 * 86400_000).length;

  async function del(s: Subscriber) {
    if (!(await confirm(`Unsubscribe ${s.email}?`))) return;
    await api(`/api/admin/c/subscribers/${s.id}`, "DELETE");
    toast("Subscriber removed");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="Newsletter"
        subtitle={`${subscribers.length} subscribers · ${month} joined in the last 30 days`}
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search email…" />
            <Button onClick={() => { navigator.clipboard.writeText(list.map((s) => s.email).join(", ")); toast("Emails copied"); }}><Copy size={15} /> Copy all</Button>
            <Button variant="primary" onClick={() => downloadCsv("subscribers.csv", list.map((s) => ({ email: s.email, joined: s.createdAt })))}><Download size={15} /> Export CSV</Button>
          </>
        }
      />
      {list.length === 0 ? (
        <Empty icon={<Mail size={32} />} title="No subscribers yet" text="The footer newsletter form feeds this list." />
      ) : (
        <Card className="divide-y divide-black/[0.05] overflow-hidden">
          {list.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-neutral-500"><Mail size={15} /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.email}</div>
                <div className="text-xs text-neutral-400">Joined {fmtDate(s.createdAt)}</div>
              </div>
              <button onClick={() => del(s)} className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove"><Trash2 size={15} /></button>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
