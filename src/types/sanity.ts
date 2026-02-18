/**
 * TypeScript types for Sanity documents used throughout the app.
 * These mirror the Sanity schema definitions in /sanity/schemaTypes/.
 */

export interface SanityUser {
  _id: string;
  username: string;
  email?: string;
  userId?: string;
}

export interface SanityFolder {
  _id: string;
  title: string;
  parentFolder?: { _id: string; title: string } | null;
  documents?: { _id: string; title: string }[];
}

export interface SanityNeuron {
  _id: string;
  title: string;
  masteryLevel?: number;
  synapses?: { _id: string; title: string; masteryLevel?: number }[];
}

export interface SanityTextbook {
  _id: string;
  title: string;
  file?: { asset?: { url: string } };
  folder?: { _id: string; title: string }[];
  neurons?: { _id: string; title: string; masteryLevel?: number }[];
  user?: { _id: string; username: string };
}

export interface SanityMastery {
  _id: string;
  title: string;
  user?: { _id: string; username: string };
  srs?: {
    lastReviewed?: string;
    nextReviewDate?: string;
    confidence?: number;
    interval?: number;
    neurons?: { _id: string; title: string; masteryLevel?: number }[];
  };
}

export interface SanityDashboardStats {
  neuronCount: number;
  textbookCount: number;
  masteryCount: number;
}

export interface SanityNeuronStats {
  totalNeurons: number;
  totalSynapses: number;
  avgMastery: number | null;
}
