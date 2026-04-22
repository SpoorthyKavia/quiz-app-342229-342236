"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiSignUp, type ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const { setAuthToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { token } = await apiSignUp({ email, password });
      setAuthToken(token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as ApiError)?.message ||
        (err instanceof Error ? err.message : "Sign up failed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Create account</h1>
        <p className="mt-2 text-slate-600">Sign up to track quiz progress.</p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="label">Email</span>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
            />
          </label>

          <label className="grid gap-2">
            <span className="label">Password</span>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </label>

          <label className="grid gap-2">
            <span className="label">Confirm password</span>
            <input
              className="input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </label>

          {error ? (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}

          <button className="btn btn-primary" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create account"}
          </button>

          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold underline" href="/auth/sign-in">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
