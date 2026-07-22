import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, clearAuthTokens, setAuthTokens } from "./api-client";

type AuthUser = {
  id: string;
  email: string;
};

type AuthSession = {
  user: AuthUser;
};

export type Profile = {
  id: string;
  email?: string;
  stage_name: string;
  biography: string;
  genre: string;
  location: string;
  avatar_url: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, stageName?: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function makeProfile(profile: Partial<Profile> | null | undefined, fallbackId: string, fallbackStageName?: string): Profile | null {
  if (!profile && !fallbackId) return null;
  return {
    id: profile?.id ?? fallbackId,
    email: profile?.email ?? "",
    stage_name: profile?.stage_name ?? fallbackStageName ?? "",
    biography: profile?.biography ?? "",
    genre: profile?.genre ?? "",
    location: profile?.location ?? "",
    avatar_url: profile?.avatar_url ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const profileData = await apiClient.get<Profile>("/api/profile/");
        if (!active) return;
        const nextUser = { id: profileData.id, email: profileData.email ?? "" };
        setUser(nextUser);
        setSession({ user: nextUser });
        setProfile(makeProfile(profileData, nextUser.id, profileData.stage_name) ?? null);
      } catch {
        if (!active) return;
        setUser(null);
        setSession(null);
        setProfile(null);
        clearAuthTokens();
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,

    refreshProfile: async () => {
      try {
        const nextProfile = await apiClient.get<Profile>("/api/profile/");
        const nextUser = user ? { ...user, email: nextProfile.email ?? user.email } : { id: nextProfile.id, email: nextProfile.email ?? "" };
        setUser(nextUser);
        setSession({ user: nextUser });
        setProfile(makeProfile(nextProfile, nextUser.id, nextProfile.stage_name) ?? null);
      } catch {
        setUser(null);
        setSession(null);
        setProfile(null);
        clearAuthTokens();
      }
    },

    signOut: async () => {
      clearAuthTokens();
      setUser(null);
      setSession(null);
      setProfile(null);
    },

    signIn: async (email: string, password: string) => {
      try {
        const authResponse = await apiClient.post<{ access?: string; refresh?: string }>('/api/auth/login/', { email, password });
        if (authResponse.access && authResponse.refresh) {
          setAuthTokens(authResponse.access, authResponse.refresh);
        }
        const nextProfile = await apiClient.get<Profile>("/api/profile/");
        const nextUser = { id: nextProfile.id, email: nextProfile.email ?? email };
        setUser(nextUser);
        setSession({ user: nextUser });
        setProfile(makeProfile(nextProfile, nextUser.id, nextProfile.stage_name) ?? null);
        return { error: null };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Sign in failed" };
      }
    },

    signUp: async (email: string, password: string, stageName?: string) => {
      try {
        const authResponse = await apiClient.post<{ access?: string; refresh?: string }>('/api/auth/register/', { email, password, stage_name: stageName });
        if (authResponse.access && authResponse.refresh) {
          setAuthTokens(authResponse.access, authResponse.refresh);
        }
        const nextProfile = await apiClient.get<Profile>("/api/profile/");
        const nextUser = { id: nextProfile.id, email: nextProfile.email ?? email };
        setUser(nextUser);
        setSession({ user: nextUser });
        setProfile(makeProfile(nextProfile, nextUser.id, nextProfile.stage_name) ?? null);
        return { error: null };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Sign up failed" };
      }
    },
  }), [user, session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
