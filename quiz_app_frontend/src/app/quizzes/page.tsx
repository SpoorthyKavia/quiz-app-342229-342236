"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  apiListCategories,
  apiListQuizzes,
  type Category,
  type Quiz,
  type ApiError,
} from "@/lib/api";

export default function QuizzesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([apiListCategories(), apiListQuizzes()])
      .then(([cats, qz]) => {
        if (cancelled) return;
        setCategories(cats);
        setQuizzes(qz);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as ApiError)?.message ||
          (err instanceof Error ? err.message : "Failed to load quizzes");
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!categories.length && !quizzes.length) return;

    setLoading(true);
    setError(null);

    apiListQuizzes({ categoryId: categoryId || undefined })
      .then((qz) => {
        if (cancelled) return;
        setQuizzes(qz);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as ApiError)?.message ||
          (err instanceof Error ? err.message : "Failed to load quizzes");
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return (
    <div className="grid gap-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quizzes</h1>
          <p className="mt-1 text-slate-600">
            Browse by category and start a timed attempt.
          </p>
        </div>

        <div className="min-w-[240px]">
          <label className="grid gap-2">
            <span className="label">Category</span>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {activeCategory?.description ? (
            <p className="helper mt-2">{activeCategory.description}</p>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="card p-4 text-red-700" role="alert">
          {error}
          <div className="helper mt-2 text-slate-600">
            Make sure <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code>{" "}
            is configured and the backend is running.
          </div>
        </div>
      ) : null}

      {loading ? <div className="text-slate-600">Loading…</div> : null}

      <section className="grid gap-3">
        {quizzes.map((q) => (
          <article key={q.id} className="card p-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{q.title}</h2>
              <p className="mt-1 text-slate-600">
                {q.description || "No description provided."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.timeLimitSeconds ? (
                  <span className="badge">Time: {q.timeLimitSeconds}s</span>
                ) : (
                  <span className="badge">Untimed</span>
                )}
                {q.questionCount ? (
                  <span className="badge">{q.questionCount} questions</span>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <Link className="btn btn-primary" href={`/quiz/${q.id}`}>
                Start
              </Link>
            </div>
          </article>
        ))}

        {!loading && !error && quizzes.length === 0 ? (
          <div className="card p-5 text-slate-600">No quizzes found.</div>
        ) : null}
      </section>
    </div>
  );
}
