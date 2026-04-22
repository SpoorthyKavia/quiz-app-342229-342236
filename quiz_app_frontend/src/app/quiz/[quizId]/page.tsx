"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  apiGetQuiz,
  apiStartAttempt,
  type ApiError,
  type Quiz,
  type QuizAttemptStart,
  type QuizQuestion,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

type AnswerMap = Record<string, string>; // questionId -> optionId

function formatSeconds(s: number): string {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function QuizTakePage() {
  const params = useParams<{ quizId: string }>();
  const quizId = params.quizId;

  const router = useRouter();
  const { state } = useAuth();

  const token = state.status === "authenticated" ? state.token : null;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptStart | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const questions: QuizQuestion[] = attempt?.questions ?? [];
  const activeQuestion = questions[activeIndex] ?? null;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetQuiz(quizId)
      .then((q) => {
        if (cancelled) return;
        setQuiz(q);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as ApiError)?.message ||
          (err instanceof Error ? err.message : "Failed to load quiz");
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  useEffect(() => {
    // timer tick
    if (secondsLeft === null) return;

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [secondsLeft !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (secondsLeft === 0 && attempt?.attemptId) {
      // auto-submit navigates to submit page; actual submit happens there.
      router.push(`/attempt/${attempt.attemptId}/submit`);
    }
  }, [secondsLeft, attempt?.attemptId, router]);

  async function start() {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    setError(null);
    setStarting(true);
    try {
      const a = await apiStartAttempt(quizId, token);
      setAttempt(a);
      setAnswers({});
      setActiveIndex(0);
      const tl = a.timeLimitSeconds ?? quiz?.timeLimitSeconds ?? null;
      setSecondsLeft(tl);
    } catch (err: unknown) {
      const msg =
        (err as ApiError)?.message ||
        (err instanceof Error ? err.message : "Failed to start attempt");
      setError(msg);
    } finally {
      setStarting(false);
    }
  }

  function setAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  if (loading) return <div className="text-slate-600">Loading…</div>;

  if (error) {
    return (
      <div className="card p-5 text-red-700" role="alert">
        {error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="card p-5 text-slate-600">
        Quiz not found. <Link className="underline" href="/quizzes">Back</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">{quiz.title}</h1>
        <p className="mt-2 text-slate-600">{quiz.description || "No description."}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {secondsLeft !== null ? (
            <span className="badge">
              Time left: <span className="font-mono">{formatSeconds(secondsLeft)}</span>
            </span>
          ) : (
            <span className="badge">Untimed</span>
          )}
          {attempt ? (
            <span className="badge">
              Answered: {answeredCount}/{questions.length}
            </span>
          ) : null}
        </div>

        {!attempt ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={start} disabled={starting}>
              {starting ? "Starting…" : "Start quiz"}
            </button>
            <Link className="btn" href="/quizzes">
              Back
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href={`/attempt/${attempt.attemptId}/submit`}>
              Submit
            </Link>
            <Link className="btn" href="/quizzes">
              Exit
            </Link>
          </div>
        )}

        {state.status !== "authenticated" ? (
          <p className="helper mt-3">
            You’ll be prompted to sign in before starting.
          </p>
        ) : null}
      </header>

      {attempt ? (
        <section className="grid gap-4">
          <div className="flex gap-2 flex-wrap">
            {questions.map((q, idx) => {
              const answered = Boolean(answers[q.id]);
              const active = idx === activeIndex;
              return (
                <button
                  key={q.id}
                  className={`btn ${active ? "btn-primary" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                  type="button"
                  aria-current={active ? "page" : undefined}
                >
                  {idx + 1}
                  {answered ? "•" : ""}
                </button>
              );
            })}
          </div>

          {activeQuestion ? (
            <article className="card p-6">
              <h2 className="text-lg font-extrabold text-slate-900">
                Question {activeIndex + 1} / {questions.length}
              </h2>
              <p className="mt-2 text-slate-700">{activeQuestion.prompt}</p>

              <div className="mt-5 grid gap-2">
                {activeQuestion.options.map((o) => {
                  const checked = answers[activeQuestion.id] === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`card p-3 flex items-center gap-3 cursor-pointer ${
                        checked ? "border-blue-400" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${activeQuestion.id}`}
                        checked={checked}
                        onChange={() => setAnswer(activeQuestion.id, o.id)}
                      />
                      <span className="text-slate-800">{o.text}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button
                  className="btn"
                  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                  disabled={activeIndex === 0}
                  type="button"
                >
                  Previous
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setActiveIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  disabled={activeIndex === questions.length - 1}
                  type="button"
                >
                  Next
                </button>
              </div>
            </article>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
