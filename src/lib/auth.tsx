import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { startAuthAutoRefresh, supabase } from "@/lib/supabase";

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  initializationError: string | null;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
    initializationError: null,
  });

  useEffect(() => {
    let isMounted = true;
    let authStateChanged = false;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      authStateChanged = true;
      setState({ session, isLoading: false, initializationError: null });
    });

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (isMounted && !authStateChanged) {
          setState({
            session: data.session,
            isLoading: false,
            initializationError: null,
          });
        }
      } catch {
        if (isMounted && !authStateChanged) {
          setState({
            session: null,
            isLoading: false,
            initializationError:
              "Nu am putut restabili sesiunea. Conectează-te din nou.",
          });
        }
      }
    }

    void restoreSession();
    const stopAutoRefresh = startAuthAutoRefresh();

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
      stopAutoRefresh?.();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
