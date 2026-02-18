import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';
import { writeClient } from '@/sanity/lib/write-client';
import { NEURON_STATS_QUERY, NEURONS_WITH_MASTERY_QUERY } from '@/sanity/lib/queries';
import type { SanityNeuronStats } from '@/src/types/sanity';
import NeuralTrace from './NeuralTrace';

export default async function Network() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const params = { clerkId: userId };
  const [neuronStats, neurons] = await Promise.all([
    writeClient.fetch(NEURON_STATS_QUERY, params),
    writeClient.fetch(NEURONS_WITH_MASTERY_QUERY, params),
  ]);

  const stats = neuronStats as SanityNeuronStats | null;
  const totalNodes = stats?.totalNeurons ?? 0;
  const totalConnections = stats?.totalSynapses ?? 0;
  const avgMastery = stats?.avgMastery != null ? Math.round(stats.avgMastery) : null;

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Neural Network</h1>
          <p className="text-gray-400 mb-6">
            Explore your knowledge connections and learning pathways.
          </p>

          {/* Network Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-panel rounded-xl p-4 border border-white/10">
              <h4 className="text-teal-400 text-2xl font-bold mb-1">{totalNodes}</h4>
              <p className="text-gray-400 text-sm">Total Neurons</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/10">
              <h4 className="text-purple-400 text-2xl font-bold mb-1">{totalConnections}</h4>
              <p className="text-gray-400 text-sm">Synapse Connections</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/10">
              <h4 className="text-white text-2xl font-bold mb-1">
                {avgMastery != null ? `${avgMastery}%` : '—'}
              </h4>
              <p className="text-gray-400 text-sm">Avg. Mastery Strength</p>
            </div>
          </div>

          {/* Neural Trace graph */}
          {neurons && neurons.length > 0 ? (
            <NeuralTrace neurons={neurons} clerkId={userId} />
          ) : (
            <div className="h-96 bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-white font-semibold mb-2">No neurons yet</h3>
                <p className="text-gray-400 text-sm">Add textbooks and map concepts to build your neural network.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
