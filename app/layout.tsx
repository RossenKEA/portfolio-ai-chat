import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat App | Rasmus Rossen",
  description:
    "A full-stack AI chat application built with Next.js, TypeScript, and Google Gemini. Features include server-side API routes, local chat history, markdown rendering, and automatic demo fallback mode.",
  keywords: [
    "Next.js",
    "TypeScript",
    "Google Gemini",
    "AI Chat",
    "React",
    "Tailwind CSS",
    "Portfolio Project",
  ],
  authors: [{ name: "Rasmus Rossen" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}