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

interface AgentLogTurn {
  turnId: number;
  status: "RUNNING" | "DONE" | "ERROR";
  prompt: string;
  createdAt: string;
}

interface LogChunkResponse {
  chunk: string;
  nextOffset: number;
  status: string;
}

interface TurnState {
  thought: string;
  message: string;
  toolCalls: ToolCallEvent[];
  since: number;
  status: string;
}

interface StreamLine {
  type: "thought" | "message" | "tool_call" | "tool_call_update" | "done" | "error";
  data: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";
const EMPTY_TURN_STATE: TurnState = { thought: "", message: "", toolCalls: [], since: 0, status: "RUNNING" };

function applyChunk(state: TurnState, chunkText: string): TurnState {
  const next: TurnState = { ...state, toolCalls: [...state.toolCalls] };
  for (const rawLine of chunkText.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const parsed: StreamLine = JSON.parse(line);
    switch (parsed.type) {
      case "thought":
        next.thought += parsed.data as string;
        break;
      case "message":
        next.message += parsed.data as string;
        break;
      case "tool_call":
        next.toolCalls.push(parsed.data as ToolCallEvent);
        break;
      case "tool_call_update": {
        const update = parsed.data as { toolCallId: string; status: string };
        next.toolCalls = next.toolCalls.map((tc) =>
          tc.toolCallId === update.toolCallId ? { ...tc, status: update.status } : tc
        );
        break;
      }
      case "done":
      case "error":
        break;
    }
  }
  return next;
}

export default function LogsPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [turns, setTurns] = useState<AgentLogTurn[]>([]);
  const [selectedTurnId, setSelectedTurnId] = useState<number | null>(null);
  const [turnStates, setTurnStates] = useState<Record<number, TurnState>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const turnStatesRef = useRef<Record<number, TurnState>>({});
  const pollingTurnsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turnStates, selectedTurnId]);

  const createSession = async (): Promise<ChatSession> => {
    const res = await fetch(`${API_URL}/api/agent/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error("Failed to create session");
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        const sessionsRes = await fetch(`${API_URL}/api/agent/sessions`);
        if (!sessionsRes.ok) throw new Error("Failed to load sessions");
        const sessions: ChatSession[] = await sessionsRes.json();
        const active = sessions.length > 0 ? sessions[0] : await createSession();
        setSession(active);

        const turnsRes = await fetch(`${API_URL}/api/agent/sessions/${active.id}/log-turns`);
        if (!turnsRes.ok) throw new Error("Failed to load log turns");
        const loadedTurns: AgentLogTurn[] = await turnsRes.json();
        setTurns(loadedTurns);
        if (loadedTurns.length > 0) {
          setSelectedTurnId(loadedTurns[0].turnId);
        }
      } catch {
        setError("Could not reach the agent backend. Is it running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pollTurn = async (turnId: number) => {
    if (pollingTurnsRef.current.has(turnId)) return;
    pollingTurnsRef.current.add(turnId);
    try {
      while (true) {
        const state = turnStatesRef.current[turnId] ?? EMPTY_TURN_STATE;
        setPolling(true);
        let data: LogChunkResponse;
        try {
          const res = await fetch(
            `${API_URL}/api/agent/log-turns/${turnId}?since=${state.since}&timeoutMs=25000`
          );
          if (!res.ok) throw new Error("Poll failed");
          data = await res.json();
        } catch {
          setError("Lost connection to the agent log.");
          break;
        } finally {
          setPolling(false);
        }

        const updated = applyChunk(state, data.chunk);
        updated.since = data.nextOffset;
        updated.status = data.status;
        turnStatesRef.current = { ...turnStatesRef.current, [turnId]: updated };
        setTurnStates((prev) => ({ ...prev, [turnId]: updated }));

        if (data.status !== "RUNNING") {
          setTurns((prev) =>
            prev.map((t) => (t.turnId === turnId ? { ...t, status: data.status as AgentLogTurn["status"] } : t))
          );
          break;
        }
      }
    } finally {
      pollingTurnsRef.current.delete(turnId);
    }
  };

  useEffect(() => {
    if (selectedTurnId == null) return;
    pollTurn(selectedTurnId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurnId]);

  const startTurn = async (e: SubmitEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !session || starting) return;

    setInput("");
    setStarting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/agent/sessions/${session.id}/log-turns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to start turn");
      const started: { turnId: number; status: string } = await res.json();

      const newTurn: AgentLogTurn = {
        turnId: started.turnId,
        status: "RUNNING",
        prompt: text,
        createdAt: new Date().toISOString(),
      };
      turnStatesRef.current = { ...turnStatesRef.current, [newTurn.turnId]: EMPTY_TURN_STATE };
      setTurnStates((prev) => ({ ...prev, [newTurn.turnId]: EMPTY_TURN_STATE }));
      setTurns((prev) => [newTurn, ...prev]);
      setSelectedTurnId(newTurn.turnId);
    } catch {
      setInput(text);
      setError("Could not start the agent turn. Is the backend running?");
    } finally {
      setStarting(false);
    }
  };

  const selectedTurn = turns.find((t) => t.turnId === selectedTurnId) ?? null;
  const selectedState = selectedTurnId != null ? turnStates[selectedTurnId] : null;
  const isPollingSelected = polling && selectedTurn?.status === "RUNNING";

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col items-center overflow-hidden bg-zinc-50 px-4 py-8 font-sans dark:bg-black">
      <main className="flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Agent Logs
        </h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mb-4 flex min-h-0 flex-1 gap-4 overflow-hidden">
          <aside className="flex w-56 shrink-0 flex-col gap-1 overflow-y-auto rounded-lg border border-black/8 bg-white p-2 dark:border-white/[.145] dark:bg-zinc-900">
            {loading ? (
              <p className="p-2 text-center text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
            ) : turns.length === 0 ? (
              <p className="p-2 text-center text-xs text-zinc-500 dark:text-zinc-400">No runs yet</p>
            ) : (
              turns.map((turn) => (
                <button
                  key={turn.turnId}
                  onClick={() => setSelectedTurnId(turn.turnId)}
                  className={`flex flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    turn.turnId === selectedTurnId
                      ? "bg-black/8 dark:bg-white/10"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="line-clamp-2 text-black dark:text-zinc-50">{turn.prompt}</span>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      turn.status === "RUNNING"
                        ? "text-amber-600 dark:text-amber-400"
                        : turn.status === "ERROR"
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {turn.status}
                  </span>
                </button>
              ))
            )}
          </aside>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border border-black/8 bg-white p-4 dark:border-white/[.145] dark:bg-zinc-900">
            {!selectedTurn ? (
              <p className="m-auto text-center text-zinc-500 dark:text-zinc-400">
                Start a run below to see the coding agent&apos;s log here.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl bg-foreground px-4 py-2 text-sm text-background">
                  {selectedTurn.prompt}
                </div>

                {selectedState?.thought && (
                  <div className="whitespace-pre-wrap rounded-xl border border-dashed border-black/10 bg-zinc-50 px-3 py-2 text-xs italic text-zinc-500 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400">
                    {selectedState.thought}
                  </div>
                )}

                {selectedState && selectedState.toolCalls.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {selectedState.toolCalls.map((toolCall) => (
                      <div
                        key={toolCall.toolCallId}
                        className="w-fit rounded-full border border-black/8 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400"
                      >
                        {toolCall.kind}: {toolCall.title}{" "}
                        <span className="text-zinc-400 dark:text-zinc-500">({toolCall.status})</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedState?.message && (
                  <div className="whitespace-pre-wrap rounded-2xl bg-zinc-100 px-4 py-2 text-sm text-black dark:bg-zinc-800 dark:text-zinc-50">
                    {selectedState.message}
                  </div>
                )}

                {isPollingSelected && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:150ms] dark:bg-zinc-500" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:300ms] dark:bg-zinc-500" />
                    <span>получение обновлений...</span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={startTurn} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Дай задачу кодинг-агенту..."
            disabled={loading || starting || !session}
            className="flex-1 rounded-full border border-black/8 bg-white px-4 py-2 text-black outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/30"
          />
          <button
            type="submit"
            disabled={loading || starting || !session}
            className="rounded-full bg-foreground px-5 py-2 font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Run
          </button>
        </form>
      </main>
    </div>
  );
}
