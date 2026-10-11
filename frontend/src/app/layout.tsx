import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-variable",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TimeMark AI — Neural Video Intelligence & Timestamped Q&A",
  description: "AI video summarization and conversational intelligence with instant sub-second timestamp seeking and chapter notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-[var(--color-mist)] bg-[var(--color-void)] selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
