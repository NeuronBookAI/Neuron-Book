"use client";

import { useEffect, useRef, useState } from "react";

/* ── Dummy neuron graph data ─────────────────────────────────────────────── */
interface DemoNode {
  id: string;
  label: string;
  mastery: number; // 0–100
  x?: number;
  y?: number;
}

interface DemoLink {
  source: string;
  target: string;
}

const NODES: DemoNode[] = [
  { id: "visual-perception", label: "Visual Perception", mastery: 88 },
  { id: "pattern-recognition", label: "Pattern Recognition", mastery: 74 },
  { id: "working-memory", label: "Working Memory", mastery: 62 },
  { id: "long-term-memory", label: "Long-Term Memory", mastery: 48 },
  { id: "attention", label: "Attention", mastery: 91 },
  { id: "cognitive-load", label: "Cognitive Load", mastery: 55 },
  { id: "neural-plasticity", label: "Neural Plasticity", mastery: 80 },
  { id: "synaptic-strength", label: "Synaptic Strength", mastery: 67 },
  { id: "metacognition", label: "Metacognition", mastery: 72 },
  { id: "spaced-repetition", label: "Spaced Repetition", mastery: 85 },
  { id: "active-recall", label: "Active Recall", mastery: 78 },
  { id: "chunking", label: "Chunking", mastery: 50 },
];

const LINKS: DemoLink[] = [
  { source: "visual-perception", target: "pattern-recognition" },
  { source: "visual-perception", target: "attention" },
  { source: "pattern-recognition", target: "working-memory" },
  { source: "pattern-recognition", target: "neural-plasticity" },
  { source: "working-memory", target: "long-term-memory" },
  { source: "working-memory", target: "cognitive-load" },
  { source: "attention", target: "cognitive-load" },
  { source: "attention", target: "metacognition" },
  { source: "long-term-memory", target: "synaptic-strength" },
  { source: "long-term-memory", target: "spaced-repetition" },
  { source: "metacognition", target: "active-recall" },
  { source: "metacognition", target: "spaced-repetition" },
  { source: "spaced-repetition", target: "active-recall" },
  { source: "active-recall", target: "chunking" },
  { source: "synaptic-strength", target: "neural-plasticity" },
  { source: "chunking", target: "working-memory" },
];

function nodeColor(mastery: number): string {
  if (mastery >= 75) return "#5eead4"; // teal — strong
  if (mastery >= 55) return "#a78bfa"; // purple — growing
  return "#4b5563"; // gray — weak
}

function nodeGlow(mastery: number): string {
  if (mastery >= 75) return "rgba(94,234,212,0.35)";
  if (mastery >= 55) return "rgba(167,139,250,0.35)";
  return "rgba(75,85,99,0.25)";
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function NeuralTraceDemoGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 400, height: 340 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ForceGraph, setForceGraph] = useState<any>(null);

  // Lazy-load the canvas library only on the client
  useEffect(() => {
    import("react-force-graph-2d").then((mod) =>
      setForceGraph(() => mod.default),
    );
  }, []);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDims({ width: Math.floor(width), height: 340 });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const graphData = { nodes: NODES.map((n) => ({ ...n })), links: LINKS };

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-2xl">
      {ForceGraph ? (
        <ForceGraph
          graphData={graphData}
          width={dims.width}
          height={dims.height}
          backgroundColor="transparent"
          /* links */
          linkColor={() => "rgba(94,234,212,0.18)"}
          linkWidth={1.2}
          minZoom={0.6}
          maxZoom={4}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={() => "#5eead4"}
          linkDirectionalParticleSpeed={0.004}
          /* nodes */
          nodeRelSize={4}
          nodeLabel={(node: DemoNode) => node.label}
          nodeCanvasObject={(
            node: DemoNode,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const r = 5;
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const color = nodeColor(node.mastery);

            // Outer glow
            const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
            grd.addColorStop(0, nodeGlow(node.mastery));
            grd.addColorStop(1, "transparent");
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Node circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Label
            const fontSize = Math.max(8 / globalScale, 3.5);
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(node.label, x, y + r + 2 / globalScale);
          }}
          nodeCanvasObjectMode={() => "replace"}
          cooldownTicks={120}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.3}
        />
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ height: 340 }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
