import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreatorShell } from "@/components/creator-shell";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { albums, tracks, totalPlays, formatNumber } from "@/lib/mock-data";
import { MapPin, Music, Disc3, Play } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Now Play for Creators" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ stage_name: "", biography: "", genre: "", location: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      stage_name: profile.stage_name ?? "",
      biography: profile.biography ?? "",
      genre: profile.genre ?? "",
      location: profile.location ?? "",
    });
  }, [profile]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Profile saved");
  }

  const initials = (form.stage_name || user?.email || "NC").slice(0, 2).toUpperCase();

  return (
    <CreatorShell>
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-hero-gradient p-8 md:p-12">
        <div className="flex flex-wrap items-end gap-6">
          <div className="grid h-28 w-28 md:h-36 md:w-36 place-items-center rounded-full bg-primary-gradient text-primary-foreground text-3xl font-black shadow-glow">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified Creator</div>
            <h1 className="mt-1 text-4xl md:text-6xl font-black tracking-tight">{form.stage_name || "Your stage name"}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {form.genre && <span className="inline-flex items-center gap-1"><Music className="h-3.5 w-3.5" /> {form.genre}</span>}
              {form.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {form.location}</span>}
              <span className="inline-flex items-center gap-1"><Disc3 className="h-3.5 w-3.5" /> {albums.length} releases</span>
              <span className="inline-flex items-center gap-1"><Play className="h-3.5 w-3.5" /> {formatNumber(totalPlays)} total plays</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Edit profile</h3>
          <p className="mt-1 text-xs text-muted-foreground">Public info visible on your creator page.</p>

          <div className="mt-6 grid gap-4">
            <Field label="Stage name">
              <input value={form.stage_name} onChange={(e) => setForm({ ...form, stage_name: e.target.value })} maxLength={60}
                className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Genre">
                <input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} maxLength={40}
                  className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={80}
                  className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
              </Field>
            </div>
            <Field label="Biography">
              <textarea value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} maxLength={600} rows={5}
                className="w-full rounded-lg border border-border bg-elevated p-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" />
            </Field>

            <div className="flex justify-end">
              <button onClick={save} disabled={saving} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">At a glance</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Songs" value={tracks.length.toString()} />
              <Stat label="Albums" value={albums.length.toString()} />
              <Stat label="Plays" value={formatNumber(totalPlays)} />
              <Stat label="Genre" value={form.genre || "—"} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card-gradient p-6">
            <div className="text-sm font-bold">Biography preview</div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {form.biography || "Add a biography so listeners know your story."}
            </p>
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-elevated p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold truncate">{value}</div>
    </div>
  );
}