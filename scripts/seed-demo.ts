/**
 * Seed demo neurons + demo textbooks into Sanity.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Env vars read from .env / .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_TOKEN   (needs write access — Editor or higher)
 *
 * Idempotent — re-running skips anything already created.
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

// Load from .env then .env.local (whichever exists)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-02-10",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

// ─── Demo data definition ───────────────────────────────────────────────────
//
// Each neuron has a unique `key` used as its Sanity document _id prefix so the
// script stays idempotent.  `synapses` lists the keys of neurons it connects to.

interface NeuronDef {
  key: string;        // stable identifier → used as _id: "demo-neuron-<key>"
  title: string;
  masteryLevel: number;
  synapses: string[]; // keys of connected neurons
}

const DEMO_NEURONS: NeuronDef[] = [
  // Neuroscience fundamentals cluster
  { key: "action-potential",   title: "Action Potential",          masteryLevel: 82, synapses: ["synaptic-transmission", "ion-channels"] },
  { key: "synaptic-transmission", title: "Synaptic Transmission",  masteryLevel: 74, synapses: ["neurotransmitters", "action-potential"] },
  { key: "ion-channels",       title: "Ion Channels",              masteryLevel: 60, synapses: ["action-potential", "membrane-potential"] },
  { key: "membrane-potential", title: "Membrane Potential",        masteryLevel: 55, synapses: ["ion-channels", "resting-potential"] },
  { key: "resting-potential",  title: "Resting Potential",         masteryLevel: 70, synapses: ["membrane-potential", "sodium-potassium-pump"] },
  { key: "sodium-potassium-pump", title: "Na⁺/K⁺ ATPase Pump",    masteryLevel: 45, synapses: ["resting-potential", "ion-channels"] },
  { key: "neurotransmitters",  title: "Neurotransmitters",         masteryLevel: 65, synapses: ["synaptic-transmission", "receptor-binding"] },
  { key: "receptor-binding",   title: "Receptor Binding",          masteryLevel: 50, synapses: ["neurotransmitters", "signal-transduction"] },
  { key: "signal-transduction",title: "Signal Transduction",       masteryLevel: 38, synapses: ["receptor-binding", "gene-expression"] },
  { key: "gene-expression",    title: "Gene Expression",           masteryLevel: 30, synapses: ["signal-transduction"] },

  // Learning & memory cluster
  { key: "ltp",                title: "Long-Term Potentiation",    masteryLevel: 78, synapses: ["hebb-rule", "synaptic-transmission"] },
  { key: "hebb-rule",          title: "Hebbian Learning Rule",     masteryLevel: 85, synapses: ["ltp", "synaptic-plasticity"] },
  { key: "synaptic-plasticity",title: "Synaptic Plasticity",       masteryLevel: 68, synapses: ["hebb-rule", "ltp", "nmda-receptor"] },
  { key: "nmda-receptor",      title: "NMDA Receptor",             masteryLevel: 55, synapses: ["synaptic-plasticity", "receptor-binding"] },
  { key: "hippocampus",        title: "Hippocampus",               masteryLevel: 72, synapses: ["ltp", "memory-consolidation"] },
  { key: "memory-consolidation",title: "Memory Consolidation",     masteryLevel: 60, synapses: ["hippocampus", "sleep-learning"] },
  { key: "sleep-learning",     title: "Sleep & Memory",            masteryLevel: 42, synapses: ["memory-consolidation"] },
];

// Visual neuroscience neurons — derived from vision_neuro.pdf (MIT 9.01)
const VISION_NEURONS: NeuronDef[] = [
  // Perception & light
  { key: "visual-perception",     title: "Visual Perception",              masteryLevel: 70, synapses: ["reflectance", "simultaneous-contrast", "color-space"] },
  { key: "reflectance",           title: "Reflectance & Luminance",        masteryLevel: 58, synapses: ["visual-perception", "simultaneous-contrast"] },
  { key: "simultaneous-contrast", title: "Simultaneous Contrast Illusion", masteryLevel: 45, synapses: ["reflectance"] },
  // Color
  { key: "color-space",           title: "Color Space (3D)",               masteryLevel: 65, synapses: ["visual-perception", "wavelength-spectrum", "young-helmholtz", "cone-types"] },
  { key: "wavelength-spectrum",   title: "Wavelength & Light Spectrum",    masteryLevel: 72, synapses: ["color-space"] },
  { key: "young-helmholtz",       title: "Young-Helmholtz Trichromacy",    masteryLevel: 78, synapses: ["color-space", "dual-process-vision"] },
  { key: "cone-types",            title: "Cone Types (R/G/B)",             masteryLevel: 68, synapses: ["color-space", "spectral-sensitivity", "color-blindness"] },
  { key: "spectral-sensitivity",  title: "Spectral Sensitivity of Cones",  masteryLevel: 55, synapses: ["cone-types", "color-opponency"] },
  { key: "color-blindness",       title: "Color Blindness",                masteryLevel: 40, synapses: ["cone-types"] },
  // Phototransduction
  { key: "rhodopsin",             title: "Rhodopsin & Photoactivation",    masteryLevel: 60, synapses: ["cone-types", "phototransduction"] },
  { key: "phototransduction",     title: "Phototransduction Cascade",      masteryLevel: 52, synapses: ["rhodopsin", "gpcr-vision"] },
  { key: "gpcr-vision",           title: "GPCR Signaling (Vision)",        masteryLevel: 44, synapses: ["phototransduction"] },
  // Color opponency
  { key: "color-opponency",       title: "Color Opponency",                masteryLevel: 63, synapses: ["spectral-sensitivity", "opponent-process", "p-cells"] },
  { key: "opponent-process",      title: "Hering Opponent Process Theory", masteryLevel: 70, synapses: ["color-opponency", "dual-process-vision"] },
  { key: "p-cells",               title: "P Cells (Retinal Ganglion)",     masteryLevel: 48, synapses: ["color-opponency", "retinal-ganglion"] },
  { key: "dual-process-vision",   title: "Dual Process Theory (Vision)",   masteryLevel: 75, synapses: ["young-helmholtz", "opponent-process"] },
  // Visual pathway
  { key: "retina",                title: "Retina",                         masteryLevel: 80, synapses: ["retinal-ganglion", "rhodopsin", "phototransduction"] },
  { key: "retinal-ganglion",      title: "Retinal Ganglion Cells",         masteryLevel: 65, synapses: ["retina", "p-cells", "center-surround"] },
  { key: "retinofugal-proj",      title: "Retinofugal Projection",         masteryLevel: 55, synapses: ["retina", "lgn", "visual-hemifields"] },
  { key: "visual-hemifields",     title: "Visual Hemifields",              masteryLevel: 60, synapses: ["retinofugal-proj"] },
  { key: "lgn",                   title: "Lateral Geniculate Nucleus (LGN)", masteryLevel: 58, synapses: ["retinofugal-proj", "v1"] },
  { key: "v1",                    title: "Primary Visual Cortex (V1)",     masteryLevel: 72, synapses: ["lgn", "simple-cells", "center-surround"] },
  { key: "simple-cells",          title: "Simple Cell Receptive Fields",   masteryLevel: 65, synapses: ["v1", "orientation-selectivity"] },
  { key: "orientation-selectivity", title: "Orientation Selectivity",      masteryLevel: 58, synapses: ["simple-cells"] },
  { key: "center-surround",       title: "Center-Surround Receptive Field", masteryLevel: 62, synapses: ["retinal-ganglion", "v1"] },
];

const DEMO_TEXTBOOK = {
  key: "intro-neuroscience",
  title: "Introduction to Neuroscience (Demo)",
};

const VISION_TEXTBOOK = {
  key: "vision-neuro-mit",
  title: "Visual Neuroscience — MIT 9.01 (Demo)",
  localPdf: "public/vision_neuro.pdf",
  publicPath: "/vision_neuro.pdf",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function neuronId(key: string) {
  return `demo-neuron-${key}`;
}

async function seedNeuronBatch(neurons: NeuronDef[], label: string) {
  const existing = await client.fetch<{ _id: string }[]>(
    `*[_type == "neuron" && isDemo == true]{ _id }`
  );
  const existingIds = new Set(existing.map((n) => n._id));
  const toCreate = neurons.filter((n) => !existingIds.has(neuronId(n.key)));

  if (toCreate.length === 0) {
    console.log(`✅  ${label} neurons already exist — skipping.`);
    return;
  }

  console.log(`➕  Creating ${toCreate.length} ${label} neuron(s)…`);
  const tx = client.transaction();
  for (const n of toCreate) {
    tx.createOrReplace({
      _id: neuronId(n.key),
      _type: "neuron",
      title: n.title,
      masteryLevel: n.masteryLevel,
      isDemo: true,
      synapses: [],
    });
  }
  await tx.commit();
  console.log("   ✔  Neurons created.");

  console.log("🔗  Wiring synapses…");
  const patchTx = client.transaction();
  for (const n of neurons) {
    if (n.synapses.length === 0) continue;
    patchTx.patch(neuronId(n.key), {
      set: {
        synapses: n.synapses.map((sk) => ({
          _type: "reference" as const,
          _ref: neuronId(sk),
          _key: sk,
        })),
      },
    });
  }
  await patchTx.commit();
  console.log("   ✔  Synapses wired.");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔌  Connected to project ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID} / ${process.env.NEXT_PUBLIC_SANITY_DATASET}\n`);

  // ── General neuroscience neurons ─────────────────────────────────────────
  await seedNeuronBatch(DEMO_NEURONS, "general neuroscience");

  // ── Vision neuroscience neurons ───────────────────────────────────────────
  console.log();
  await seedNeuronBatch(VISION_NEURONS, "visual neuroscience");

  // ── Generic demo textbook ────────────────────────────────────────────────
  const textbookId = `demo-textbook-${DEMO_TEXTBOOK.key}`;
  const existingBook = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`, { id: textbookId }
  );
  if (existingBook) {
    console.log("\n📚  General demo textbook already exists — skipping.");
  } else {
    console.log("\n📚  Creating general demo textbook…");
    await client.createOrReplace({
      _id: textbookId,
      _type: "textbook",
      title: DEMO_TEXTBOOK.title,
      isDemo: true,
      neurons: DEMO_NEURONS.map((n) => ({
        _type: "reference",
        _ref: neuronId(n.key),
        _key: n.key,
      })),
    });
    console.log("   ✔  Done.");
  }

  // ── Vision textbook — upload PDF to Sanity ────────────────────────────────
  const visionTextbookId = `demo-textbook-${VISION_TEXTBOOK.key}`;
  const existingVision = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`, { id: visionTextbookId }
  );

  if (existingVision) {
    console.log("\n📚  Vision textbook already exists — skipping.");
  } else {
    console.log("\n📚  Uploading vision_neuro.pdf to Sanity…");
    const pdfBuffer = readFileSync(resolve(process.cwd(), VISION_TEXTBOOK.localPdf));
    const asset = await client.assets.upload("file", pdfBuffer, {
      filename: "vision_neuro.pdf",
      contentType: "application/pdf",
    });
    console.log(`   ✔  PDF uploaded (asset ${asset._id}).`);

    console.log("📚  Creating vision textbook…");
    await client.createOrReplace({
      _id: visionTextbookId,
      _type: "textbook",
      title: VISION_TEXTBOOK.title,
      isDemo: true,
      file: {
        _type: "file",
        asset: { _type: "reference", _ref: asset._id },
      },
      neurons: VISION_NEURONS.map((n) => ({
        _type: "reference",
        _ref: neuronId(n.key),
        _key: n.key,
      })),
    });
    console.log("   ✔  Vision textbook created.");
  }

  console.log("\n🎉  Done! Demo content is live in Sanity.");
}

main().catch((err) => {
  console.error("❌  Seed failed:", err.message ?? err);
  process.exit(1);
});
