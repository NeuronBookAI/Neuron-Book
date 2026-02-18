/**
 * Library page — shows real textbooks and folders from Sanity.
 * Upload is handled via the Sanity Studio at /studio.
 */

import Link from 'next/link';
import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';
import { sanityFetch } from '@/sanity/lib/live';
import { ALL_TEXTBOOKS_QUERY, ALL_FOLDERS_QUERY } from '@/sanity/lib/queries';
import type { SanityTextbook, SanityFolder } from '@/src/types/sanity';

export default async function Library() {
  const [{ data: textbooks }, { data: folders }] = await Promise.all([
    sanityFetch({ query: ALL_TEXTBOOKS_QUERY }),
    sanityFetch({ query: ALL_FOLDERS_QUERY }),
  ]);

  const books = (textbooks ?? []) as SanityTextbook[];
  const allFolders = (folders ?? []) as SanityFolder[];

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Content Library</h1>
          <p className="text-gray-400 mb-8">
            Upload and manage your learning materials via the{' '}
            <Link href="/studio" className="text-teal-400 hover:underline">
              Studio
            </Link>
            .
          </p>

          {/* Folders */}
          {allFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Folders</h2>
              <div className="flex flex-wrap gap-3">
                {allFolders.map((folder) => (
                  <div
                    key={folder._id}
                    className="glass-panel rounded-xl px-4 py-2 border border-white/10 flex items-center gap-2"
                  >
                    <span className="text-teal-400">📁</span>
                    <span className="text-white text-sm font-medium">{folder.title}</span>
                    {folder.documents && folder.documents.length > 0 && (
                      <span className="text-gray-500 text-xs">({folder.documents.length})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Textbooks */}
          {books.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold text-white mb-4">All Textbooks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Link
                    key={book._id}
                    href="/reader"
                    className="glass-panel rounded-xl p-4 border border-white/10 block hover:border-teal-400/30 transition-colors"
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-3xl">📖</span>
                    </div>
                    <h4 className="text-white text-sm font-medium truncate">{book.title}</h4>
                    <p className="text-gray-500 text-xs mt-1">
                      {book.neurons?.length ?? 0} neurons · Open in Reader
                    </p>
                    {book.folder && book.folder.length > 0 && (
                      <p className="text-teal-400/70 text-xs mt-1 truncate">
                        {book.folder.map((f) => f.title).join(', ')}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            /* Empty state — prompt user to add content via Studio */
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">+</span>
              </div>
              <h3 className="text-white font-semibold mb-2">No textbooks yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Add your first textbook through the Sanity Studio.
              </p>
              <Link
                href="/studio"
                className="inline-block bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors"
              >
                Open Studio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

