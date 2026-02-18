import { defineQuery } from "next-sanity";

// ── Textbooks ─────────────────────────────────────────────────────────────────

export const ALL_TEXTBOOKS_QUERY = defineQuery(`
  *[_type == "textbook"] | order(_createdAt desc) {
    _id,
    title,
    file { asset->{ url } },
    folder[]->{ _id, title },
    neurons[]->{ _id, title, masteryLevel },
    user->{ _id, username }
  }
`);

export const RECENT_TEXTBOOKS_QUERY = defineQuery(`
  *[_type == "textbook"] | order(_createdAt desc)[0..4] {
    _id,
    title,
    file { asset->{ url } },
    folder[]->{ _id, title },
    neurons[]->{ _id }
  }
`);

// ── Folders ───────────────────────────────────────────────────────────────────

export const ALL_FOLDERS_QUERY = defineQuery(`
  *[_type == "folder"] | order(title asc) {
    _id,
    title,
    parentFolder->{ _id, title },
    documents[]->{ _id, title }
  }
`);

// ── Neurons ───────────────────────────────────────────────────────────────────

export const ALL_NEURONS_QUERY = defineQuery(`
  *[_type == "neuron"] | order(title asc) {
    _id,
    title,
    masteryLevel,
    synapses[]->{ _id, title, masteryLevel }
  }
`);

export const NEURON_STATS_QUERY = defineQuery(`
  {
    "totalNeurons": count(*[_type == "neuron"]),
    "totalSynapses": count(*[_type == "neuron" && defined(synapses)].synapses[]),
    "avgMastery": math::avg(*[_type == "neuron"].masteryLevel)
  }
`);

// ── Mastery / SRS ─────────────────────────────────────────────────────────────

export const ALL_MASTERY_QUERY = defineQuery(`
  *[_type == "mastery"] | order(srs.nextReviewDate asc) {
    _id,
    title,
    user->{ _id, username },
    srs {
      lastReviewed,
      nextReviewDate,
      confidence,
      interval,
      neurons[]->{ _id, title, masteryLevel }
    }
  }
`);

// ── Dashboard stats ───────────────────────────────────────────────────────────

export const DASHBOARD_STATS_QUERY = defineQuery(`
  {
    "neuronCount": count(*[_type == "neuron"]),
    "textbookCount": count(*[_type == "textbook"]),
    "masteryCount": count(*[_type == "mastery"])
  }
`);
