import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { requestMagicLink } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setBusy(true);

    try {
      await requestMagicLink(trimmedEmail);
      setSubmitted(true);
      toast.success("Magic link sent. Check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not send your magic link.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mt-3 text-base text-slate-400">
            We sent a secure sign-in link to <span className="font-medium text-slate-200">{email}</span>.
            Open it to continue.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
            If the email does not arrive within a few minutes, please check your spam folder or try again.
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-8 inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Now Play</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in with a magic link</h1>
          </div>
          <Link to="/" className="text-sm font-medium text-slate-400 transition hover:text-slate-200">
            Back home
          </Link>
        </div>

        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
          Enter your email and we will email you a secure link that signs you in instantly.
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
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send link"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
