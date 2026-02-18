/**
 * DecayMeter component for displaying knowledge decay items
 * Renders a section with decay meter cards showing topics that need review
 * 
 * Props:
 * - items: Array of decay items with topic, decay percent, last studied, and priority
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Pass real decay data from your spaced repetition algorithm
 * 
 * Usage: <DecayMeter items={mockDecayItems} />
 */

'use client';

import Link from 'next/link';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

import { DecayItem } from '../../src/types/dashboard';

interface DecayMeterProps {
  items: DecayItem[];
}

export function DecayMeter({ items }: DecayMeterProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProgressColor = (decayPercent: number) => {
    if (decayPercent >= 70) return 'bg-red-500';
    if (decayPercent >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
       
        <h2 className="text-xl font-bold text-white">Decay Meter</h2>
      </div>

      {/* Decay Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="glass-panel border-0 p-4 hover:scale-[1.02] transition-transform duration-200">
            <div className="space-y-3">
              {/* Topic and Priority */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{item.topic}</h4>
                <Badge 
                  variant="outline" 
                  className={getPriorityColor(item.priority)}
                >
                  {item.priority}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Knowledge Decay</span>
                  <span className="text-sm font-medium text-white">{item.decayPercent}%</span>
                </div>
                <Progress 
                  value={item.decayPercent} 
                  className="h-1.5 bg-gray-700"
                  // Custom progress bar color based on decay percentage
                  style={{
                    '--progress-background': getProgressColor(item.decayPercent)
                  } as React.CSSProperties}
                />
              </div>

              {/* Action Button */}
              <Link href={`/sessions?focus=${encodeURIComponent(item.topic)}`}>
                <Button 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white border-0 transition-all duration-200 hover:scale-[1.02] h-8 text-sm"
                >
                  Study Now
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
