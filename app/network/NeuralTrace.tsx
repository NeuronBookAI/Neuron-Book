"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, BookOpen, Brain, Zap, Clock, BarChart2 } from "lucide-react";
import Link from "next/link";

// Dynamically import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gray-400 text-sm animate-pulse">Loading graph…</div>
    </div>
  ),
});

export interface NeuronNode {
  _id: string;
  title: string;
  masteryLevel?: number | null;
  synapses?: { _id: string; title: string; masteryLevel?: number | null }[] | null;
  mastery?: {
    srs?: {
      lastReviewed?: string | null;
      nextReviewDate?: string | null;
      confidence?: number | null;
      interval?: number | null;
    } | null;
  } | null;
  textbook?: {
    _id: string;
    title: string;
    file?: { asset?: { url: string } | null } | null;
  } | null;
}

interface GraphNode {
  id: string;
  label: string;
  mastery: number;
  val: number; // node size
  data: NeuronNode;
}

interface GraphLink {
  source: string;
  target: string;
}

interface Props {
  neurons: NeuronNode[];
}

function masteryColor(mastery: number): string {
  if (mastery >= 80) return "#2dd4bf"; // teal
  if (mastery >= 50) return "#a78bfa"; // purple
  if (mastery >= 25) return "#fb923c"; // orange
  return "#6b7280"; // gray
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function NeuralTrace({ neurons }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });
  const [selected, setSelected] = useState<NeuronNode | null>(null);

  // Build graph data
  const graphData = (() => {
    const nodes: GraphNode[] = neurons.map((n) => ({
      id: n._id,
      label: n.title,
      mastery: n.masteryLevel ?? 0,
      val: Math.max(4, (n.masteryLevel ?? 0) / 12), // bigger = stronger
      data: n,
    }));

    const linkSet = new Set<string>();
    const links: GraphLink[] = [];
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

  // Measure container for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleNodeClick = useCallback((node: object) => {
    setSelected((node as GraphNode).data);
  }, []);

  // Custom canvas node rendering
  const paintNode = useCallback((node: object, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    const radius = Math.max(5, n.val * 1.8);
    const color = masteryColor(n.mastery);

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color + "33"; // translucent fill
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label — fixed small size, independent of node radius
    ctx.font = `7px Inter, sans-serif`;
    ctx.fillStyle = "rgba(209,213,219,0.75)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      n.label.length > 18 ? n.label.slice(0, 16) + "…" : n.label,
      n.x,
      n.y + radius + 7
    );
  }, []);

  const srs = selected?.mastery?.srs;
  const pdfUrl = selected?.textbook?.file?.asset?.url;
  const readerHref = pdfUrl
    ? `/reader?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(selected?.textbook?.title ?? "")}`
    : "/reader";

  return (
    <div className="relative w-full flex gap-6">
      {/* Graph canvas */}
      <div
        ref={containerRef}
        className="flex-1 rounded-2xl border border-white/10 bg-black/30 overflow-hidden"
        style={{ height: 540 }}
      >
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={() => "rgba(255,255,255,0.12)"}
          linkWidth={1.2}
          onNodeClick={handleNodeClick}
          backgroundColor="transparent"
          nodeLabel={(node) => `${(node as GraphNode).label} — ${(node as GraphNode).mastery}% mastery`}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          minZoom={0.6}
          maxZoom={4}
          enableNodeDrag={false}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-gray-400">
          {[
            { color: "#2dd4bf", label: "≥80%" },
            { color: "#a78bfa", label: "50–79%" },
            { color: "#fb923c", label: "25–49%" },
            { color: "#6b7280", label: "<25%" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="w-72 shrink-0 glass-panel rounded-2xl border border-white/10 p-5 flex flex-col gap-4 self-start">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-teal-400 shrink-0" />
              <h3 className="text-white font-semibold text-sm leading-tight">{selected.title}</h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-500 hover:text-white transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Mastery bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Mastery strength</span>
              <span style={{ color: masteryColor(selected.masteryLevel ?? 0) }} className="font-semibold">
                {selected.masteryLevel ?? 0}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${selected.masteryLevel ?? 0}%`,
                  background: masteryColor(selected.masteryLevel ?? 0),
                }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={12} className="text-purple-400" />
                <span className="text-gray-400 text-xs">Synapses</span>
              </div>
              <p className="text-white font-semibold text-lg">
                {selected.synapses?.length ?? 0}
              </p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart2 size={12} className="text-teal-400" />
                <span className="text-gray-400 text-xs">Confidence</span>
              </div>
              <p className="text-white font-semibold text-lg">
                {srs?.confidence != null ? `${srs.confidence}/5` : "—"}
              </p>
            </div>
          </div>

          {/* SRS dates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Clock size={11} /> Last reviewed
              </span>
              <span className="text-white">{formatDate(srs?.lastReviewed)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Clock size={11} /> Next review
              </span>
              <span className="text-white">{formatDate(srs?.nextReviewDate)}</span>
            </div>
            {srs?.interval != null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Interval</span>
                <span className="text-white">{srs.interval}d</span>
              </div>
            )}
          </div>

          {/* Connected neurons */}
          {selected.synapses && selected.synapses.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs mb-2">Connected neurons</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.synapses.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => {
                      const found = neurons.find((n) => n._id === s._id);
                      if (found) setSelected(found);
                    }}
                    className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-teal-400/40 hover:text-teal-300 transition-all"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textbook source */}
          {selected.textbook && (
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <BookOpen size={11} />
              <span className="truncate">{selected.textbook.title}</span>
            </div>
          )}

          {/* Study Now CTA */}
          <Link
            href={readerHref}
            className="mt-auto bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-4 py-2.5 rounded-xl font-semibold text-sm text-center transition-all"
          >
            Study now →
          </Link>
        </div>
      ) : (
        <div className="w-72 shrink-0 glass-panel rounded-2xl border border-white/10 p-5 flex flex-col items-center justify-center gap-3 self-start" style={{ height: 200 }}>
          <Brain size={28} className="text-white/20" />
          <p className="text-gray-500 text-sm text-center">Click any neuron to inspect its mastery and connections</p>
        </div>
      )}
    </div>
  );
}
