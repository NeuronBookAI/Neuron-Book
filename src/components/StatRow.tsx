/**
 * StatRow component for displaying a row of statistics cards
 * Renders a horizontal row of StatCard components
 * 
 * Props:
 * - stats: Array of stat data objects to display
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Pass real stats array from your API calls
 * 
 * Usage: <StatRow stats={mockStats} />
 */

import { StatCard } from './StatCard';
import { StatCard as StatCardType } from '../../src/types/dashboard';

interface StatRowProps {
  stats: StatCardType[];
}

export function StatRow({ stats }: StatRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} data={stat} />
      ))}
    </div>
  );
}
