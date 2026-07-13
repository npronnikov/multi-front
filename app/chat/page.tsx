"use client";

import { useEffect, useRef, useState, SubmitEvent } from "react";

interface ChatSession {
  id: number;
  cwd: string;
  createdAt: string;
}

interface ToolCallEvent {
  toolCallId: string;
  title: string;
  kind: string;
  status: string;
}

interface ChatMessage {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  thought?: string | null;
  toolCallsJson?: string | null;
}

type DisplayExtra = "thoughts" | "toolCalls";

interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  stopReason: string;
}

interface AcpProcessStatus {
  alive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export default function ChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayExtras, setDisplayExtras] = useState<Set<DisplayExtra>>(new Set());
  const [showMenuOpen, setShowMenuOpen] = useState(false);
  const [acpAlive, setAcpAlive] = useState<boolean | null>(null);
  const [acpBusy, setAcpBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const showMenuRef = useRef<HTMLDivElement>(null);

  const toggleDisplayExtra = (extra: DisplayExtra) => {
    setDisplayExtras((prev) => {
      const next = new Set(prev);
      if (next.has(extra)) {
        next.delete(extra);
      } else {
        next.add(extra);
      }
      return next;
    });
  };

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

  const checkAcpStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agent/process`);
      if (!res.ok) throw new Error("Failed to check agent status");
      const status: AcpProcessStatus = await res.json();
      setAcpAlive(status.alive);
    } catch {
      setAcpAlive(null);
    }
  };

  useEffect(() => {
    checkAcpStatus();
    const interval = setInterval(checkAcpStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (showMenuRef.current && !showMenuRef.current.contains(e.target as Node)) {
        setShowMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenuOpen]);

  const toggleAcpProcess = async () => {
    setAcpBusy(true);
    try {
      const endpoint = acpAlive ? "stop" : "start";
      const res = await fetch(`${API_URL}/api/agent/process/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle agent process");
      const status: AcpProcessStatus = await res.json();
      setAcpAlive(status.alive);
    } catch {
      checkAcpStatus();
    } finally {
      setAcpBusy(false);
    }
  };

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
    <div className="flex h-[calc(100vh-49px)] flex-col items-center overflow-hidden bg-zinc-50 px-4 py-8 font-sans dark:bg-black">
      <main className="flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Agent Chat
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title={
              acpAlive === null ? "Agent status unknown" : acpAlive ? "Agent process running" : "Agent process stopped"
            }>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  acpAlive === null ? "bg-zinc-300 dark:bg-zinc-600" : acpAlive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {acpAlive === null ? "Unknown" : acpAlive ? "Running" : "Stopped"}
              </span>
            </div>
            <button
              onClick={toggleAcpProcess}
              disabled={acpBusy || acpAlive === null}
              className="rounded-full border border-black/8 px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/10"
            >
              {acpAlive ? "Kill agent" : "Start agent"}
            </button>
            <button
              onClick={startNewSession}
              disabled={loading}
              className="rounded-full border border-black/8 px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/10"
            >
              New session
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mb-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-black/8 bg-white p-4 dark:border-white/[.145] dark:bg-zinc-900">
          {loading ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Ask the coding agent anything about this workspace.
            </p>
          ) : (
            messages.map((message) => {
              const toolCalls: ToolCallEvent[] =
                displayExtras.has("toolCalls") && message.toolCallsJson
                  ? JSON.parse(message.toolCallsJson)
                  : [];
              const showThought =
                displayExtras.has("thoughts") && message.role === "ASSISTANT" && message.thought;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1.5 ${message.role === "USER" ? "items-end" : "items-start"}`}
                >
                  {showThought && (
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-xl border border-dashed border-black/10 bg-zinc-50 px-3 py-2 text-xs italic text-zinc-500 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400">
                      {message.thought}
                    </div>
                  )}

                  {toolCalls.length > 0 && (
                    <div className="flex max-w-[80%] flex-col gap-1">
                      {toolCalls.map((toolCall) => (
                        <div
                          key={toolCall.toolCallId}
                          className="rounded-full border border-black/8 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400"
                        >
                          {toolCall.kind}: {toolCall.title}{" "}
                          <span className="text-zinc-400 dark:text-zinc-500">({toolCall.status})</span>
                        </div>
                      ))}
                    </div>
                  )}

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
              );
            })
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

          <div className="relative" ref={showMenuRef}>
            {showMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border border-black/8 bg-white p-1.5 shadow-lg dark:border-white/[.145] dark:bg-zinc-900">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-black hover:bg-black/5 dark:text-zinc-50 dark:hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={displayExtras.has("thoughts")}
                    onChange={() => toggleDisplayExtra("thoughts")}
                    className="accent-black dark:accent-white"
                  />
                  Reasoning
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-black hover:bg-black/5 dark:text-zinc-50 dark:hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={displayExtras.has("toolCalls")}
                    onChange={() => toggleDisplayExtra("toolCalls")}
                    className="accent-black dark:accent-white"
                  />
                  Tool calls
                </label>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMenuOpen((open) => !open)}
              className="rounded-full bg-foreground px-5 py-2 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Show{displayExtras.size > 0 ? ` (${displayExtras.size})` : ""}
            </button>
          </div>

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
