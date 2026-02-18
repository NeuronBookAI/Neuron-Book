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
import Image from 'next/image';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Session } from '../../src/types/dashboard';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Card className="glass-panel border-0 p-6 hover:scale-[1.02] transition-transform duration-200">
      {/* Thumbnail */}
      <div className="relative h-32 bg-black/20 rounded-xl mb-4 flex items-center justify-center">
        <Image
          src={session.thumbnail}
          alt={session.title}
          fill
          className="rounded-xl object-cover"
        />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <Progress 
          value={session.progress} 
          className="h-1.5 bg-gray-700"
          style={{
            '--progress-background': 'bg-teal-500'
          } as React.CSSProperties}
        />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white">{session.title}</h3>
    </Card>
  );
}

// Helper function for conditional class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
