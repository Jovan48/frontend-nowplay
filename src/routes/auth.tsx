import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Radio, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).default("signin").catch("signin") });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Now Play for Creators" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  // NOTE: signIn/signUp are mock-only additions on the temporary
  // auth-context.tsx. The real auth-context.tsx doesn't have them —
  // the real version of this file calls supabase.auth.signUp /
  // signInWithPassword directly instead. Revert this block (see
  // bottom of file) when a real backend is wired back in.
  const { user, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stageName, setStageName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await signUp(email, password, stageName);
        if (error) throw new Error(error);
        toast.success("Account created — welcome!");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
        toast.success("Welcome back");
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background text-foreground">
      <div className="relative hidden md:block bg-hero-gradient">
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="h-full w-full grid place-items-center p-12">
          <div className="max-w-md">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-gradient shadow-glow">
              <Radio className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight">
              Your music.<br />Your catalog.<br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Your control.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">A premium dashboard for the artist you're becoming.</p>
          </div>
        </div>
      </div>

      <div className="grid place-items-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-black tracking-tight">
            {isSignup ? "Create your creator account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignup ? "Start managing your catalog in minutes." : "Sign in to your dashboard."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignup && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage name</label>
                <input
                  value={stageName} onChange={(e) => setStageName(e.target.value)} maxLength={60}
                  className="mt-1 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Nova Reyes"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
                className="mt-1 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="you@studio.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
              <input
                required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              disabled={busy}
              className="mt-2 h-11 w-full rounded-full bg-primary-gradient text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition disabled:opacity-50"
            >
              {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to Now Play? "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "signin" : "signup" }}
              className="font-semibold text-foreground hover:text-primary"
            >
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TO RESTORE REAL SUPABASE AUTH LATER:
 * 1. Re-add: import { supabase } from "@/integrations/supabase/client";
 * 2. Remove signIn/signUp from the useAuth() destructure above.
 * 3. In handleSubmit, replace the signUp(...) / signIn(...) calls with
 *    the original supabase.auth.signUp({...}) / signInWithPassword({...})
 *    calls (see the version of this file you shared earlier).
 * 4. Swap auth-context.tsx back to the real Supabase-backed version.
 */
