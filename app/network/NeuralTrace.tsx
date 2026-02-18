"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import { X, BookOpen, Brain, Zap, Clock, Plus, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateNeuronMastery,
  deleteNeuron,
  createNeuron,
} from "./actions";

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
    _id?: string | null;
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
  if (mastery >= 80) return "#2dd4bf";
  if (mastery >= 50) return "#a78bfa";
  if (mastery >= 25) return "#fb923c";
  return "#6b7280";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function NeuralTrace({ neurons }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });
  const [selected, setSelected] = useState<NeuronNode | null>(null);
  const [localMastery, setLocalMastery] = useState<number>(0);
  const [masterySaved, setMasterySaved] = useState(false);
  const [savingMastery, startMasteryTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDeleteTransition] = useTransition();

  // Create neuron modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMastery, setNewMastery] = useState(0);
  const [newSynapses, setNewSynapses] = useState<string[]>([]);
  const [creating, startCreateTransition] = useTransition();

  // Sync local mastery when selected neuron changes
  useEffect(() => {
    setLocalMastery(selected?.masteryLevel ?? 0);
    setMasterySaved(false);
    setConfirmDelete(false);
  }, [selected?._id]);

  function handleMasteryCommit() {
    if (!selected) return;
    startMasteryTransition(async () => {
      await updateNeuronMastery(selected._id, localMastery);
      setMasterySaved(true);
      setTimeout(() => setMasterySaved(false), 2000);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!selected) return;
    startDeleteTransition(async () => {
      await deleteNeuron(selected._id);
      setSelected(null);
      setConfirmDelete(false);
      router.refresh();
    });
  }

  function handleCreateNeuron() {
    if (!newTitle.trim()) return;
    startCreateTransition(async () => {
      await createNeuron({ title: newTitle.trim(), masteryLevel: newMastery, synapseIds: newSynapses });
      setShowCreate(false);
      setNewTitle("");
      setNewMastery(0);
      setNewSynapses([]);
      router.refresh();
    });
  }

  // Build graph data
  const graphData = (() => {
    const nodes: GraphNode[] = neurons.map((n) => ({
      id: n._id,
      label: n.title,
      mastery: n.masteryLevel ?? 0,
      val: Math.max(4, (n.masteryLevel ?? 0) / 12),
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
    <div className="relative w-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {[
            { color: "#2dd4bf", label: "≥80%" },
            { color: "#a78bfa", label: "50–79%" },
            { color: "#fb923c", label: "25–49%" },
            { color: "#6b7280", label: "<25%" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-300 text-[#0a0f12] px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus size={14} /> New Neuron
        </button>
      </div>

      <div className="flex gap-6">
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

            {/* Mastery strength slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Mastery strength</span>
                <div className="flex items-center gap-2">
                  <span style={{ color: masteryColor(localMastery) }} className="text-xs font-semibold">
                    {localMastery}%
                  </span>
                  {masterySaved && (
                    <span className="text-teal-400 text-xs flex items-center gap-0.5">
                      <Check size={10} /> Saved
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={localMastery}
                onChange={(e) => setLocalMastery(Number(e.target.value))}
                disabled={savingMastery}
                className="w-full accent-teal-400 disabled:opacity-40"
              />
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${localMastery}%`, background: masteryColor(localMastery) }}
                />
              </div>
              {localMastery !== (selected.masteryLevel ?? 0) && (
                <button
                  onClick={handleMasteryCommit}
                  disabled={savingMastery}
                  className="mt-2 w-full text-xs py-1.5 rounded-lg bg-teal-400/20 border border-teal-400/40 text-teal-300 hover:bg-teal-400/30 disabled:opacity-40 transition-all"
                >
                  {savingMastery ? "Saving…" : "Apply"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Zap size={12} className="text-purple-400" />
                Synapses
              </div>
              <span className="text-white font-semibold">{selected.synapses?.length ?? 0}</span>
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

            {/* Delete */}
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 disabled:opacity-40 transition-all"
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-white/10 text-gray-500 hover:border-red-500/40 hover:text-red-400 transition-all"
              >
                <Trash2 size={12} /> Delete neuron
              </button>
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

      {/* Create Neuron Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl border border-white/10 p-6 w-full max-w-md mx-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">New Neuron</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Concept title *</label>
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNeuron()}
                placeholder="e.g. Action Potential"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-400/50 transition-colors"
              />
            </div>

            {/* Initial mastery */}
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">
                Initial mastery — <span className="text-teal-400">{newMastery}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={newMastery}
                onChange={(e) => setNewMastery(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>

            {/* Synapses (connect to existing) */}
            {neurons.length > 0 && (
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Connect to existing neurons</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {neurons.map((n) => (
                    <button
                      key={n._id}
                      onClick={() =>
                        setNewSynapses((prev) =>
                          prev.includes(n._id) ? prev.filter((id) => id !== n._id) : [...prev, n._id]
                        )
                      }
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        newSynapses.includes(n._id)
                          ? "bg-teal-400/20 border-teal-400/50 text-teal-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30"
                      }`}
                    >
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNeuron}
                disabled={!newTitle.trim() || creating}
                className="flex-1 bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-[#0a0f12] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                {creating ? "Creating…" : "Create neuron"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
