import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Check, Play } from "lucide-react";

export type AuthMode = "login" | "signup";
type Step = "credentials" | "otp" | "success";

function WaveStep({ step }: { step: Step }) {
  const activeCount = step === "credentials" ? 1 : step === "otp" ? 3 : 5;
  return (
    <div className="flex items-end gap-1 h-5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-sm transition-colors duration-300"
          style={{
            height: i % 2 === 0 ? 20 : 12,
            background: i < activeCount ? "#168978" : "rgba(22,137,120,0.2)",
          }}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin"
      aria-hidden="true"
    />
  );
}

function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: () => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setStep("credentials");
    setForm({ name: "", email: "", password: "", confirm: "" });
    setOtp(["", "", "", "", "", ""]);
    setError("");
  }, [mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendTimer]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const pwScore = strengthOf(form.password);
  const canSubmitCredentials =
    mode === "login"
      ? emailValid && form.password.length >= 6
      : emailValid && form.name.trim().length > 1 && pwScore >= 2 && form.password === form.confirm;

  function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitCredentials) return;
    setLoading(true);
    setError("");
    // TODO: replace with real API call (e.g. POST /auth/login or /auth/signup)
    // which should trigger the server to send the 2FA / verification code.
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setResendTimer(30);
    }, 900);
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

  function verifyOtp() {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    // TODO: replace with real API call (e.g. POST /auth/verify-otp) using `code`.
    setTimeout(() => {
      setLoading(false);
      if (code === "000000") {
        setError("That code didn't work. Try again.");
        setShake(true);
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        setTimeout(() => setShake(false), 500);
      } else {
        setStep("success");
      }
    }, 900);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[400px] rounded-[20px] border border-border bg-card p-7 pt-6 pb-6 shadow-2xl ${
          shake ? "animate-[shakeX_0.4s]" : ""
        }`}
        style={{ fontFamily: "'Inter', sans-serif", animation: "cardIn 0.25s ease" }}
      >
        <style>{`
          @keyframes cardIn { from { opacity:0; transform: translateY(8px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
          @keyframes shakeX { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
        `}</style>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-full bg-primary flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
            </div>
            <span
              className="text-white font-semibold tracking-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em" }}
            >
              now-play
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {step !== "success" && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}
              >
                {step === "credentials" ? (mode === "login" ? "Welcome back" : "Join as a creator") : "Verify it's you"}
              </h2>
              <p className="text-muted-foreground text-[13px] mt-1">
                {step === "credentials"
                  ? mode === "login"
                    ? "Log in to your creator dashboard"
                    : "Set up your creator account"
                  : `We sent a 6-digit code to ${form.email || "your email"}`}
              </p>
            </div>
            <WaveStep step={step} />
          </div>
        )}

        {step === "credentials" && (
          <form onSubmit={submitCredentials} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <Field label="Full name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aria Chen"
                  className="px-3 py-2.5 rounded-[10px] border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="px-3 py-2.5 rounded-[10px] border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              {form.email.length > 0 && !emailValid && (
                <span className="text-[#ff6b7a] text-xs mt-0.5">Enter a valid email address</span>
              )}
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                className="px-3 py-2.5 rounded-[10px] border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              {mode === "signup" && form.password.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[3px] flex-1 rounded-sm transition-colors"
                      style={{
                        background:
                          i < pwScore ? (pwScore <= 1 ? "#d4183d" : pwScore === 2 ? "#e0a83f" : "#168978") : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
              )}
            </Field>
            {mode === "signup" && (
              <Field label="Confirm password">
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  className="px-3 py-2.5 rounded-[10px] border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                {form.confirm.length > 0 && form.confirm !== form.password && (
                  <span className="text-[#ff6b7a] text-xs mt-0.5">Passwords don't match</span>
                )}
              </Field>
            )}
            {mode === "login" && (
              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-primary"
                  />
                  Remember this device
                </label>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}
            <button
              type="submit"
              disabled={!canSubmitCredentials || loading}
              className="mt-1 flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-[15px] text-white transition-colors bg-primary hover:bg-[#13786a] disabled:bg-primary/35 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner /> : mode === "login" ? "Continue" : "Create account"}
            </button>
            <p className="text-center text-[13px] text-muted-foreground mt-1.5">
              {mode === "login" ? "New to Now-Play?" : "Already have an account?"}{" "}
              <button type="button" onClick={onSwitchMode} className="text-primary font-semibold">
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </form>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className={`w-11 h-[52px] text-center text-xl font-bold rounded-[10px] bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                    error ? "border border-[#d4183d]" : "border border-border"
                  }`}
                />
              ))}
            </div>
            {error && <p className="text-[#ff6b7a] text-[13px] m-0">{error}</p>}
            <button
              onClick={verifyOtp}
              disabled={otp.some((d) => !d) || loading}
              className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-[15px] text-white transition-colors bg-primary hover:bg-[#13786a] disabled:bg-primary/35 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner /> : "Verify"}
            </button>
            <div className="flex items-center justify-between text-[13px]">
              <button onClick={() => setStep("credentials")} className="text-muted-foreground">
                ← Back
              </button>
              <button
                onClick={() => resendTimer === 0 && setResendTimer(30)}
                disabled={resendTimer > 0}
                className={resendTimer > 0 ? "text-muted-foreground" : "text-primary"}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center m-0">
              Demo tip: any code works — try 000000 to see the error state.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center text-center pt-3 pb-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(22,137,120,0.15)", animation: "cardIn 0.3s ease" }}
            >
              <Check className="w-6 h-6" style={{ color: "#168978" }} strokeWidth={3} />
            </div>
            <h2
              className="text-white mb-1.5"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}
            >
              You're verified
            </h2>
            <p className="text-muted-foreground text-[13px] mb-5">
              {mode === "login" ? "Welcome back to your creator dashboard." : "Your creator account is ready to go."}
            </p>
            <button
              onClick={() => {
                navigate({ to: "/analytics" });
                onClose();
              }}
              className="w-full py-3 rounded-full font-semibold text-[15px] text-white bg-primary hover:bg-[#13786a] transition-colors"
            >
              Go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
