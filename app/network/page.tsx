/**
 * Network page component for NeuronBook
 * Placeholder page for neural network visualization
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Replace mock imports with real API calls
 */

import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';

export default function Network() {
  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />
        
        <div className="flex-1 glass-panel rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Neural Network</h1>
          <p className="text-gray-400 mb-8">
            Explore your knowledge connections and learning pathways.
          </p>
          
          {/* Network Visualization Placeholder */}
          <div className="h-96 bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl text-white">🧠</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Network Visualization</h3>
              <p className="text-gray-400 text-sm">Interactive knowledge graph coming soon...</p>
            </div>
          </div>
          
          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h4 className="text-teal-400 text-2xl font-bold mb-2">127</h4>
              <p className="text-gray-400 text-sm">Total Nodes</p>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h4 className="text-purple-400 text-2xl font-bold mb-2">89</h4>
              <p className="text-gray-400 text-sm">Connections</p>
            </div>
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h4 className="text-white text-2xl font-bold mb-2">87%</h4>
              <p className="text-gray-400 text-sm">Network Strength</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
