/**
 * Sidebar component for NeuronBook dashboard
 * Renders a vertical navigation sidebar with icon-based menu items
 * 
 * Props:
 * - items: Array of sidebar items with id, label, icon, route, and isActive status
 * - activeRoute: Current active route to highlight the corresponding item
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Update the items prop to come from your API/state management
 * 
 * Usage: <Sidebar items={mockSidebarItems} activeRoute="/dashboard" />
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  BookOpen, 
  BookMarked,
  Network, 
  Settings 
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { cn } from '../../lib/utils';
import { SidebarItem } from '../../src/types/dashboard';

// Icon mapping component - converts string names to Lucide React icons
const IconMap = {
  Home,
  Plus,
  BookOpen,
  BookMarked,
  Network,
  Settings,
};

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "w-20 h-full glass-panel rounded-3xl flex flex-col items-center py-8 space-y-8",
      className
    )}>
      {/* Logo/Brand area */}
      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl">N</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center space-y-6">
        {items.map((item) => {
          const IconComponent = IconMap[item.icon as keyof typeof IconMap];
          const isActive = pathname === item.route;
          
          return (
            <Link
              key={item.id}
              href={item.route}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105",
                isActive 
                  ? "bg-teal-500/20 text-teal-400 border border-teal-400/30 shadow-lg shadow-teal-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
              aria-label={item.label}
            >
              {IconComponent && <IconComponent size={20} />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile — Clerk UserButton */}
      <div className="flex items-center justify-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 rounded-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
