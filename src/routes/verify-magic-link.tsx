import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { verifyMagicLink } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

interface VerifyMagicLinkProps {
  token: string;
}


const searchSchema = z.object({
  token: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/verify-magic-link")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Verify Magic Link — Now Play" }] }),
  component: VerifyMagicLinkRoute,
});

function VerifyMagicLinkRoute() {
  const { token } = Route.useSearch();
  return <VerifyMagicLink token={token ?? ""} />;
}




export function VerifyMagicLink({ token }: VerifyMagicLinkProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid link: No token provided.");
      return;
    }

    async function processToken() {
      try {
        const data = await verifyMagicLink(token);
        
        // Save the JWTs to localStorage via your auth context
        login(data.access, data.refresh);
        
        toast.success(data.is_new_user ? "Account created successfully!" : "Signed in successfully!");
        
        // Redirect to dashboard
        navigate({ to: "/dashboard", replace: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to verify link.";
        toast.error(message);
      }
    }

    processToken();
  }, [token, login, navigate]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-50">
        <div className="max-w-md text-center space-y-4 bg-slate-900/80 p-8 rounded-3xl border border-slate-800">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-2xl font-semibold">Invalid Link</h1>
          <p className="text-slate-400">This magic link is missing a token.</p>
          <button 
            onClick={() => navigate({ to: "/login" })}
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-50">
      <div className="max-w-md text-center space-y-6 bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Verifying your identity</h1>
        <p className="text-slate-400">
          Please wait while we securely validate your magic link...
        </p>
      </div>
    </div>
  );
}