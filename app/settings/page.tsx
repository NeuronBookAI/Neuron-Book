/**
 * Settings page component for NeuronBook
 * Placeholder page for user settings and preferences
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Replace mock imports with real API calls
 */

import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';

export default function Settings() {
  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />
        
        <div className="flex-1 glass-panel rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
          <p className="text-gray-400 mb-8">
            Manage your account and learning preferences.
          </p>
          
          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Name</label>
                  <div className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                    Khas Erdene
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Email</label>
                  <div className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                    khaserdene_ts@berkeley.edu
                  </div>
                </div>
              </div>
            </div>
            
            {/* Learning Preferences */}
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Learning Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Daily Goal</span>
                  <span className="text-white">30 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Reminder Frequency</span>
                  <span className="text-white">Daily</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Difficulty Level</span>
                  <span className="text-white">Medium</span>
                </div>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Study Reminders</span>
                  <div className="w-12 h-6 bg-teal-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Achievement Alerts</span>
                  <div className="w-12 h-6 bg-teal-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Weekly Reports</span>
                  <div className="w-12 h-6 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
