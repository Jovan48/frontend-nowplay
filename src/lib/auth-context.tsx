import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * TEMPORARY mock auth context — no Supabase, no persistence.
 * Matches the real auth-context.tsx's core shape (user, session,
 * profile, loading, refreshProfile, signOut) and adds mock signIn /
 * signUp so auth.tsx has something to call instead of Supabase.
 *
 * To restore real Supabase later: put the original file back,
 * and revert auth.tsx's two supabase.auth.* calls (see notes there).
 */

type MockUser = {
  id: string;
  email: string;
};

type MockSession = {
  user: MockUser;
};

export type Profile = {
  id: string;
  stage_name: string;
  biography: string;
  genre: string;
  location: string;
  avatar_url: string;
};

type AuthContextValue = {
  user: MockUser | null;
  session: MockSession | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  // Mock-only additions — the real auth-context.tsx does not have these,
  // because the real auth.tsx calls supabase.auth.* directly instead.
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, stageName?: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Flip to true to skip login entirely while testing dashboard pages.
const START_LOGGED_IN = false;

function makeProfile(id: string, stageName: string): Profile {
  return { id, stage_name: stageName, biography: "", genre: "", location: "", avatar_url: "" };
}

const SEED_USER: MockUser = { id: "mock-user-1", email: "demo@now-play.com" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(START_LOGGED_IN ? SEED_USER : null);
  const [session, setSession] = useState<MockSession | null>(START_LOGGED_IN ? { user: SEED_USER } : null);
  const [profile, setProfile] = useState<Profile | null>(
    START_LOGGED_IN ? makeProfile(SEED_USER.id, "Demo Creator") : null
  );
  const [loading] = useState(false);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,

    refreshProfile: async () => {
      // No backend to refresh from — no-op for now.
    },

    signOut: async () => {
      setUser(null);
      setSession(null);
      setProfile(null);
    },

    signIn: async (email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 400)); // pretend it's async
      const mockUser: MockUser = { id: "mock-user-1", email };
      setUser(mockUser);
      setSession({ user: mockUser });
      setProfile(makeProfile(mockUser.id, email.split("@")[0]));
      return { error: null };
    },

    signUp: async (email: string, _password: string, stageName?: string) => {
      await new Promise((r) => setTimeout(r, 400));
      const mockUser: MockUser = { id: "mock-user-1", email };
      setUser(mockUser);
      setSession({ user: mockUser });
      setProfile(makeProfile(mockUser.id, stageName || email.split("@")[0]));
      return { error: null };
    },
  }), [user, session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
