/**
 * Network page — shows real neuron/synapse counts and avg mastery from Sanity.
 * The interactive graph visualization is implemented separately with Neural Trace.
 */

import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';
import { sanityFetch } from '@/sanity/lib/live';
import { NEURON_STATS_QUERY, ALL_NEURONS_QUERY } from '@/sanity/lib/queries';
import type { SanityNeuron, SanityNeuronStats } from '@/src/types/sanity';

export default async function Network() {
  const [{ data: rawStats }, { data: rawNeurons }] = await Promise.all([
    sanityFetch({ query: NEURON_STATS_QUERY }),
    sanityFetch({ query: ALL_NEURONS_QUERY }),
  ]);

  const neuronStats = rawStats as SanityNeuronStats | null;
  const neurons = (rawNeurons ?? []) as SanityNeuron[];

  const totalNodes = neuronStats?.totalNeurons ?? 0;
  const totalConnections = neuronStats?.totalSynapses ?? 0;
  const avgMastery = neuronStats?.avgMastery != null
    ? Math.round(neuronStats.avgMastery)
    : null;

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Neural Network</h1>
          <p className="text-gray-400 mb-8">
            Explore your knowledge connections and learning pathways.
          </p>

          {/* Network Visualization Placeholder */}
          <div className="h-96 bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Network Visualization</h3>
              <p className="text-gray-400 text-sm">Interactive knowledge graph — implemented with Neural Trace.</p>
            </div>
          </div>

          {/* Network Stats — real data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h4 className="text-teal-400 text-2xl font-bold mb-2">{totalNodes}</h4>
              <p className="text-gray-400 text-sm">Total Neurons</p>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h4 className="text-purple-400 text-2xl font-bold mb-2">{totalConnections}</h4>
              <p className="text-gray-400 text-sm">Synapse Connections</p>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h4 className="text-white text-2xl font-bold mb-2">
                {avgMastery != null ? `${avgMastery}%` : '—'}
              </h4>
              <p className="text-gray-400 text-sm">Avg. Mastery Strength</p>
            </div>
          </div>

          {/* Neuron list */}
          {neurons.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-white mb-4">All Neurons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {neurons.map((neuron) => (
                  <div
                    key={neuron._id}
                    className="glass-panel rounded-xl p-4 border border-white/10 hover:border-teal-400/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white text-sm font-medium">{neuron.title}</h4>
                      <span className="text-teal-400 text-xs font-semibold shrink-0 ml-2">
                        {neuron.masteryLevel ?? 0}%
                      </span>
                    </div>
                    {/* Mastery bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-purple-500"
                        style={{ width: `${neuron.masteryLevel ?? 0}%` }}
                      />
                    </div>
                    {neuron.synapses && neuron.synapses.length > 0 && (
                      <p className="text-gray-500 text-xs mt-2">
                        {neuron.synapses.length} synapse{neuron.synapses.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {neurons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No neurons yet. Add textbooks and map concepts to build your network.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

