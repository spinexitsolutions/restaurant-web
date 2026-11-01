"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui";

/** Floating "unsaved changes" bar — appears only when the form is dirty. */
export default function SaveBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm text-white shadow-2xl lg:bottom-6 lg:left-[264px]"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-soft)]" /> Unsaved changes
          </span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="!text-white/70 hover:!bg-white/10" onClick={onReset}>Discard</Button>
            <Button size="sm" variant="primary" loading={saving} onClick={onSave}>Save</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
