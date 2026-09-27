"use client";

import ReactMarkdown from "react-markdown";

interface NotesPanelProps {
  summary: string;
}

export default function NotesPanel({ summary }: NotesPanelProps) {
  if (!summary) return null;

  return (
    <div className="bg-[var(--color-carbon)] shadow-[var(--shadow-md)] rounded-[12px] p-[24px] h-full overflow-y-auto" style={{ boxShadow: 'rgb(35, 37, 42) 0px 0px 0px 1px inset' }}>
      <h2 className="text-[20px] leading-[1.33] tracking-[-0.012em] font-[590] mb-[24px] text-[var(--color-paper)]">Video Summary & Notes</h2>
      <div className="text-[var(--color-mist)] text-[15px] leading-[1.6] tracking-[-0.011em] [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>h3]:text-[var(--color-paper)] [&>h3]:text-[17px] [&>h3]:font-[590] [&>h3]:mt-6 [&>h3]:mb-3 [&>strong]:text-[var(--color-paper)] [&>strong]:font-[510]">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
