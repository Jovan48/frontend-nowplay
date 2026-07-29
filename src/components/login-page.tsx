import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { requestMagicLink, loginWithPassword, registerWithPassword } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // New states for toggling methods and modes
  const [loginMethod, setLoginMethod] = useState<"magic" | "password">("magic");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    if (loginMethod === "password" && !password.trim()) return;

    setBusy(true);

    try {
      if (loginMethod === "magic") {
        await requestMagicLink(trimmedEmail);
        setSubmitted(true);
        toast.success("Magic link sent. Check your inbox.");
      } else {
        if (authMode === "login") {
          const data = await loginWithPassword(trimmedEmail, password);
          login(data.access, data.refresh);
          toast.success("Successfully signed in!");
          navigate({ to: "/dashboard", replace: true });
        } else {
          await registerWithPassword(trimmedEmail, password);
          setSubmitted(true);
          toast.success("Account created! Please check your email to verify.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setBusy(false);
    }
  }

  // --- SUCCESS STATE ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {authMode === "register" ? "Check your inbox to verify" : "Check your inbox"}
          </h1>
          <p className="mt-3 text-base text-slate-400">
            {authMode === "register" ? "We sent a verification link to " : "We sent a secure sign-in link to "}
            <span className="font-medium text-slate-200">{email}</span>.
            {authMode === "register" ? " Click it to activate your account." : " Open it to continue."}
          </p>
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
            If the email does not arrive within a few minutes, please check your spam folder or try again.
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setPassword("");
            }}
            className="mt-8 inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // --- LOGIN / REGISTER FORM ---
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Now Play</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {authMode === "login" ? "Sign in to your account" : "Create an account"}
            </h1>
          </div>
          <Link to="/" className="text-sm font-medium text-slate-400 transition hover:text-slate-200">
            Back home
          </Link>
        </div>

        {/* Method Toggle (Only show for Login) */}
        {authMode === "login" && (
          <div className="mt-6 flex rounded-xl border border-slate-800 bg-slate-950/50 p-1">
            <button
              type="button"
              onClick={() => setLoginMethod("magic")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                loginMethod === "magic"
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                loginMethod === "password"
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Password
            </button>
          </div>
        )}

        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
          {loginMethod === "magic"
            ? "Enter your email and we will email you a secure link that signs you in instantly."
            : authMode === "login"
            ? "Enter your email and password to access your account."
            : "Enter your email and create a password to get started."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-300" htmlFor="email">
            Email address
          </label>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
              <Mail className="h-5 w-5 text-slate-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-base text-slate-100 outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Password Field (Conditional) */}
          {loginMethod === "password" && (
            <>
              <label className="block text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-500" />
                  <input
                    id="password"
                    type="password"
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={authMode === "login" ? "••••••••" : "Create a password"}
                    className="w-full bg-transparent text-base text-slate-100 outline-none placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              "Processing..."
            ) : loginMethod === "magic" ? (
              <>
                Send magic link
                <ArrowRight className="h-4 w-4" />
              </>
            ) : authMode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {authMode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setLoginMethod("magic"); // Reset to magic link on switch
                }}
                className="font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}