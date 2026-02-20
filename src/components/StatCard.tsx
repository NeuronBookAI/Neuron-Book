/**
 * StatCard component for displaying dashboard statistics
 * Renders individual stat cards with icon, value, label, and optional trend
 *
 * Props:
 * - label: Descriptive label for the stat
 * - value: Main value to display
 * - icon: Lucide React icon name (string)
 * - trend: Optional trend object with value and isPositive flag
 *
 * Data source: Receives data via props from parent component
 * To replace with real data: Pass real stat data from your API calls
 *
 * Usage: <StatCard label="Active Neurons" value="127" icon="Brain" trend={{value: "+12%", isPositive: true}} />
 */

import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Brain,
  Flame,
  Trophy,
  BookOpen,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { StatCard as StatCardType } from "../../src/types/dashboard";

// Icon mapping component - converts string names to Lucide React icons
const IconMap = {
  Brain,
  Flame,
  Trophy,
  BookOpen,
  Zap,
};

interface StatCardProps {
  data: StatCardType;
}

export function StatCard({ data }: StatCardProps) {
  const IconComponent = IconMap[data.icon as keyof typeof IconMap];

  return (
    <Card className="glass-panel border-0 p-6 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{data.label}</p>
          <p className="text-white text-2xl font-bold mb-3">{data.value}</p>

          {/* Trend indicator */}
          {data.trend && (
            <div className="flex items-center space-x-2">
              {data.trend.isPositive ? (
                <TrendingUp size={16} className="text-green-400" />
              ) : (
                <TrendingDown size={16} className="text-teal-400" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  data.trend.isPositive ? "text-green-400" : "text-red-400",
                )}
              >
                {data.trend.value}
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-white/10">
          {IconComponent && (
            <IconComponent size={24} className="text-teal-400" />
          )}
        </div>
      </div>
    </Card>
  );
}

// Helper function for conditional class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
