"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiAdminCreateCategory, type ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminNewCategoryPage() {
  const router = useRouter();
  const { state, isAdmin } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (state.status !== "authenticated" || !isAdmin) {
      setError("Admin access required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiAdminCreateCategory(
        { name, description: description || undefined },
        state.token
      );
      router.push("/admin");
    } catch (err: unknown) {
      const msg =
        (err as ApiError)?.message ||
        (err instanceof Error ? err.message : "Create category failed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl grid gap-4">
      <header className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">New category</h1>
        <p className="mt-2 text-slate-600">Create a category for grouping quizzes.</p>
      </header>

      <section className="card p-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="label">Name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="grid gap-2">
            <span className="label">Description</span>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          {error ? (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3 flex-wrap">
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? "Creating…" : "Create"}
            </button>
            <Link className="btn" href="/admin">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
