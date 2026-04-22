"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  apiAdminCreateQuiz,
  apiListCategories,
  type ApiError,
  type Category,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminNewQuizPage() {
  const router = useRouter();
  const { state, isAdmin } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<string>("");

  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingCats(true);
    apiListCategories()
      .then((cats) => {
        if (cancelled) return;
        setCategories(cats);
        if (!categoryId && cats.length) setCategoryId(cats[0].id);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as ApiError)?.message ||
          (err instanceof Error ? err.message : "Failed to load categories");
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingCats(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (state.status !== "authenticated" || !isAdmin) {
      setError("Admin access required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiAdminCreateQuiz(
        {
          categoryId,
          title,
          description: description || undefined,
          timeLimitSeconds: timeLimitSeconds ? Number(timeLimitSeconds) : undefined,
        },
        state.token
      );
      router.push("/admin");
    } catch (err: unknown) {
      const msg =
        (err as ApiError)?.message ||
        (err instanceof Error ? err.message : "Create quiz failed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl grid gap-4">
      <header className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">New quiz</h1>
        <p className="mt-2 text-slate-600">Create a quiz and then add questions.</p>
      </header>

      <section className="card p-6">
        {loadingCats ? (
          <div className="text-slate-600">Loading categories…</div>
        ) : (
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="label">Category</span>
              <select
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="helper">
                No categories? Create one first.
              </span>
            </label>

            <label className="grid gap-2">
              <span className="label">Title</span>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
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

            <label className="grid gap-2">
              <span className="label">Time limit (seconds)</span>
              <input
                className="input"
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 120"
              />
            </label>

            {error ? (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            ) : null}

            <div className="flex gap-3 flex-wrap">
              <button className="btn btn-primary" disabled={submitting} type="submit">
                {submitting ? "Creating…" : "Create quiz"}
              </button>
              <Link className="btn" href="/admin">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
