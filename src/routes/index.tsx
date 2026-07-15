import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio, BarChart3, Upload, Music2, Disc3, Sparkles, ArrowRight, PlayCircle, Facebook, Twitter, Linkedin, Instagram, Phone, Mail, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-studio.jpg";
import fUpload from "@/assets/f-upload.jpg";
import fCatalog from "@/assets/f-catalog.jpg";
import fAnalytics from "@/assets/f-analytics.jpg";
import fAlbum from "@/assets/f-album.jpg";
import fProfile from "@/assets/f-profile.jpg";
import fPremium from "@/assets/f-premium.jpg";
import wUpload from "@/assets/w-upload.jpg";
import wOrganize from "@/assets/w-organize.jpg";
import wAnalyze from "@/assets/w-analyze.jpg";
import wGrow from "@/assets/w-grow.jpg";
import creatorsCta from "@/assets/creators-cta.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-gradient shadow-glow ring-1 ring-primary/40">
              <span className="text-[10px] font-black tracking-wider text-primary-foreground">CBM</span>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold">Now Play</span>
                <Radio className="h-3 w-3 text-primary" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">for Creators</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#creators" className="hover:text-foreground transition-colors">Creators</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-elevated">
              Login
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Built for musicians, DJs, producers &amp; podcasters
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              Your music.<br />
              Your catalog.<br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Your control.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              The premium creator dashboard for audio. Upload releases, manage your catalog, and
              track performance — all in one professionally designed workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-semibold hover:bg-elevated transition">
                <PlayCircle className="h-4 w-4" /> Login
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-xs text-muted-foreground">
              <div><div className="text-2xl font-bold text-foreground">240K+</div>creators onboard</div>
              <div><div className="text-2xl font-bold text-foreground">18M</div>tracks managed</div>
              <div><div className="text-2xl font-bold text-foreground">99.99%</div>uptime</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-card-elevated">
              <img src={heroImage} alt="Music producer at a modern studio workstation" width={1600} height={1000} className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-primary uppercase tracking-wider">Features</div>
          <h2 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">Everything a modern creator needs.</h2>
          <p className="mt-4 text-muted-foreground">Designed with the same craft as the tools that top artists rely on — refined for the way you actually work.</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            { icon: Upload, image: fUpload, title: "Frictionless uploads", body: "Drag-and-drop MP3s, attach artwork, set metadata, and publish in seconds." },
            { icon: Music2, image: fCatalog, title: "Unified catalog", body: "Songs, albums, versions and stems — one clean, searchable library." },
            { icon: BarChart3, image: fAnalytics, title: "Studio-grade analytics", body: "Plays, growth, top tracks and geography with charts you actually want to look at." },
            { icon: Disc3, image: fAlbum, title: "Album management", body: "Sequence tracks, edit release dates, and manage artwork across your catalog." },
            { icon: Radio, image: fProfile, title: "Artist profile", body: "A polished public face for your work — bio, genre, releases and stats." },
            { icon: Sparkles, image: fPremium, title: "Premium experience", body: "A calm, focused UI that gets out of your way and lets your work stand up." },
          ].map((f) => (
            <div key={f.title} className="hover-lift bg-card-gradient rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={f.image} alt={f.title} loading="lazy" width={1024} height={640} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <div className="absolute top-3 left-3 grid h-10 w-10 place-items-center rounded-lg bg-background/70 backdrop-blur border border-border text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider">Workflow</div>
            <h2 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">From idea to release — in four moves.</h2>
            <p className="mt-4 text-muted-foreground">A single, focused flow. No spreadsheets, no scattered tools.</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              { step: "01", image: wUpload, title: "Upload", body: "Drop your master, attach artwork and metadata." },
              { step: "02", image: wOrganize, title: "Organize", body: "Group tracks into albums, sequence, and edit." },
              { step: "03", image: wAnalyze, title: "Analyze", body: "See plays, listeners and geography in real time." },
              { step: "04", image: wGrow, title: "Grow", body: "Share your artist profile and reach new fans." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-border bg-card overflow-hidden hover-lift flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={s.image} alt={s.title} loading="lazy" width={1024} height={640} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute top-3 left-3 rounded-md bg-background/70 backdrop-blur border border-border px-2 py-1 text-[10px] font-bold tracking-widest text-primary">
                    {s.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="creators" className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card-gradient grid md:grid-cols-2">
          <div className="relative p-10 md:p-16 order-2 md:order-1">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative max-w-xl">
              <div className="text-sm font-semibold text-primary uppercase tracking-wider">For creators</div>
              <h2 className="mt-2 text-3xl md:text-5xl font-black tracking-tight">Start uploading tonight.</h2>
              <p className="mt-4 text-muted-foreground">Free to try. No credit card. Import your existing catalog in minutes.</p>
              <Link to="/auth" search={{ mode: "signup" }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] md:min-h-[420px] order-1 md:order-2">
            <img src={creatorsCta} alt="Music producer at a studio mixing console" loading="lazy" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/40 to-transparent md:from-card md:via-transparent md:to-transparent" />
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-gradient shadow-glow ring-1 ring-primary/40">
                  <span className="text-[10px] font-black tracking-wider text-primary-foreground">CBM</span>
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">Now Play</span>
                    <Radio className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">for Creators</div>
                </div>
              </Link>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                Step into a realm where imagination knows no bounds, and creativity is the key to unlocking endless possibilities.
              </p>
              <div className="mt-5 flex items-center gap-2">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/60 transition">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-sm font-bold text-foreground">Information</h4>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">About CBM</a></li>
                <li><a href="#workflow" className="hover:text-foreground transition">How it works</a></li>
                <li><a href="#creators" className="hover:text-foreground transition">For creators</a></li>
              </ul>
            </div>

            {/* Helpful Links */}
            <div>
              <h4 className="text-sm font-bold text-foreground">Helpful Links</h4>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Services</a></li>
                <li><a href="#" className="hover:text-foreground transition">Support 24/7</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms &amp; Conditions</a></li>
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h4 className="text-sm font-bold text-foreground">Our Services</h4>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Music Distribution</a></li>
                <li><a href="#" className="hover:text-foreground transition">Support 24/7</a></li>
                <li><a href="#" className="hover:text-foreground transition">Creator Guide</a></li>
              </ul>
            </div>
          </div>

          {/* Contact strip */}
          <div className="mt-12 grid gap-4 md:grid-cols-3 border-t border-border pt-8 text-sm">
            <a href="tel:+256776789133" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary"><Phone className="h-4 w-4" /></span>
              +256 776 789 133
            </a>
            <a href="mailto:cbmadvertsingads@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary"><Mail className="h-4 w-4" /></span>
              cbmadvertsingads@gmail.com
            </a>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary"><MapPin className="h-4 w-4" /></span>
              National ICT Innovation Hub, Nakawa, Kampala, Uganda
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CBM Advertising · Now Play for Creators. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
