"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Inbox as InboxIcon, Mail, MailOpen, Phone, Reply, Trash2 } from "lucide-react";
import type { Message } from "@/lib/types";
import { fmtDate, timeAgo } from "@/lib/format";
import { api, Avatar, Button, Card, Empty, PageHeader, SearchInput, Segmented, useConfirm, useToast, cx } from "./ui";

export default function Inbox({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return [...messages]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((m) => (filter === "all" || !m.read) && (!s || [m.name, m.email, m.subject, m.message].some((v) => v.toLowerCase().includes(s))));
  }, [messages, filter, q]);
  const open = messages.find((m) => m.id === sel) || null;

  useEffect(() => {
    if (open && !open.read) {
      api(`/api/admin/c/messages/${open.id}`, "PATCH", { read: true }).then(() => router.refresh());
    }
  }, [open, router]);

  async function toggleRead(m: Message) {
    await api(`/api/admin/c/messages/${m.id}`, "PATCH", { read: !m.read });
    toast(m.read ? "Marked unread" : "Marked read");
    router.refresh();
  }
  async function del(m: Message) {
    if (!(await confirm("Delete this message?"))) return;
    await api(`/api/admin/c/messages/${m.id}`, "DELETE");
    setSel(null);
    toast("Message deleted");
    router.refresh();
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader title="Inbox" subtitle={`${unread} unread · ${messages.length} total`} actions={<SearchInput value={q} onChange={setQ} placeholder="Search messages…" />} />
      {messages.length === 0 ? (
        <Empty icon={<InboxIcon size={32} />} title="Inbox zero" text="Messages from your contact form appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className={cx(open && "hidden lg:block")}>
            <div className="mb-3">
              <Segmented layoutId="inbox-f" value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "unread", label: `Unread (${unread})` }]} />
            </div>
            <Card className="divide-y divide-black/[0.05] overflow-hidden">
              {list.map((m) => (
                <button key={m.id} onClick={() => setSel(m.id)} className={cx("flex w-full gap-3 px-4 py-3.5 text-left transition", sel === m.id ? "bg-[color-mix(in_oklab,var(--accent)_7%,white)]" : "hover:bg-paper")}>
                  <Avatar name={m.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cx("truncate text-sm", !m.read ? "font-semibold" : "font-medium text-neutral-700")}>{m.name}</span>
                      <span className="shrink-0 text-[11px] text-neutral-400">{timeAgo(m.createdAt)}</span>
                    </div>
                    <div className={cx("truncate text-[13px]", !m.read ? "text-ink" : "text-neutral-600")}>{m.subject}</div>
                    <div className="truncate text-xs text-neutral-400">{m.message}</div>
                  </div>
                  {!m.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />}
                </button>
              ))}
              {list.length === 0 && <div className="p-8 text-center text-sm text-neutral-400">Nothing matches.</div>}
            </Card>
          </div>
          <div className={cx(!open && "hidden lg:block")}>
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key={open.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Card className="p-5 sm:p-7">
                    <button onClick={() => setSel(null)} className="mb-4 flex items-center gap-1 text-sm text-neutral-500 lg:hidden">
                      <ArrowLeft size={15} /> Back
                    </button>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={open.name} className="h-12 w-12" />
                        <div>
                          <div className="font-semibold">{open.name}</div>
                          <div className="text-sm text-neutral-500">{open.email}</div>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400">{fmtDate(open.createdAt, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <h2 className="mt-6 text-xl font-semibold tracking-tight">{open.subject}</h2>
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-700">{open.message}</p>
                    {open.phone && (
                      <a href={`tel:${open.phone}`} className="mt-5 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-ink">
                        <Phone size={14} /> {open.phone}
                      </a>
                    )}
                    <div className="mt-8 flex flex-wrap gap-2 border-t border-black/[0.06] pt-5">
                      <a href={`mailto:${open.email}?subject=${encodeURIComponent("Re: " + open.subject)}`}>
                        <Button variant="primary"><Reply size={15} /> Reply by email</Button>
                      </a>
                      <Button onClick={() => toggleRead(open)}>{open.read ? <><Mail size={15} /> Mark unread</> : <><MailOpen size={15} /> Mark read</>}</Button>
                      <Button variant="danger" onClick={() => del(open)}><Trash2 size={15} /> Delete</Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Empty icon={<Mail size={32} />} title="Select a message" text="Pick a conversation from the list to read it." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
