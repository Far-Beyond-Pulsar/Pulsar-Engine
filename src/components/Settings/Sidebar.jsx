"use client";

import React from 'react';
import { 
  Settings, Monitor, Palette, Keyboard, Volume2, 
  Cpu, Network, Globe, Database, Shield,
  Gamepad, MessageSquare, Cloud, Terminal,
  Accessibility, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping
const iconMap = {
  Monitor,
  Palette,
  Cpu,
  Volume2,
  Keyboard,
  Gamepad,
  Settings,
  Network,
  Globe,
  Database,
  Shield,
  MessageSquare,
  Cloud,
  Terminal,
  Accessibility
};

export const Sidebar = ({ 
  categories, 
  activeCategory, 
  setActiveCategory, 
  isSidebarOpen, 
  setIsSidebarOpen,
  className 
}) => {
  // Backdrop for mobile view
  const Backdrop = () => (
    <div 
      className={cn(
        "fixed inset-0 bg-black/80 z-10 lg:hidden transition-opacity",
        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setIsSidebarOpen(false)}
    />
  );

  return (
    <>
      <Backdrop />
      <aside
        className={cn(
          // Base styles
          "bg-black border-r border-gray-800",
          "fixed lg:relative",
          "w-64 h-full",
          "z-20 lg:z-0",
          // Animation
          "transition-transform duration-300 ease-in-out",
          // Mobile behavior
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Custom classes
          className
        )}
      >
        <nav className="p-2 space-y-1 overflow-y-auto h-full">
          {categories.map(({ id, icon, label }) => {
            // Get icon component from our mapping
            const Icon = iconMap[icon];
            if (!Icon) {
              console.warn(`Icon ${icon} not found in iconMap`);
              return null;
            }

            return (
              <button
                key={id}
                onClick={() => {
                  setActiveCategory(id);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={cn(
                  // Base styles
                  "w-full flex items-center gap-3 px-3 py-2.5",
                  "text-sm font-medium rounded-lg",
                  "transition-colors duration-150",
                  "hover:bg-gray-900",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  // Active state
                  activeCategory === id 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-300"
                )}
              >
                <Icon 
                  size={18} 
                  className={cn(
                    "shrink-0",
                    activeCategory === id 
                      ? "text-white" 
                      : "text-gray-400"
                  )}
                />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-4 -right-12 p-2 text-gray-400 hover:text-white"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </aside>
    </>
  );
};