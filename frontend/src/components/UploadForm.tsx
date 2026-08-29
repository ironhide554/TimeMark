"use client";

import { useState } from "react";

export default function UploadForm({ onVideoProcessed }: { onVideoProcessed: (id: string, type: string, url?: string) => void }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="bg-white shadow-md rounded-lg p-6 max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Add a Video to Summarize</h2>
      
      {/* YouTube Section */}
      <form onSubmit={handleYoutubeSubmit} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            required
          />
          <button
            type="submit"
            disabled={loading || !youtubeUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Process
          </button>
        </div>
      </form>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Upload Section */}
      <form onSubmit={handleFileUpload}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Local Video</label>
        <div className="flex gap-2">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 p-2 border border-gray-300 rounded text-black"
            required
          />
          <button
            type="submit"
            disabled={loading || !file}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </form>

      {loading && <p className="mt-4 text-blue-600 text-center">Processing video... this may take a while.</p>}
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
  );
}
