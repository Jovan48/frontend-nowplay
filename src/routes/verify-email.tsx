import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  uid: z.string().optional().catch(undefined),
  token: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Verify Email — Now Play" }] }),
  component: VerifyEmailRoute,
});

function VerifyEmailRoute() {
  const { uid, token } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid verification link. Missing UID or token.");
      return;
    }

    const verify = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/accounts/auth/verify-email/?uid=${uid}&token=${token}`, {
          method: "GET", // Your backend EmailVerificationView is a GET request
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
          setTimeout(() => navigate({ to: "/login" }), 2000);
        } else {
          setStatus("error");
          setMessage(data.detail || "Invalid or expired verification link.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verify();
  }, [uid, token, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="flex flex-col items-center text-center">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />}
          {status === "success" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
          )}
          {status === "error" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <XCircle className="h-7 w-7" />
            </div>
          )}
          
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {status === "loading" ? "Verifying..." : status === "success" ? "You're verified!" : "Link Invalid"}
          </h1>
          <p className="mt-4 text-base text-slate-400">{message}</p>
          
          {status === "error" && (
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}