"use client";

import { useEffect, useState, SubmitEvent } from "react";
import { VERSION } from "./version";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVersion, setShowVersion] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/todos`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load todos");
        return res.json();
      })
      .then((data: Todo[]) => setTodos(data))
      .catch(() => setError("Could not reach the server. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async (e: SubmitEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, completed: false }),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      const created: Todo = await res.json();
      setTodos((prev) => [...prev, created]);
    } catch {
      setError("Could not save the todo. Is the backend running?");
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updated = { ...todo, completed: !todo.completed };
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update todo");
    } catch {
      setTodos(todos);
      setError("Could not update the todo. Is the backend running?");
    }
  };

  const deleteTodo = async (id: number) => {
    const previous = todos;
    setTodos(todos.filter((todo) => todo.id !== id));
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
    } catch {
      setTodos(previous);
      setError("Could not delete the todo. Is the backend running?");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Todo List
          </h1>
          <button
            onClick={() => setShowVersion(!showVersion)}
            className="rounded-full border border-black/8 bg-white px-3 py-1 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Show version"
          >
            {showVersion ? `v${VERSION}` : "version"}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={addTodo} className="mb-6 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-full border border-black/8 bg-white px-4 py-2 text-black outline-none focus:border-black/20 dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Loading todos...
          </p>
        ) : todos.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No todos yet. Add one above to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center justify-between rounded-lg border border-black/8 px-4 py-3 dark:border-white/[.145] ${
                  todo.completed
                    ? "bg-green-50 dark:bg-green-950/40"
                    : "bg-white dark:bg-zinc-900"
                }`}
              >
                <span
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-1 cursor-pointer break-all ${
                    todo.completed
                      ? "text-zinc-500 line-through dark:text-zinc-500"
                      : "text-black dark:text-zinc-50"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="ml-3 rounded-full px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
