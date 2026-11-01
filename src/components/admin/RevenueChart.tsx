"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { money } from "@/lib/format";

export default function RevenueChart({ data, currency }: { data: { label: string; value: number }[]; currency: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 700;
  const H = 220;
  const P = { t: 16, r: 8, b: 26, l: 8 };
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.15;
  const x = (i: number) => P.l + (i / Math.max(1, data.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - v / max) * (H - P.t - P.b);
  // smooth path (catmull-rom → bezier)
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    line += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  const area = `${line} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={P.l} x2={W - P.r} y1={y(max * g)} y2={y(max * g)} stroke="#000" strokeOpacity="0.05" strokeDasharray="3 4" />
        ))}
        <motion.path d={area} fill="url(#rev-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
        <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
        {data.map((d, i) => (
          <g key={i}>
            <rect x={x(i) - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
            {(i % 2 === 0 || i === data.length - 1) && (
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#999">
                {d.label}
              </text>
            )}
          </g>
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="#000" strokeOpacity="0.15" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="white" stroke="var(--accent)" strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-2 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > data.length / 2 ? "-105%" : "5%"})` }}
        >
          <div className="text-white/60">{data[hover].label}</div>
          <div className="font-semibold">{money(data[hover].value, currency)}</div>
        </div>
      )}
    </div>
  );
}
