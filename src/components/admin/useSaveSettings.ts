"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";
import { api, useToast } from "./ui";

export function useSaveSettings() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  async function save(patch: Partial<Settings>, msg = "Settings saved") {
    setSaving(true);
    try {
      await api("/api/admin/settings", "PUT", patch);
      toast(msg);
      router.refresh();
      return true;
    } catch (e) {
      toast((e as Error).message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }
  return { save, saving };
}
