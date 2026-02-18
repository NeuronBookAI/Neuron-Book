/**
 * Sessions page component for NeuronBook
 * Placeholder page for displaying all learning sessions
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Replace mock imports with real API calls
 */

import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';

export default function Sessions() {
  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />
        
        <div className="flex-1 glass-panel rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Learning Sessions</h1>
          <p className="text-gray-400 mb-8">
            View and manage all your learning sessions and progress.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder session cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="w-full h-32 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-xl mb-4"></div>
                <h3 className="text-white font-semibold mb-2">Session {i}</h3>
                <p className="text-gray-400 text-sm">Coming soon...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
