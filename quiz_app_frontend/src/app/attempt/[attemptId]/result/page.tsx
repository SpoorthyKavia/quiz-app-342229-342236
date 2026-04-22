"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function AttemptResultPage() {
  const params = useParams<{ attemptId: string }>();
  const search = useSearchParams();
  const score = search.get("score");

  return (
    <div className="max-w-xl grid gap-4">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Results</h1>
        <p className="mt-2 text-slate-600">
          Attempt <span className="font-mono">{params.attemptId}</span>
        </p>

        <div className="mt-5 card p-4">
          <div className="text-sm text-slate-500">Score</div>
          <div className="text-4xl font-extrabold text-slate-900">
            {score ?? "—"}
          </div>
          <p className="helper mt-2">
            Backend integration point: fetch full result details (correct/total, breakdown) by attempt id.
          </p>
        </div>

        <div className="mt-6 flex gap-3 flex-wrap">
          <Link className="btn btn-primary" href="/quizzes">
            Take another quiz
          </Link>
          <Link className="btn" href="/dashboard">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
