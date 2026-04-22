/**
 * Lightweight REST client for quiz_app_backend.
 *
 * NOTE: The backend OpenAPI spec was not present in this repository at implementation time.
 * Endpoints below are conventional placeholders and may need alignment with the backend.
 */

export type ApiErrorShape = {
  message: string;
  detail?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getApiBaseUrl(): string {
  // IMPORTANT: request this env var to be set in the container environment.
  // Example: NEXT_PUBLIC_API_BASE_URL="https://api.example.com"
  const v = process.env.NEXT_PUBLIC_API_BASE_URL;
  return v?.replace(/\/+$/, "") || "";
}

export type Category = { id: string; name: string; description?: string };
export type Quiz = {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  timeLimitSeconds?: number;
  questionCount?: number;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};

export type QuizAttemptStart = {
  attemptId: string;
  quizId: string;
  expiresAt?: string;
  timeLimitSeconds?: number;
  questions: QuizQuestion[];
};

export type QuizAttemptSubmitRequest = {
  answers: { questionId: string; optionId: string }[];
};

export type QuizAttemptResult = {
  attemptId: string;
  quizId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

export type SignInRequest = { email: string; password: string };
export type SignUpRequest = { email: string; password: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

async function requestJson<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const base = getApiBaseUrl();

  if (!base) {
    throw new ApiError(
      "Missing NEXT_PUBLIC_API_BASE_URL. Please configure the frontend environment.",
      0
    );
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let payload: unknown = undefined;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    const message =
      (payload as ApiErrorShape | undefined)?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

/**
 * Auth token storage: localStorage for MVP simplicity.
 * If you prefer httpOnly cookies, move token handling to the backend + Next middleware.
 */
const TOKEN_KEY = "quiz_app_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

// PUBLIC_INTERFACE
export async function apiSignIn(req: SignInRequest): Promise<{ token: string; user: AuthUser }> {
  /** Sign in a user. Backend placeholder: POST /auth/login */
  return requestJson("/auth/login", { method: "POST", body: req });
}

// PUBLIC_INTERFACE
export async function apiSignUp(req: SignUpRequest): Promise<{ token: string; user: AuthUser }> {
  /** Register a user. Backend placeholder: POST /auth/register */
  return requestJson("/auth/register", { method: "POST", body: req });
}

// PUBLIC_INTERFACE
export async function apiMe(token: string): Promise<AuthUser> {
  /** Get current user. Backend placeholder: GET /auth/me */
  return requestJson("/auth/me", { method: "GET", token });
}

// PUBLIC_INTERFACE
export async function apiListCategories(): Promise<Category[]> {
  /** List categories. Backend placeholder: GET /categories */
  return requestJson("/categories");
}

// PUBLIC_INTERFACE
export async function apiListQuizzes(params: { categoryId?: string } = {}): Promise<Quiz[]> {
  /** List quizzes. Backend placeholder: GET /quizzes?categoryId=... */
  const qs = params.categoryId ? `?categoryId=${encodeURIComponent(params.categoryId)}` : "";
  return requestJson(`/quizzes${qs}`);
}

// PUBLIC_INTERFACE
export async function apiGetQuiz(quizId: string): Promise<Quiz> {
  /** Get quiz details. Backend placeholder: GET /quizzes/{quizId} */
  return requestJson(`/quizzes/${encodeURIComponent(quizId)}`);
}

// PUBLIC_INTERFACE
export async function apiStartAttempt(quizId: string, token: string): Promise<QuizAttemptStart> {
  /** Start attempt. Backend placeholder: POST /quizzes/{quizId}/attempts */
  return requestJson(`/quizzes/${encodeURIComponent(quizId)}/attempts`, {
    method: "POST",
    token,
  });
}

// PUBLIC_INTERFACE
export async function apiSubmitAttempt(
  attemptId: string,
  req: QuizAttemptSubmitRequest,
  token: string
): Promise<QuizAttemptResult> {
  /** Submit attempt answers. Backend placeholder: POST /attempts/{attemptId}/submit */
  return requestJson(`/attempts/${encodeURIComponent(attemptId)}/submit`, {
    method: "POST",
    body: req,
    token,
  });
}

// PUBLIC_INTERFACE
export async function apiMyProgress(token: string): Promise<{
  attemptsTaken: number;
  averageScore: number;
  recentResults: QuizAttemptResult[];
}> {
  /** User progress. Backend placeholder: GET /me/progress */
  return requestJson("/me/progress", { token });
}

// ---------- Admin (placeholders) ----------

export type AdminCategoryUpsert = { name: string; description?: string };
export type AdminQuizUpsert = {
  categoryId: string;
  title: string;
  description?: string;
  timeLimitSeconds?: number;
};

export type AdminQuestionUpsert = {
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
};

// PUBLIC_INTERFACE
export async function apiAdminCreateCategory(
  req: AdminCategoryUpsert,
  token: string
): Promise<Category> {
  /** Admin create category. Placeholder: POST /admin/categories */
  return requestJson("/admin/categories", { method: "POST", body: req, token });
}

// PUBLIC_INTERFACE
export async function apiAdminCreateQuiz(req: AdminQuizUpsert, token: string): Promise<Quiz> {
  /** Admin create quiz. Placeholder: POST /admin/quizzes */
  return requestJson("/admin/quizzes", { method: "POST", body: req, token });
}

// PUBLIC_INTERFACE
export async function apiAdminAddQuestion(
  quizId: string,
  req: AdminQuestionUpsert,
  token: string
): Promise<{ id: string }> {
  /** Admin add question. Placeholder: POST /admin/quizzes/{quizId}/questions */
  return requestJson(`/admin/quizzes/${encodeURIComponent(quizId)}/questions`, {
    method: "POST",
    body: req,
    token,
  });
}
