import { promises as fs } from "fs";
import path from "path";
import { getDataDir, readDb } from "@/lib/db";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safe = path.basename(file);
  await readDb();
  try {
    const buf = await fs.readFile(path.join(getDataDir(), "uploads", safe));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": TYPES[path.extname(safe).toLowerCase()] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
