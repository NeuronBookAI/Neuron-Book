"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Plus, BookOpen, BookMarked, Network } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "../../lib/utils";
import { SidebarItem } from "../../src/types/dashboard";
import UploadModal from "./UploadModal";

const IconMap = { Home, Plus, BookOpen, BookMarked, Network };

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <div
        className={cn(
          "w-20 h-full glass-panel rounded-3xl flex flex-col items-center py-8 space-y-8",
          className,
        )}
      >
        {/* Logo/Brand area */}
        <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">N</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center space-y-6">
          {items.map((item) => {
            const IconComponent = IconMap[item.icon as keyof typeof IconMap];
            const isActive = pathname === item.route;

            if (item.action === "upload") {
              return (
                <button
                  key={item.id}
                  onClick={() => setShowUpload(true)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 text-gray-400 hover:text-white hover:bg-white/10"
                  aria-label={item.label}
                >
                  {IconComponent && <IconComponent size={20} />}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.route}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105",
                  isActive
                    ? "bg-teal-500/20 text-teal-400 border border-teal-400/30 shadow-lg shadow-teal-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/10",
                )}
                aria-label={item.label}
              >
                {IconComponent && <IconComponent size={20} />}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="flex flex-col items-center gap-2">
          <UserButton
            userProfileUrl="/settings"
            userProfileMode="navigation"
            appearance={{ elements: { avatarBox: "w-10 h-10 rounded-2xl" } }}
          />
          <span className="text-gray-500 text-[10px]">Profile</span>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
