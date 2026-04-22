import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="card p-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Welcome</h1>
        <p className="mt-2 text-slate-600">
          Browse quizzes by category, take timed quizzes, and track your progress.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/quizzes">
            Browse quizzes
          </Link>
          <Link className="btn" href="/dashboard">
            View dashboard
          </Link>
          <Link className="btn" href="/auth/sign-up">
            Create account
          </Link>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-extrabold text-slate-900">Admin</h2>
        <p className="mt-2 text-slate-600">
          Create categories, quizzes, and questions. (Requires admin role from backend.)
        </p>
        <div className="mt-5">
          <Link className="btn" href="/admin">
            Go to admin
          </Link>
        </div>

        <p className="helper mt-3">
          Backend integration: set <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code>.
        </p>
      </section>
    </div>
  );
}
