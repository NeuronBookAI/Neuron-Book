/**
 * Library page component for NeuronBook
 * Placeholder page for content library and PDF uploads
 * 
 * Data source: Currently uses mock data from src/data/mock.ts
 * To replace with real data: Replace mock imports with real API calls
 */

import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';

export default function Library() {
  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />
        
        <div className="flex-1 glass-panel rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Content Library</h1>
          <p className="text-gray-400 mb-8">
            Upload and manage your learning materials.
          </p>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-white">+</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Upload PDF</h3>
            <p className="text-gray-400 text-sm">Drag and drop or click to browse</p>
          </div>
          
          {/* Library Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel rounded-xl p-4 border border-white/10">
                <div className="w-full h-24 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-lg mb-3"></div>
                <h4 className="text-white text-sm font-medium truncate">Document {i}.pdf</h4>
                <p className="text-gray-500 text-xs">2.3 MB</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
