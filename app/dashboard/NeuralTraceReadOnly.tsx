"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NeuronNode } from "../network/NeuralTrace";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gray-400 text-sm animate-pulse">Loading graph…</div>
    </div>
  ),
});

interface GraphNode {
  id: string;
  label: string;
  mastery: number;
  val: number;
}

function masteryColor(mastery: number): string {
  if (mastery >= 75) return "#5eead4";
  if (mastery >= 50) return "#a78bfa";
  if (mastery >= 25) return "#fb923c";
  return "#6b7280";
}

function masteryGlow(mastery: number): string {
  if (mastery >= 75) return "rgba(94,234,212,0.4)";
  if (mastery >= 50) return "rgba(167,139,250,0.4)";
  if (mastery >= 25) return "rgba(251,146,60,0.35)";
  return "rgba(107,114,128,0.25)";
}

export default function NeuralTraceReadOnly({
  neurons,
}: {
  neurons: NeuronNode[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 460 });

  const graphData = (() => {
    const nodes: GraphNode[] = neurons.map((n) => ({
      id: n._id,
      label: n.title,
      mastery: n.masteryLevel ?? 0,
      val: Math.max(4, (n.masteryLevel ?? 0) / 12),
    }));

    const linkSet = new Set<string>();
    const links: { source: string; target: string }[] = [];
    for (const n of neurons) {
      for (const s of n.synapses ?? []) {
        const key = [n._id, s._id].sort().join("--");
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({ source: n._id, target: s._id });
        }
      }
    }
    return { nodes, links };
  })();

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const paintNode = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode & { x: number; y: number };
      const x = n.x;
      const y = n.y;
      if (!isFinite(x) || !isFinite(y)) return;

      const r = Math.max(5, n.val * 1.8);
      const color = masteryColor(n.mastery);

      // Radial glow halo
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
      grd.addColorStop(0, masteryGlow(n.mastery));
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Solid node circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Label — scales with zoom
      const fontSize = Math.max(8 / globalScale, 3.5);
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        n.label.length > 18 ? n.label.slice(0, 16) + "…" : n.label,
        x,
        y + r + 2 / globalScale,
      );
    },
    [],
  );

  return (
    <div className="h-full glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span>🧠</span>
          <h3 className="text-sm font-semibold text-white">Neural Trace</h3>
          <span className="text-xs text-gray-500">
            {neurons.length} neurons
          </span>
        </div>
        <Link
          href="/network"
          className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          View full network <ArrowRight size={12} />
        </Link>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="flex-1 min-h-0">
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={() => "rgba(94,234,212,0.18)"}
          linkWidth={1.2}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={() => "#5eead4"}
          linkDirectionalParticleSpeed={0.004}
          backgroundColor="transparent"
          nodeLabel={(node) =>
            `${(node as GraphNode).label} — ${(node as GraphNode).mastery}% mastery`
          }
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          minZoom={0.6}
          maxZoom={4}
          enableNodeDrag={false}
          enableZoomInteraction={false}
          enablePanInteraction={false}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/10 shrink-0">
        {[
          { color: "#5eead4", label: "≥75%" },
          { color: "#a78bfa", label: "50–74%" },
          { color: "#fb923c", label: "25–49%" },
          { color: "#6b7280", label: "<25%" },
        ].map(({ color, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-[11px] text-gray-400"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
