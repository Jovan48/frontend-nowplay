import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { verifyMagicLink } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

type VerificationStatus = "loading" | "success" | "error";

export function VerifyMagicLink({ token }: { token: string }) {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your sign-in link...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This link is missing its verification token.");
      return;
    }

    let active = true;

    async function verify() {
      try {
        const payload = await verifyMagicLink(token);
        if (!active) return;

        const result = await login(payload.access, payload.refresh);
        if (!active) return;

        if (result.error) {
          throw new Error(result.error);
        }

        setStatus("success");
        setMessage("Your session is ready. Redirecting to your dashboard...");
        navigate({ to: "/dashboard", replace: true });
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "This sign-in link is invalid or has expired.");
        toast.error("Unable to verify your link.");
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [login, navigate, token]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        {status === "loading" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-400">
              <LoaderCircle className="h-7 w-7 animate-spin" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">Verifying your sign-in</h1>
            <p className="mt-3 text-base text-slate-400">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-3 text-base text-slate-400">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">Unable to continue</h1>
            <p className="mt-3 text-base text-slate-400">{message}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Request a new link
              </Link>
              <Link to="/" className="rounded-full border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
                Back home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
