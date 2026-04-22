import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz App",
  description:
    "Browse quizzes by category, take timed quizzes, track progress, and manage quizzes as an admin.",
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-slate-700 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <header className="border-b border-slate-200 bg-white">
          <div className="container-app h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-extrabold text-slate-900">
                Quiz App
              </Link>
              <span className="badge">MVP</span>
            </div>

            <nav className="flex items-center gap-5">
              <NavLink href="/quizzes">Quizzes</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/admin">Admin</NavLink>
              <NavLink href="/auth/sign-in">Sign in</NavLink>
            </nav>
          </div>
        </header>

        <main className="container-app py-8">{children}</main>

        <footer className="container-app py-10 text-sm text-slate-500">
          <div className="border-t border-slate-200 pt-6">
            Quiz App • Frontend-only MVP with backend integration points
          </div>
        </footer>
      </body>
    </html>
  );
}
