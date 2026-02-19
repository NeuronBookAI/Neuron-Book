/**
 * RecentSessions component for displaying a row of recent learning sessions
 * Renders a horizontal scrollable row of SessionCard components
 * 
 * Props:
 * - sessions: Array of session objects to display
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Pass real session data from your learning API
 * 
 * Usage: <RecentSessions sessions={mockSessions} />
 */

import { SessionCard } from './SessionCard';
import { Session } from '../../src/types/dashboard';

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
        <button className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
          View All
        </button>
      </div>

      {/* Sessions Grid — single column to fit the sidebar slot */}
      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
