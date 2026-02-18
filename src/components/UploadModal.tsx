"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { uploadTextbook } from "../../app/actions/upload";

interface Props {
  onClose: () => void;
}

type Stage = "idle" | "uploading" | "done" | "error";

export default function UploadModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported.");
      setStage("error");
      return;
    }
    setFile(f);
    // Auto-fill title from filename (strip extension)
    if (!title) setTitle(f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
    setStage("idle");
    setErrorMsg("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  function handleSubmit() {
    if (!file || !title.trim()) return;
    setStage("uploading");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", title.trim());
    startTransition(async () => {
      const result = await uploadTextbook(formData);
      if (result.success) {
        setStage("done");
        setTimeout(onClose, 1500);
      } else {
        setErrorMsg(result.error ?? "Upload failed");
        setStage("error");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl border border-white/10 p-6 w-full max-w-md mx-4 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Add Textbook</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {stage === "done" ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle size={40} className="text-teal-400" />
            <p className="text-white font-medium">Uploaded successfully!</p>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragging
                  ? "border-teal-400 bg-teal-400/10"
                  : file
                  ? "border-teal-400/50 bg-teal-400/5"
                  : "border-white/20 hover:border-white/40 bg-black/20"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <FileText size={32} className="text-teal-400" />
                  <p className="text-white text-sm font-medium text-center">{file.name}</p>
                  <p className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-gray-500" />
                  <p className="text-gray-300 text-sm font-medium">Drop a PDF here</p>
                  <p className="text-gray-500 text-xs">or click to browse</p>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Neuroscience: Chapter 4"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal-400/50 transition-colors"
              />
            </div>

            {/* Error */}
            {stage === "error" && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file || !title.trim() || isPending || stage === "uploading"}
                className="flex-1 bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-[#0a0f12] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                {stage === "uploading" || isPending ? "Uploading…" : "Upload"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
