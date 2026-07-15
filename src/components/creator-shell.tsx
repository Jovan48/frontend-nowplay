import { type ReactNode } from "react";
import { Bell, Search, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { CreatorSidebar } from "./creator-sidebar";
import { MusicPlayer } from "./music-player";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CreatorShell({ children, title }: { children: ReactNode; title?: string }) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (profile?.stage_name || user?.email || "NC").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex">
        <CreatorSidebar />

        <main className="flex-1 min-w-0 pb-32">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-xl">
            <div className="hidden md:flex items-center gap-1 text-muted-foreground">
              <button className="grid h-8 w-8 place-items-center rounded-full bg-elevated hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-elevated hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search songs, albums, analytics…"
                className="h-9 w-full rounded-full border border-transparent bg-elevated pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="relative grid h-9 w-9 place-items-center rounded-full bg-elevated hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-primary-gradient text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{profile?.stage_name || user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/analytics" })}>Analytics</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => { await signOut(); navigate({ to: "/", replace: true }); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="px-4 md:px-8 py-8">
            {title && <h1 className="mb-6 text-3xl font-black tracking-tight">{title}</h1>}
            {children}
          </div>
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}