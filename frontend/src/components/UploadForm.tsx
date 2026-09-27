"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function UploadForm({ onVideoProcessed }: { onVideoProcessed: (id: string, type: string, url?: string) => void }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:8000/api/process/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to process YouTube URL");
      
      onVideoProcessed(data.video_id, "youtube", youtubeUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("http://localhost:8000/api/process/upload", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to upload video");
      
      const fileUrl = URL.createObjectURL(file);
      onVideoProcessed(data.video_id, "upload", fileUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-carbon)] rounded-[12px] p-[24px] max-w-xl mx-auto mt-10 shadow-[rgb(35,37,42)_0_0_0_1px_inset]">
      <h2 className="text-[24px] leading-[1.33] tracking-[-0.012em] text-[var(--color-paper)] font-normal mb-8 text-center">Add a Video to Summarize</h2>
      
      {/* YouTube Section */}
      <form onSubmit={handleYoutubeSubmit} className="mb-8">
        <label className="block text-[13px] text-[var(--color-mist)] mb-2">YouTube URL</label>
        <div className="flex gap-3">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-[14px] py-[10px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-[6px] text-[var(--color-mist)] text-[14px] placeholder-[var(--color-fog)] focus:outline-none focus:border-[var(--color-mist)] transition-colors shadow-[rgba(0,0,0,0.2)_0px_0px_12px_0px_inset]"
            required
          />
          <button
            type="submit"
            disabled={loading || !youtubeUrl}
            className="whitespace-nowrap px-[16px] py-[10px] rounded-[6px] text-[14px] font-[510] tracking-[-0.011em] transition-colors bg-[var(--color-acid-lime)] text-[var(--color-void)] hover:opacity-90 disabled:bg-[rgba(255,255,255,0.05)] disabled:text-[var(--color-ash)] disabled:hover:opacity-100 disabled:cursor-not-allowed shadow-[rgba(0,0,0,0.01)_0px_5px_2px_0px,rgba(0,0,0,0.04)_0px_3px_2px_0px,rgba(0,0,0,0.07)_0px_1px_1px_0px]"
          >
            Process
          </button>
        </div>
      </form>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-[var(--color-graphite)]"></div>
        <span className="flex-shrink-0 mx-4 text-[13px] text-[var(--color-ash)]">OR</span>
        <div className="flex-grow border-t border-[var(--color-graphite)]"></div>
      </div>

      {/* Upload Section */}
      <form onSubmit={handleFileUpload}>
        <label className="block text-[13px] text-[var(--color-mist)] mb-2">Upload Local Video</label>
        <div className="flex gap-3">
          {/* Hidden File Input */}
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            required
          />
          
          {/* Custom File Input Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-between px-[14px] py-[10px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-[6px] text-[14px] text-left hover:border-[var(--color-mist)] transition-colors shadow-[rgba(0,0,0,0.2)_0px_0px_12px_0px_inset] group"
          >
            <span className={`truncate mr-3 ${file ? 'text-[var(--color-paper)]' : 'text-[var(--color-fog)]'}`}>
              {file ? file.name : "Choose file..."}
            </span>
            <Upload className="w-[16px] h-[16px] text-[var(--color-ash)] group-hover:text-[var(--color-mist)] shrink-0" />
          </button>

          <button
            type="submit"
            disabled={loading || !file}
            className="whitespace-nowrap px-[16px] py-[10px] rounded-[6px] text-[14px] font-[510] tracking-[-0.011em] transition-colors bg-[var(--color-acid-lime)] text-[var(--color-void)] hover:opacity-90 disabled:bg-[rgba(255,255,255,0.05)] disabled:text-[var(--color-ash)] disabled:hover:opacity-100 disabled:cursor-not-allowed shadow-[rgba(0,0,0,0.01)_0px_5px_2px_0px,rgba(0,0,0,0.04)_0px_3px_2px_0px,rgba(0,0,0,0.07)_0px_1px_1px_0px]"
          >
            Upload
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <div className="animate-spin rounded-full h-[16px] w-[16px] border-b-[2px] border-[var(--color-acid-lime)]"></div>
          <p className="text-[var(--color-mist)] text-[14px]">Processing video... this may take a while.</p>
        </div>
      )}
      {error && <p className="mt-8 text-[var(--color-coral-red)] text-[14px] text-center bg-[rgba(235,87,87,0.1)] py-2 px-3 rounded-[6px] border border-[rgba(235,87,87,0.2)]">{error}</p>}
    </div>
  );
}
