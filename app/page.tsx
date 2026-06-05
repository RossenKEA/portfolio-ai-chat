"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const { messages, sendMessage, status, setMessages } = useChat({
    messages:
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("chat-history") || "[]")
        : [],
  });
  const [input, setInput] = useState("");

  const chatContainerRef = useRef<HTMLElement>(null);

  const isMockMode =
    process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" ||
    messages.filter((m) => m.role === "user").length > 3;

  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    if (!chatContainer) return;

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-zinc-800 rounded-2xl bg-zinc-900 shadow-xl overflow-hidden">
        <header className="p-5 border-b border-zinc-800">
          <h1 className="text-xl font-semibold">Portfolio AI Chat</h1>

          <p className="text-sm text-zinc-400 mt-1">
            Real Gemini API when available. Transparent mock fallback for demo
            reliability.
          </p>
          <p className="text-xs text-yellow-400 mt-2">
            Demo mode activates after 3 messages to preserve API quota.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <div
              className={`w-2 h-2 rounded-full ${
                isMockMode ? "bg-yellow-500" : "bg-green-500"
              }`}
            />

            <span className="text-xs text-zinc-400">
              {isMockMode ? "Demo Mode" : "Gemini AI"}
            </span>
          </div>
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem("chat-history");
              }}
              className="mt-3 text-xs text-zinc-400 hover:text-white underline"
            >
              Clear chat
            </button>
        </header>

        <section
          ref={chatContainerRef}
          className="h-[500px] overflow-y-auto p-5 space-y-4"
        >
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
                  return (
                    <div key={i} className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  );
                }

                return null;
              })}

              <p
                className={`text-[10px] mt-2 ${
                  message.role === "user" ? "text-blue-100" : "text-zinc-400"
                }`}
              >
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          ))}

          {status === "streaming" && (
            <p className="text-zinc-500">AI is typing...</p>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-zinc-800 flex gap-2"
        >
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

      <section className="w-full max-w-2xl mt-6 border border-zinc-800 rounded-2xl bg-zinc-900 p-5 text-sm text-zinc-400">
        <h2 className="font-semibold text-white mb-2">Technical Overview</h2>

        <ul className="list-disc ml-6 space-y-1">
          <li>Built with Next.js App Router</li>
          <li>Written in TypeScript</li>
          <li>Uses a server-side API route to protect the API key</li>
          <li>Integrates with Google Gemini</li>
          <li>Supports streaming AI responses</li>
          <li>Includes transparent demo/mock mode</li>
          <li>Uses environment variables for configuration</li>
        </ul>
      </section>
    </main>
  );
}