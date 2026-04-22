"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiMyProgress, type ApiError, type QuizAttemptResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { state, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptsTaken, setAttemptsTaken] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [recentResults, setRecentResults] = useState<QuizAttemptResult[]>([]);

  useEffect(() => {
    if (state.status !== "authenticated") return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiMyProgress(state.token)
      .then((p) => {
        if (cancelled) return;
        setAttemptsTaken(p.attemptsTaken);
        setAverageScore(p.averageScore);
        setRecentResults(p.recentResults);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as ApiError)?.message ||
          (err instanceof Error ? err.message : "Failed to load progress");
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state]);

  if (state.status === "anonymous") {
    return (
      <div className="max-w-xl card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Sign in to view your progress and recent results.
        </p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <Link className="btn btn-primary" href="/auth/sign-in">
            Sign in
          </Link>
          <Link className="btn" href="/quizzes">
            Browse quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
            {state.status === "authenticated" ? (
              <p className="mt-2 text-slate-600">
                Signed in as <span className="font-semibold">{state.user.email}</span>
              </p>
            ) : (
              <p className="mt-2 text-slate-600">Loading session…</p>
            )}
          </div>

          <div className="flex gap-3">
            <Link className="btn" href="/quizzes">
              Take a quiz
            </Link>
            <button className="btn btn-danger" onClick={signOut} type="button">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="card p-5 text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <div className="text-slate-600">Loading…</div> : null}

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Attempts taken</div>
          <div className="mt-1 text-3xl font-extrabold text-slate-900">{attemptsTaken}</div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Average score</div>
          <div className="mt-1 text-3xl font-extrabold text-slate-900">{averageScore}</div>
        </div>

        <div className="card p-5">
          <div className="text-sm text-slate-500">Admin access</div>
          <div className="mt-2 text-slate-700">
            If you have the admin role, you can manage quizzes.
          </div>
          <div className="mt-4">
            <Link className="btn" href="/admin">
              Admin
            </Link>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-extrabold text-slate-900">Recent results</h2>
        <div className="mt-4 grid gap-3">
          {recentResults.map((r) => (
            <div key={r.attemptId} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900">
                  Quiz {r.quizId}
                </div>
                <div className="helper">
                  {r.correctCount}/{r.totalQuestions} correct
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Score</div>
                <div className="text-2xl font-extrabold text-slate-900">{r.score}</div>
              </div>
            </div>
          ))}

          {!loading && !error && recentResults.length === 0 ? (
            <div className="text-slate-600">No results yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
