import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { VerifyMagicLink } from "@/components/verify-magic-link";

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
