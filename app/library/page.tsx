import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '../../src/components/Sidebar';
import { mockSidebarItems } from '../../src/data/mock';
import { writeClient } from '@/sanity/lib/write-client';
import { ALL_TEXTBOOKS_QUERY, ALL_FOLDERS_QUERY } from '@/sanity/lib/queries';
import type { SanityTextbook, SanityFolder } from '@/src/types/sanity';
import { FolderBrowser } from './FolderBrowser';

export default async function Library() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const params = { clerkId: userId };
  const [textbooks, folders] = await Promise.all([
    writeClient.fetch(ALL_TEXTBOOKS_QUERY, params),
    writeClient.fetch(ALL_FOLDERS_QUERY, params),
  ]);

  const books = (textbooks ?? []) as SanityTextbook[];
  const allFolders = (folders ?? []) as SanityFolder[];

  // Textbooks not assigned to any folder (shown at root level)
  const rootTextbooks = books.filter(
    (b) => !b.folder || b.folder.length === 0
  );

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Content Library</h1>
              <p className="text-gray-400 mt-1 text-sm">
                {books.length} textbook{books.length !== 1 ? 's' : ''} · manage via{' '}
                <Link href="/studio" className="text-teal-400 hover:underline">Studio</Link>
              </p>
            </div>
          </div>

          <FolderBrowser folders={allFolders} rootTextbooks={rootTextbooks} />
        </div>
      </div>
    </div>
  );
}


