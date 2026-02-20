import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "../../src/components/Sidebar";
import { StatRow } from "../../src/components/StatRow";
import { NeuralTracePanel } from "../../src/components/NeuralTracePanel";
import { RecentSessions } from "../../src/components/RecentSessions";
import { mockSidebarItems } from "../../src/data/mock";
import { writeClient } from "@/sanity/lib/write-client";
import {
  DASHBOARD_STATS_QUERY,
  RECENT_TEXTBOOKS_QUERY,
  NEURONS_WITH_MASTERY_QUERY,
} from "@/sanity/lib/queries";
import type { SanityTextbook, SanityDashboardStats } from "@/src/types/sanity";
import type { StatCard, Session } from "../../src/types/dashboard";
import { getOrCreateSanityUser } from "../../lib/sanity-user";
import NeuralTraceReadOnly from "./NeuralTraceReadOnly";
import type { NeuronNode } from "../network/NeuralTrace";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Ensure Sanity user doc exists on first login
  await getOrCreateSanityUser({ clerkId: userId, name: "User", email: "" });

  const params = { clerkId: userId };
  const [stats, recentBooks, neurons] = (await Promise.all([
    writeClient.fetch(DASHBOARD_STATS_QUERY, params),
    writeClient.fetch(RECENT_TEXTBOOKS_QUERY, params),
    writeClient.fetch(NEURONS_WITH_MASTERY_QUERY, params),
  ])) as [SanityDashboardStats | null, SanityTextbook[], NeuronNode[]];

  // Build stat cards from real data
  const statCards: StatCard[] = [
    {
      label: "Active Neurons",
      value: String(stats?.neuronCount ?? 0),
      icon: "Brain",
    },
    {
      label: "Textbooks",
      value: String(stats?.textbookCount ?? 0),
      icon: "BookOpen",
    },
    {
      label: "Avg. Mastery",
      value: stats?.avgMastery != null ? `${Math.round(stats.avgMastery)}%` : "—",
      icon: "Zap",
    },
  ];

  // Build recent sessions from textbooks
  const sessions: Session[] = recentBooks.map((book) => ({
    id: book._id,
    title: book.title,
    thumbnail: "/api/placeholder/300/400",
    progress: book.neurons?.length
      ? Math.min(100, book.neurons.length * 10)
      : 0,
    pdfUrl: book.file?.asset?.url,
  }));

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 space-y-6 overflow-y-auto">
          <StatRow stats={statCards} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Recent Sessions */}
            <div className="lg:col-span-1 h-fit">
              {sessions.length > 0 ? (
                <RecentSessions sessions={sessions} />
              ) : (
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-3">
                    Recent Sessions
                  </h2>
                  <p className="text-gray-400 text-sm">
                    No textbooks yet. Add some in the Library.
                  </p>
                </div>
              )}
            </div>

            {/* Right column: Read-only Neural Trace */}
            <div className="lg:col-span-2 h-[560px]">
              {neurons && neurons.length > 0 ? (
                <NeuralTraceReadOnly neurons={neurons} />
              ) : (
                <NeuralTracePanel nodes={[]} edges={[]} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
