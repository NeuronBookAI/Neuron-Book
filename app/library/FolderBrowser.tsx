"use client";

/**
 * FolderBrowser — recursive folder navigation for the Library page.
 *
 * - Root view: top-level folders + textbooks not assigned to any folder.
 * - Clicking a folder drills into it, showing child folders + its textbooks.
 * - Breadcrumbs let the user navigate back up.
 * - Clicking a textbook opens it in the Reader with the real Sanity CDN URL.
 */

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import type { SanityFolder, SanityTextbook } from "@/src/types/sanity";
import { createFolder } from "../actions/folder";
import { uploadTextbook } from "../actions/upload";

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

  // New-folder inline form
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isFolderPending, startFolderTransition] = useTransition();
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop upload (empty state)
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [isUploadPending, startUploadTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewFolder) folderInputRef.current?.focus();
  }, [showNewFolder]);

  useEffect(() => {
    if (droppedFile) uploadTitleRef.current?.focus();
  }, [droppedFile]);

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
    startFolderTransition(async () => {
      const result = await createFolder(name, currentId);
      if (result.success) {
        setNewFolderName("");
        setShowNewFolder(false);
      } else {
        setFolderError(result.error ?? "Failed to create folder");
      }
    });
  }

  const handleDroppedFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      setUploadStage("error");
      return;
    }
    setDroppedFile(f);
    setUploadTitle(f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
    setUploadStage("idle");
    setUploadError("");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleDroppedFile(f);
  }, [handleDroppedFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  function handleUpload() {
    if (!droppedFile || !uploadTitle.trim()) return;
    setUploadStage("uploading");
    const formData = new FormData();
    formData.set("file", droppedFile);
    formData.set("title", uploadTitle.trim());
    if (currentId) formData.set("folderId", currentId);
    startUploadTransition(async () => {
      const result = await uploadTextbook(formData);
      if (result.success) {
        setUploadStage("done");
        setTimeout(() => { setDroppedFile(null); setUploadTitle(""); setUploadStage("idle"); }, 1800);
      } else {
        setUploadError(result.error ?? "Upload failed");
        setUploadStage("error");
      }
    });
  }

  function cancelUpload() {
    setDroppedFile(null);
    setUploadTitle("");
    setUploadStage("idle");
    setUploadError("");
  }

  const isEmpty = visibleFolders.length === 0 && visibleTextbooks.length === 0;
  const noTextbooks = visibleTextbooks.length === 0;

  /* Shared drop-zone markup, reused in both full and compact form */
  const dropZone = (compact: boolean) => (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`border-2 border-dashed rounded-2xl text-center transition-all ${
        compact ? "p-6" : "p-12"
      } ${isDragging ? "border-teal-400 bg-teal-400/10" : "border-white/20"}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleDroppedFile(e.target.files[0])}
      />

      {uploadStage === "done" ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle size={36} className="text-teal-400" />
          <p className="text-white font-medium">Uploaded successfully!</p>
        </div>
      ) : droppedFile ? (
        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
          <FileText size={32} className="text-teal-400" />
          <p className="text-white text-sm font-medium">{droppedFile.name}</p>
          <input
            ref={uploadTitleRef}
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpload()}
            placeholder="Title"
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400/60"
          />
          {uploadStage === "error" && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle size={13} /> {uploadError}
            </div>
          )}
          <div className="flex gap-2 w-full">
            <button onClick={cancelUpload} className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 text-sm transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadTitle.trim() || isUploadPending || uploadStage === "uploading"}
              className="flex-1 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {isUploadPending || uploadStage === "uploading" ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      ) : compact ? (
        /* Compact prompt (below folders) */
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Upload size={18} className="text-teal-400/60 shrink-0" />
          <span className="text-sm">Drop a PDF here or{" "}
            <button onClick={() => fileInputRef.current?.click()} className="text-teal-400 hover:text-teal-300 underline-offset-2 hover:underline">
              browse
            </button>
          </span>
        </div>
      ) : (
        /* Full empty prompt */
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Upload size={28} className="text-teal-400/70" />
          </div>
          <h3 className="text-white font-semibold mb-1">Drop a PDF here</h3>
          <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-colors border border-white/10"
          >
            Browse
          </button>
        </>
      )}
    </div>
  );

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
              ref={folderInputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
              placeholder="Folder name"
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400/60"
            />
            <button
              onClick={handleCreateFolder}
              disabled={isFolderPending}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {isFolderPending ? "Creating…" : "Create"}
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
        /* ── Fully empty: large centred drop zone ── */
        dropZone(false)
      ) : (
        /* ── Has content: folders first, then textbooks or compact drop zone ── */
        <div className="space-y-8">
          {visibleFolders.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Folders</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              </div>
            </section>
          )}

          {visibleTextbooks.length > 0 ? (
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Textbooks</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            </section>
          ) : (
            /* Has folders but no textbooks — compact drop zone */
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Textbooks</p>
              {dropZone(true)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
