"use client";

import { useEffect, useRef, useState, SubmitEvent } from "react";

interface ChatSession {
  id: number;
  cwd: string;
  createdAt: string;
}

interface ChatMessage {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  stopReason: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export default function ChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const sessionsRes = await fetch(`${API_URL}/api/agent/sessions`);
        if (!sessionsRes.ok) throw new Error("Failed to load sessions");
        const sessions: ChatSession[] = await sessionsRes.json();

        const active = sessions.length > 0 ? sessions[0] : await createSession();
        setSession(active);

        const messagesRes = await fetch(`${API_URL}/api/agent/sessions/${active.id}/messages`);
        if (!messagesRes.ok) throw new Error("Failed to load messages");
        setMessages(await messagesRes.json());
      } catch {
        setError("Could not reach the agent backend. Is it running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const createSession = async (): Promise<ChatSession> => {
    const res = await fetch(`${API_URL}/api/agent/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error("Failed to create session");
    return res.json();
  };

  const startNewSession = async () => {
    setError(null);
    setLoading(true);
    try {
      const created = await createSession();
      setSession(created);
      setMessages([]);
    } catch {
      setError("Could not start a new session. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: SubmitEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !session || sending) return;

    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/agent/sessions/${session.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const result: SendMessageResult = await res.json();
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
    } catch {
      setInput(text);
      setError("The agent did not respond. Is the backend (and qwen) running?");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-49px)] flex-col items-center bg-zinc-50 px-4 py-8 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Agent Chat
          </h1>
          <button
            onClick={startNewSession}
            disabled={loading}
            className="rounded-full border border-black/8 px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/10"
          >
            New session
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mb-4 flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-black/8 bg-white p-4 dark:border-white/[.145] dark:bg-zinc-900">
          {loading ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Ask the coding agent anything about this workspace.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
                    message.role === "USER"
                      ? "bg-foreground text-background"
                      : "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-50"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                Agent is working...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent to explain, write, or fix code..."
            disabled={loading || sending || !session}
            className="flex-1 rounded-full border border-black/8 bg-white px-4 py-2 text-black outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/30"
          />
          <button
            type="submit"
            disabled={loading || sending || !session}
            className="rounded-full bg-foreground px-5 py-2 font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
