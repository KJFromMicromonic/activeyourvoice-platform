import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import People from "./pages/People";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Event from "./pages/Event";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Organizer from "./pages/Organizer";
import Projects from "./pages/Projects";
import Judge from "./pages/Judge";

const queryClient = new QueryClient();

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setOnboarded(undefined); return; }
    // Trust the onboarded flag from onboarding flow to avoid race conditions
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarded") === "1") {
      setOnboarded(true);
      // Clean up the URL param
      params.delete("onboarded");
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => {
        setOnboarded(data?.onboarding_completed ?? false);
      });
  }, [session]);

  if (session === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (!session) return <Navigate to="/auth" replace />;
  if (onboarded === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (!onboarded && window.location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

const RoleGuard = ({ role, children }: { role: "is_organizer" | "is_judge"; children: React.ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAllowed(false); return; }
      const { data } = await supabase.from("profiles").select(role).eq("user_id", user.id).single();
      setAllowed(data?.[role] === true);
    };
    check();
  }, [role]);

  if (allowed === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<AuthGuard><Layout /></AuthGuard>}>
            <Route path="/" element={<Index />} />
            <Route path="/people" element={<People />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<TeamDetail />} />
            <Route path="/event" element={<Event />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/organizer" element={<RoleGuard role="is_organizer"><Organizer /></RoleGuard>} />
            <Route path="/judge" element={<RoleGuard role="is_judge"><Judge /></RoleGuard>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
