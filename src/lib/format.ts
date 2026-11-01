export function money(n: number, currency = "₹") {
  return `${currency}${Math.round(n).toLocaleString("en-IN")}`;
}

export function fmtDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!d) return "";
  const date = d.length === 10 ? new Date(d + "T00:00:00") : new Date(d);
  return date.toLocaleDateString("en-IN", opts);
}

export function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(d);
}

export function to12h(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Returns open status for "now" given weekly hours (supports past-midnight closing). */
export function openStatus(hours: { day: string; open: string; close: string; closed: boolean }[], at = new Date()) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const nowMin = at.getHours() * 60 + at.getMinutes();
  const today = hours.find((h) => h.day === days[at.getDay()]);
  const yesterday = hours.find((h) => h.day === days[(at.getDay() + 6) % 7]);
  if (yesterday && !yesterday.closed && toMin(yesterday.close) < toMin(yesterday.open) && nowMin < toMin(yesterday.close)) {
    return { open: true, label: `Open till ${to12h(yesterday.close)}` };
  }
  if (today && !today.closed) {
    const o = toMin(today.open);
    let c = toMin(today.close);
    if (c < o) c += 24 * 60;
    if (nowMin >= o && nowMin < c) return { open: true, label: `Open till ${to12h(today.close)}` };
    if (nowMin < o) return { open: false, label: `Opens ${to12h(today.open)}` };
  }
  return { open: false, label: "Closed now" };
}
