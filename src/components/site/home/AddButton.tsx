"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useCart, useSite } from "../providers";
import type { MenuItem } from "@/lib/types";

export default function AddButton({ item, className, label = false }: { item: Pick<MenuItem, "id" | "name" | "price" | "image" | "available">; className?: string; label?: boolean }) {
  const cart = useCart();
  const s = useSite();
  const [added, setAdded] = useState(false);
  if (!s.ordering.enabled) return null;
  const disabled = !item.available;
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      disabled={disabled}
      aria-label={`Add ${item.name} to bag`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        cart.add({ id: item.id, name: item.name, price: item.price, image: item.image });
        setAdded(true);
        setTimeout(() => setAdded(false), 1300);
      }}
      className={clsx(
        "relative flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-full text-[13px] font-medium transition-colors disabled:opacity-40",
        label ? "px-4" : "w-10",
        added ? "bg-emerald-600 text-white" : "bg-ink text-paper hover:bg-accent",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {added ? (
          <motion.span key="ok" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-1.5">
            <Check size={16} />
            {label && "Added"}
          </motion.span>
        ) : (
          <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-1.5">
            <Plus size={16} />
            {label && (disabled ? "Sold out" : "Add")}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export const TAG_LABEL: Record<string, string> = {
  veg: "Veg",
  vegan: "Vegan",
  spicy: "Spicy",
  chef: "Chef's pick",
  new: "New",
  gf: "Gluten-free",
  bestseller: "Bestseller",
};

export function VegMark({ veg }: { veg: boolean }) {
  return (
    <span title={veg ? "Vegetarian" : "Non-vegetarian"} className={clsx("inline-grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border", veg ? "border-emerald-600" : "border-red-700")}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", veg ? "bg-emerald-600" : "bg-red-700")} />
    </span>
  );
}
