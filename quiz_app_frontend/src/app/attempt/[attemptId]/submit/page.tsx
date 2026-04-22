"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiSubmitAttempt, type ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * NOTE: For MVP simplicity, this page cannot access the in-memory answers from /quiz/[quizId].
 * In a real implementation, store attempt state in backend or persist answers in localStorage.
 *
 * Backend integration point: submit attempt answers via POST /attempts/{attemptId}/submit.
 */
export default function AttemptSubmitPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const router = useRouter();
  const { state } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, go sign-in
    if (state.status === "anonymous") {
      router.push("/auth/sign-in");
    }
  }, [state.status, router]);

  async function submitEmptyForMvp() {
    if (state.status !== "authenticated") return;
    setError(null);
    setSubmitting(true);
    try {
      // MVP placeholder: empty answers list. Backend should validate and return error if required.
      const result = await apiSubmitAttempt(attemptId, { answers: [] }, state.token);
      router.push(`/attempt/${attemptId}/result?score=${encodeURIComponent(String(result.score))}`);
    } catch (err: unknown) {
      const msg =
        (err as ApiError)?.message ||
        (err instanceof Error ? err.message : "Submit failed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl grid gap-4">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Submit attempt</h1>
        <p className="mt-2 text-slate-600">
          This MVP submit screen demonstrates the backend integration point.
        </p>

        <div className="mt-5 flex gap-3 flex-wrap">
          <button className="btn btn-primary" onClick={submitEmptyForMvp} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit now"}
          </button>
          <Link className="btn" href="/quizzes">
            Back to quizzes
          </Link>
        </div>

        {error ? (
          <div className="mt-4 text-sm text-red-600" role="alert">
            {error}
            <div className="helper mt-2">
              If the backend requires answers, enhance the quiz page to persist answers and post them here.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
