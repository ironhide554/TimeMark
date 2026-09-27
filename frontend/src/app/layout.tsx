import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-variable",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TimeMark",
  description: "Free & Local AI Video Summarizer",
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
      <body className="min-h-full flex flex-col font-sans text-[var(--color-mist)] bg-[var(--color-void)]">
        {children}
      </body>
    </html>
  );
}
