"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Home() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-zinc-800 rounded-2xl bg-zinc-900 shadow-xl overflow-hidden">
        <header className="p-5 border-b border-zinc-800">
          <h1 className="text-xl font-semibold">Portfolio AI Chat</h1>
          <p className="text-sm text-zinc-400">
            Real Gemini API when available. Transparent mock fallback for demo reliability.
          </p>
        </header>

        <section className="h-[500px] overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`w-2 h-2 rounded-full ${
                process.env.NEXT_PUBLIC_USE_MOCK_AI === "true"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
            <span className="text-xs text-zinc-400">
              {process.env.NEXT_PUBLIC_USE_MOCK_AI === "true"
                ? "Demo Mode"
                : "Gemini AI"}
            </span>
          </div>
          {messages.length === 0 && (
            <p className="text-zinc-500">
              Ask something to test the chat interface.
            </p>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[80%] bg-blue-600 rounded-xl p-3"
                  : "mr-auto max-w-[80%] bg-zinc-800 rounded-xl p-3"
              }
            >
              <p className="text-xs mb-1 text-zinc-300">
                {message.role === "user" ? "You" : "AI"}
              </p>

              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return <p key={i}>{part.text}</p>;
                }

                return null;
              })}
            </div>
          ))}

          {status === "streaming" && (
            <p className="text-zinc-500">AI is typing...</p>
          )}
        </section>

        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 flex gap-2">
          <input
            className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 outline-none focus:border-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium disabled:opacity-50"
            disabled={status === "streaming"}
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}