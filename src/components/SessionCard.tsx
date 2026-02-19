/**
 * SessionCard component for displaying individual learning sessions
 * Renders a card with session thumbnail, title, progress, and metadata
 * 
 * Props:
 * - session: Session object with title, thumbnail, progress, lastAccessed, etc.
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Pass real session data from your learning API
 * 
 * Usage: <SessionCard session={mockSession} />
 */

'use client';

import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Session } from '../../src/types/dashboard';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const href = `/reader?title=${encodeURIComponent(session.title)}${session.pdfUrl ? `&url=${encodeURIComponent(session.pdfUrl)}` : ""}`;

  return (
    <Link href={href}>
      <Card className="glass-panel border-0 px-4 py-3 hover:scale-[1.01] transition-transform duration-200 cursor-pointer">
      <div className="flex items-center gap-3">
        {/* Book icon placeholder */}
        <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-lg">
          📖
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-semibold text-white truncate">{session.title}</h3>

          {/* Progress Bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <Progress
              value={session.progress}
              className="h-1 flex-1 bg-gray-700"
            />
            <span className="text-[10px] text-gray-500 shrink-0">{session.progress}%</span>
          </div>
        </div>
      </div>
    </Card>
    </Link>
  );
}

// Helper function for conditional class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
