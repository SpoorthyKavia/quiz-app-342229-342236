"use client";

import { useEffect, useMemo, useState } from "react";
import { apiMe, clearToken, getToken, setToken, type AuthUser } from "@/lib/api";

export type AuthState =
  | { status: "anonymous"; token: null; user: null }
  | { status: "loading"; token: string; user: null }
  | { status: "authenticated"; token: string; user: AuthUser }
  | { status: "error"; token: string | null; user: null; error: string };

function hasAdminRole(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.roles?.includes("admin") || user.roles?.includes("ADMIN");
}

// PUBLIC_INTERFACE
export function useAuth(): {
  state: AuthState;
  signOut: () => void;
  setAuthToken: (token: string) => void;
  isAdmin: boolean;
} {
  /** Client-side auth hook for MVP token-based auth. */
  const [state, setState] = useState<AuthState>(() => {
    const t = getToken();
    return t ? { status: "loading", token: t, user: null } : { status: "anonymous", token: null, user: null };
  });

  useEffect(() => {
    const t = getToken();
    if (!t) {
      setState({ status: "anonymous", token: null, user: null });
      return;
    }

    let cancelled = false;
    setState({ status: "loading", token: t, user: null });

    apiMe(t)
      .then((user) => {
        if (cancelled) return;
        setState({ status: "authenticated", token: t, user });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to load session";
        setState({ status: "error", token: t, user: null, error: msg });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = () => {
    clearToken();
    setState({ status: "anonymous", token: null, user: null });
  };

  const setAuthToken = (token: string) => {
    setToken(token);
    setState({ status: "loading", token, user: null });
    apiMe(token)
      .then((user) => setState({ status: "authenticated", token, user }))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load session";
        setState({ status: "error", token, user: null, error: msg });
      });
  };

  const isAdmin = useMemo(() => hasAdminRole(state.status === "authenticated" ? state.user : null), [state]);

  return { state, signOut, setAuthToken, isAdmin };
}
