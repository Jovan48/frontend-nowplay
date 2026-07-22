import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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

type Step = "credentials" | "otp";

function AuthPage() {
  const { mode } = Route.useSearch();
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  // NOTE: signIn/signUp are mock-only additions on the temporary
  // auth-context.tsx. The real auth-context.tsx doesn't have them —
  // the real version of this file calls supabase.auth.signUp /
  // signInWithPassword directly instead. See the restore-notes block
  // at the bottom of this file for how to revert when a real backend
  // is wired back in.
  const { user, loading, signIn, signUp } = useAuth();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stageName, setStageName] = useState("");
  const [busy, setBusy] = useState(false);

  // OTP-step state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendTimer]);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await signUp(email, password, stageName);
        if (error) throw new Error(error);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
      }
      // Credentials accepted — move to verification instead of navigating away.
      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split("");
    while (next.length < 6) next.push("");
    setOtp(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length < 6) return;
    setBusy(true);
    setOtpError("");
    // TODO: replace with a real verification call once a backend is
    // wired in (e.g. supabase.auth.verifyOtp({ email, token: code, type: "email" })).
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    if (code === "000000") {
      setOtpError("That code didn't work. Try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }
    toast.success(isSignup ? "Account created — welcome!" : "Welcome back");
    navigate({ to: "/dashboard", replace: true });
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

          {step === "credentials" && (
            <>
              <h1 className="text-2xl font-black tracking-tight">
                {isSignup ? "Create your creator account" : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSignup ? "Start managing your catalog in minutes." : "Sign in to your dashboard."}
              </p>

              <form onSubmit={handleCredentialsSubmit} className="mt-8 space-y-4">
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
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="text-2xl font-black tracking-tight">Verify it's you</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a 6-digit code to {email || "your email"}.
              </p>

              <div className="mt-8 flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className={`h-14 w-11 rounded-lg border bg-elevated text-center text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 ${
                      otpError ? "border-destructive" : "border-border focus:border-primary/60"
                    }`}
                  />
                ))}
              </div>

              {otpError && <p className="mt-3 text-sm text-destructive">{otpError}</p>}

              <button
                onClick={verifyOtp}
                disabled={otp.some((d) => !d) || busy}
                className="mt-6 h-11 w-full rounded-full bg-primary-gradient text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition disabled:opacity-50"
              >
                {busy ? "Verifying…" : "Verify"}
              </button>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button onClick={() => setStep("credentials")} className="text-muted-foreground hover:text-foreground">
                  ← Back
                </button>
                <button
                  onClick={() => resendTimer === 0 && setResendTimer(30)}
                  disabled={resendTimer > 0}
                  className={resendTimer > 0 ? "text-muted-foreground" : "text-primary font-semibold"}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Demo tip: any code works — try 000000 to see the error state.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TO RESTORE REAL SUPABASE AUTH LATER:
 * 1. Re-add: import { supabase } from "@/integrations/supabase/client";
 * 2. Remove signIn/signUp from the useAuth() destructure above.
 * 3. In handleCredentialsSubmit, replace the signUp(...) / signIn(...)
 *    calls with the original supabase.auth.signUp({...}) /
 *    signInWithPassword({...}) calls.
 * 4. In verifyOtp, replace the fake setTimeout + "000000" check with a
 *    real call, e.g. supabase.auth.verifyOtp({ email, token: code, type: "email" }).
 *    Note: this requires Supabase email OTP / magic-link to actually be
 *    configured to send a code on signIn/signUp — it isn't by default.
 * 5. Swap auth-context.tsx back to the real Supabase-backed version.
 */
