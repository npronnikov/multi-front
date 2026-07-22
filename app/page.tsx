"use client";

import { useEffect, useState, SubmitEvent } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (text: string) => void;
}

const EDIT_MODAL_CONTAINER = "550e8400-e29b-41d4-a716-446655440000";
const EDIT_MODAL_INPUT = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const EDIT_MODAL_SAVE = "9bf7e3cf-4dd4-4371-b3c4-68e88d18f7d9";
const EDIT_MODAL_CANCEL = "a0eebc99-9c3b-4b38-9b9a-3a9b9c9d9e9f";

const TODO_EDIT_BUTTON = "b1c4d2e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e";
const TODO_TEXT = "c2d5e3f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f";
const TODO_TOGGLE_BUTTON = "d3e6f4a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a";
const TODO_DELETE_BUTTON = "e4f7a5b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

async function updateTodo(id: number, text: string, completed: boolean): Promise<Todo> {
  const response = await fetch(`${API_URL}/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, completed }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update todo");
  }
  
  return response.json();
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

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

  const handleEditClick = (id: number) => {
    setEditingTodoId(id);
    setIsEditModalOpen(true);
  };

  // T010-T013: Optimistic update with API call and error handling
  const handleSaveEdit = async (newText: string) => {
    if (editingTodoId === null) return;
    
    const todo = todos.find((t) => t.id === editingTodoId);
    if (!todo) return;
    
    // T010: Optimistic update
    const previous = todos;
    setTodos(todos.map((t) => (t.id === editingTodoId ? { ...t, text: newText } : t)));
    
    try {
      // T011: API call to confirm
      await updateTodo(editingTodoId, newText, todo.completed);
      // Success - UI stays updated
    } catch (err) {
      // T012: Rollback on error
      setTodos(previous);
      // T014: Show error message
      setError("Failed to save changes");
    }
  };

  const editingTodo = editingTodoId !== null 
    ? todos.find((t) => t.id === editingTodoId)
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Todo List
        </h1>

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
                  data-id={`todo-text-${TODO_TEXT}`}
                  className={`flex-1 cursor-pointer break-all ${
                    todo.completed
                      ? "text-zinc-500 line-through dark:text-zinc-500"
                      : "text-black dark:text-zinc-50"
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(todo.id)}
                    data-id={`edit-button-${TODO_EDIT_BUTTON}`}
                    className="rounded-full px-3 py-1 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    data-id={`delete-button-${TODO_DELETE_BUTTON}`}
                    className="rounded-full px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTodoId(null);
          setError(null);
        }}
        initialText={editingTodo?.text || ""}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

function EditModal({ isOpen, onClose, initialText, onSave }: EditModalProps) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(initialText);
    setError(null);
  }, [initialText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, text]);

  const handleSave = () => {
    const validationError = validateText(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(text);
    setText("");
  };

  const handleCancel = () => {
    setText(initialText);
    setError(null);
    onClose();
  };

  const validateText = (value: string): string | null => {
    if (!value.trim()) {
      return "Text is required";
    }
    if (value.length > 500) {
      return "Text cannot exceed 500 characters";
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      data-id={`edit-modal-${EDIT_MODAL_CONTAINER}`}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
          Edit Todo
        </h2>
        
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          data-id={`edit-input-${EDIT_MODAL_INPUT}`}
          className="w-full rounded-lg border border-black/8 bg-white px-4 py-3 text-black outline-none focus:border-black/20 dark:border-white/[.145] dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white/30 min-h-[100px] resize-none"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {text.length}/500 characters
        </p>

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={handleCancel}
            data-id={`edit-cancel-${EDIT_MODAL_CANCEL}`}
            className="rounded-full px-4 py-2 font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            data-id={`edit-save-${EDIT_MODAL_SAVE}`}
            disabled={!text.trim() || text.length > 500}
            className="rounded-full bg-foreground px-4 py-2 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
