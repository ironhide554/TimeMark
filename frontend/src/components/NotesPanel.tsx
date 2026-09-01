"use client";

import ReactMarkdown from "react-markdown";

interface NotesPanelProps {
  summary: string;
}

export default function NotesPanel({ summary }: NotesPanelProps) {
  if (!summary) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Video Summary & Notes</h2>
      <div className="prose prose-blue max-w-none text-gray-700">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
