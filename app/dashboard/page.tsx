/**
 * Dashboard page component for NeuronBook
 * Main dashboard page displaying statistics, decay meter, neural trace, and recent sessions
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Replace mock imports with real API calls
 * 
 * This is the main dashboard route at /dashboard
 */

import { Sidebar } from '../../src/components/Sidebar';
import { StatRow } from '../../src/components/StatRow';
import { DecayMeter } from '../../src/components/DecayMeter';
import { NeuralTracePanel } from '../../src/components/NeuralTracePanel';
import { RecentSessions } from '../../src/components/RecentSessions';
import { 
  mockStats, 
  mockDecayItems, 
  mockNeuralNodes, 
  mockNeuralEdges, 
  mockSessions, 
  mockSidebarItems 
} from '../../src/data/mock';

export default function Dashboard() {
  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        {/* Sidebar */}
        <Sidebar items={mockSidebarItems} />
        
        {/* Main Content */}
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Stats Row */}
          <StatRow stats={mockStats} />
          
          {/* Middle Row: Neural Trace and decay meter fake mock implementation for now*/}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Decay Meter - Smaller */}
            <div className="lg:col-span-1 h-fit">
              <DecayMeter items={mockDecayItems} />
            </div>
            
            {/* Neural Trace Panel - Bigger */}
            <div className="lg:col-span-2">
              <NeuralTracePanel nodes={mockNeuralNodes} edges={mockNeuralEdges} />
            </div>
          </div>
          
          {/* Recent Sessions */}
          <RecentSessions sessions={mockSessions} />
        </div>
      </div>
    </div>
  );
}
