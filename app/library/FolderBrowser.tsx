"use client";

/**
 * FolderBrowser — recursive folder navigation for the Library page.
 *
 * - Root view: top-level folders + textbooks not assigned to any folder.
 * - Clicking a folder drills into it, showing child folders + its textbooks.
 * - Breadcrumbs let the user navigate back up.
 * - Clicking a textbook opens it in the Reader with the real Sanity CDN URL.
 */

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import type { SanityFolder, SanityTextbook } from "@/src/types/sanity";
import { createFolder } from "../actions/folder";

interface FolderBrowserProps {
  folders: SanityFolder[];
  rootTextbooks: SanityTextbook[]; // textbooks with no folder assignment
}

interface Breadcrumb {
  id: string | null; // null = root
  title: string;
}

export function FolderBrowser({ folders, rootTextbooks }: FolderBrowserProps) {
  const [stack, setStack] = useState<Breadcrumb[]>([{ id: null, title: "Library" }]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewFolder) inputRef.current?.focus();
  }, [showNewFolder]);

  const currentId = stack[stack.length - 1].id;

  // Folders whose parent matches the current view
  const visibleFolders = folders.filter(
    (f) => (f.parentFolder?._id ?? null) === currentId
  );

  // Textbooks for the current view
  const visibleTextbooks: { _id: string; title: string; fileUrl?: string; neuronCount: number }[] =
    currentId === null
      ? rootTextbooks.map((b) => ({
          _id: b._id,
          title: b.title,
          fileUrl: b.file?.asset?.url,
          neuronCount: b.neurons?.length ?? 0,
        }))
      : (folders
          .find((f) => f._id === currentId)
          ?.documents?.map((d) => ({
            _id: d._id,
            title: d.title,
            fileUrl: d.file?.asset?.url,
            neuronCount: d.neurons?.length ?? 0,
          })) ?? []);

  function openFolder(folder: SanityFolder) {
    setStack((prev) => [...prev, { id: folder._id, title: folder.title }]);
  }

  function goTo(index: number) {
    setStack((prev) => prev.slice(0, index + 1));
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) { setFolderError("Folder name is required"); return; }
    setFolderError(null);
    startTransition(async () => {
      const result = await createFolder(name, currentId);
      if (result.success) {
        setNewFolderName("");
        setShowNewFolder(false);
      } else {
        setFolderError(result.error ?? "Failed to create folder");
      }
    });
  }

  const isEmpty = visibleFolders.length === 0 && visibleTextbooks.length === 0;

  return (
    <div>
      {/* Breadcrumbs + New Folder button */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex items-center gap-1 text-sm flex-wrap">
          {stack.map((crumb, i) => {
            const isLast = i === stack.length - 1;
            return (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-600">/</span>}
                {isLast ? (
                  <span className="text-white font-medium">{crumb.title}</span>
                ) : (
                  <button
                    onClick={() => goTo(i)}
                    className="text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    {crumb.title}
                  </button>
                )}
              </span>
            );
          })}
        </nav>

        <button
          onClick={() => { setShowNewFolder(true); setFolderError(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 hover:border-teal-400/40"
        >
          <span>📁</span> New Folder
        </button>
      </div>

      {/* New Folder dialog */}
      {showNewFolder && (
        <div className="mb-6 p-4 glass-panel rounded-xl border border-white/10">
          <p className="text-white text-sm font-medium mb-3">New folder in <span className="text-teal-400">{stack[stack.length - 1].title}</span></p>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
              placeholder="Folder name"
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400/60"
            />
            <button
              onClick={handleCreateFolder}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {isPending ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(""); setFolderError(null); }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
          {folderError && <p className="text-red-400 text-xs mt-2">{folderError}</p>}
        </div>
      )}

      {isEmpty ? (
        <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📂</span>
          </div>
          <h3 className="text-white font-semibold mb-2">This folder is empty</h3>
          <p className="text-gray-400 text-sm">
            Create a sub-folder or upload a textbook to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Sub-folders */}
          {visibleFolders.map((folder) => {
            const childCount =
              folders.filter((f) => f.parentFolder?._id === folder._id).length +
              (folder.documents?.length ?? 0);
            return (
              <button
                key={folder._id}
                onClick={() => openFolder(folder)}
                className="glass-panel rounded-xl p-4 border border-white/10 hover:border-teal-400/40 transition-all text-left group"
              >
                <div className="w-full h-20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg mb-3 flex items-center justify-center group-hover:from-yellow-500/20 group-hover:to-orange-500/20 transition-colors">
                  <span className="text-3xl">📁</span>
                </div>
                <h4 className="text-white text-sm font-medium truncate">{folder.title}</h4>
                <p className="text-gray-500 text-xs mt-1">
                  {childCount} item{childCount !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}

          {/* Textbooks */}
          {visibleTextbooks.map((book) => {
            const href = book.fileUrl
              ? `/reader?url=${encodeURIComponent(book.fileUrl)}&title=${encodeURIComponent(book.title)}`
              : "/reader";

            return (
              <Link
                key={book._id}
                href={href}
                className="glass-panel rounded-xl p-4 border border-white/10 hover:border-teal-400/40 transition-all group block"
              >
                <div className="w-full h-20 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center group-hover:from-teal-500/30 group-hover:to-purple-500/30 transition-colors">
                  <span className="text-3xl">📖</span>
                </div>
                <h4 className="text-white text-sm font-medium truncate">{book.title}</h4>
                <p className="text-gray-500 text-xs mt-1">
                  {book.neuronCount > 0
                    ? `${book.neuronCount} neuron${book.neuronCount !== 1 ? "s" : ""} · `
                    : ""}
                  {book.fileUrl ? "Open in Reader" : "No PDF attached"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
