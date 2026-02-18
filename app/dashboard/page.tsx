import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../src/components/Sidebar';
import { StatRow } from '../../src/components/StatRow';
import { DecayMeter } from '../../src/components/DecayMeter';
import { NeuralTracePanel } from '../../src/components/NeuralTracePanel';
import { RecentSessions } from '../../src/components/RecentSessions';
import { mockNeuralNodes, mockNeuralEdges, mockSidebarItems } from '../../src/data/mock';
import { writeClient } from '@/sanity/lib/write-client';
import { DASHBOARD_STATS_QUERY, ALL_MASTERY_QUERY, RECENT_TEXTBOOKS_QUERY } from '@/sanity/lib/queries';
import type { SanityMastery, SanityTextbook, SanityDashboardStats } from '@/src/types/sanity';
import type { StatCard, DecayItem, Session } from '../../src/types/dashboard';
import { getOrCreateSanityUser } from '../../lib/sanity-user';

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  // Ensure Sanity user doc exists on first login
  await getOrCreateSanityUser({ clerkId: userId, name: 'User', email: '' });

  const params = { clerkId: userId };
  const [stats, masteryItems, recentBooks] = await Promise.all([
    writeClient.fetch(DASHBOARD_STATS_QUERY, params),
    writeClient.fetch(ALL_MASTERY_QUERY, params),
    writeClient.fetch(RECENT_TEXTBOOKS_QUERY, params),
  ]) as [SanityDashboardStats | null, SanityMastery[], SanityTextbook[]];

  // Build stat cards from real data
  const statCards: StatCard[] = [
    {
      label: 'Active Neurons',
      value: String(stats?.neuronCount ?? 0),
      icon: 'Brain',
    },
    {
      label: 'Textbooks',
      value: String(stats?.textbookCount ?? 0),
      icon: 'BookOpen',
    },
    {
      label: 'Mastery Sessions',
      value: String(stats?.masteryCount ?? 0),
      icon: 'Trophy',
    },
  ];

  // Build decay items from mastery SRS data
  const decayItems: DecayItem[] = masteryItems.slice(0, 5).map((m) => {
    const nextReview = m.srs?.nextReviewDate ? new Date(m.srs.nextReviewDate) : null;
    const now = new Date();
    const daysOverdue = nextReview ? Math.max(0, Math.floor((now.getTime() - nextReview.getTime()) / 86400000)) : 0;
    const decayPercent = Math.min(100, daysOverdue * 10 + (100 - (m.srs?.confidence ?? 1) * 20));
    const priority: DecayItem['priority'] = decayPercent >= 70 ? 'high' : decayPercent >= 40 ? 'medium' : 'low';
    const lastReviewed = m.srs?.lastReviewed
      ? new Date(m.srs.lastReviewed).toLocaleDateString()
      : 'Never';

    return {
      id: m._id,
      topic: m.title,
      decayPercent: Math.round(Math.min(100, Math.max(0, decayPercent))),
      lastStudied: lastReviewed,
      priority,
    };
  });

  // Build recent sessions from textbooks
  const sessions: Session[] = recentBooks.map((book) => ({
    id: book._id,
    title: book.title,
    thumbnail: '/api/placeholder/300/400',
    progress: book.neurons?.length ? Math.min(100, book.neurons.length * 10) : 0,
  }));

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 space-y-6 overflow-y-auto">
          <StatRow stats={statCards} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-fit">
              {decayItems.length > 0 ? (
                <DecayMeter items={decayItems} />
              ) : (
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-3">Decay Meter</h2>
                  <p className="text-gray-400 text-sm">No mastery sessions yet. Start reviewing to track decay.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {/* Neural Trace — implemented separately */}
              <NeuralTracePanel nodes={mockNeuralNodes} edges={mockNeuralEdges} />
            </div>
          </div>

          {sessions.length > 0 ? (
            <RecentSessions sessions={sessions} />
          ) : (
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-3">Recent Sessions</h2>
              <p className="text-gray-400 text-sm">No textbooks yet. Add some in the Library.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

