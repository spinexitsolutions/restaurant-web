import { promises as fs } from "fs";
import path from "path";
import { getDataDir, readDb, uid } from "@/lib/db";
import { bad, ok, requireAdmin } from "@/lib/api";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return bad("No file");
  if (!file.type.startsWith("image/")) return bad("Only images are allowed");
  if (file.size > 8 * 1024 * 1024) return bad("Max 8MB");
  await readDb();
  const ext = (path.extname(file.name) || ".jpg").toLowerCase().replace(/[^.a-z]/g, "");
  const name = uid("img") + ext;
  const dir = path.join(getDataDir(), "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return ok({ url: `/api/media/${name}` });
}
