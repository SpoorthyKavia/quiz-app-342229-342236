"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function AdminHomePage() {
  const { state, isAdmin } = useAuth();

  if (state.status === "anonymous") {
    return (
      <div className="max-w-xl card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin</h1>
        <p className="mt-2 text-slate-600">Sign in to access admin tools.</p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <Link className="btn btn-primary" href="/auth/sign-in">
            Sign in
          </Link>
          <Link className="btn" href="/quizzes">
            Back to quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "authenticated" && !isAdmin) {
    return (
      <div className="max-w-xl card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin</h1>
        <p className="mt-2 text-slate-600">
          You are signed in, but do not have the admin role.
        </p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <Link className="btn" href="/dashboard">
            Go to dashboard
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
        <h1 className="text-2xl font-extrabold text-slate-900">Admin</h1>
        <p className="mt-2 text-slate-600">
          Manage categories, quizzes, and questions.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Categories</h2>
          <p className="mt-2 text-slate-600">Create and organize quiz categories.</p>
          <div className="mt-4">
            <Link className="btn btn-primary" href="/admin/categories/new">
              New category
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Quizzes</h2>
          <p className="mt-2 text-slate-600">Create quizzes and add questions.</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link className="btn btn-primary" href="/admin/quizzes/new">
              New quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
