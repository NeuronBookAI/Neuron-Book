/**
 * Sessions page — shows mastery sessions with SRS (spaced repetition) data from Sanity.
 * Ordered by nextReviewDate so most urgent reviews appear first.
 */

import Link from 'next/link';
import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';
import { sanityFetch } from '@/sanity/lib/live';
import { ALL_MASTERY_QUERY } from '@/sanity/lib/queries';
import type { SanityMastery } from '@/src/types/sanity';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(iso?: string) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export default async function Sessions() {
  const { data: rawMastery } = await sanityFetch({ query: ALL_MASTERY_QUERY });
  const masteryItems = (rawMastery ?? []) as SanityMastery[];

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Learning Sessions</h1>
              <p className="text-gray-400 mt-1">
                {masteryItems.length} mastery session{masteryItems.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
            <Link
              href="/studio"
              className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              + New Session
            </Link>
          </div>

          {masteryItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masteryItems.map((item) => {
                const overdue = isOverdue(item.srs?.nextReviewDate);
                const confidence = item.srs?.confidence ?? 1;
                const interval = item.srs?.interval ?? 0;
                const neuronCount = item.srs?.neurons?.length ?? 0;

                return (
                  <div
                    key={item._id}
                    className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-teal-400/30 transition-colors flex flex-col gap-4"
                  >
                    {/* Title + overdue badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold leading-tight">{item.title}</h3>
                      {overdue && (
                        <span className="shrink-0 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                          Due
                        </span>
                      )}
                    </div>

                    {/* SRS details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last reviewed</span>
                        <span className="text-white">{formatDate(item.srs?.lastReviewed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next review</span>
                        <span className={overdue ? 'text-red-400 font-medium' : 'text-white'}>
                          {formatDate(item.srs?.nextReviewDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Interval</span>
                        <span className="text-white">{interval}d</span>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Confidence</span>
                        <span>{confidence}/5</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-purple-500"
                          style={{ width: `${(confidence / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Neuron count */}
                    {neuronCount > 0 && (
                      <p className="text-gray-500 text-xs">
                        {neuronCount} related neuron{neuronCount !== 1 ? 's' : ''}
                      </p>
                    )}

                    <button className="mt-auto w-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 rounded-xl py-2 text-sm font-medium transition-colors">
                      Review Now
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-full mb-6 flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No sessions yet</h3>
              <p className="text-gray-400 text-sm mb-6">
                Create mastery sessions in the Studio to start tracking your spaced repetition.
              </p>
              <Link
                href="/studio"
                className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors"
              >
                Open Studio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

