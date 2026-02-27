import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, Rocket, FolderOpen, Calendar, User, Sun, Moon, LogOut, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/event", icon: Calendar, label: "Event" },
  { to: "/people", icon: Users, label: "People" },
  { to: "/teams", icon: Rocket, label: "Teams" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
  { to: "/profile", icon: User, label: "Profile" },
];

const mobileNavItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/event", icon: Calendar, label: "Event" },
  { to: "/people", icon: Users, label: "People" },
  { to: "/teams", icon: Rocket, label: "Teams" },
  { to: "/profile", icon: User, label: "Profile" },
];

const Layout = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const sidebarW = sidebarOpen ? "md:w-56 lg:w-64" : "md:w-16";
  const contentMl = sidebarOpen ? "md:ml-56 lg:ml-64" : "md:ml-16";

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex md:flex-col ${sidebarW} md:fixed md:inset-y-0 md:left-0 md:z-40 border-r border-border/30 bg-background/80 backdrop-blur-xl transition-all duration-300`}>
        {/* Header */}
        <div className={`flex items-center ${sidebarOpen ? "justify-between px-4" : "justify-center"} h-14 border-b border-border/30`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Rocket className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="font-bold text-xs truncate"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AYV
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all shrink-0"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {sidebarItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) =>
                `flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 1.5} />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-2 pb-3 space-y-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={!sidebarOpen ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
            className={`flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all w-full`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                {sidebarOpen && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-primary shrink-0" />
                {sidebarOpen && <span>Dark Mode</span>}
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Log Out" : undefined}
            className={`flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="md:hidden fixed top-4 right-4 z-50 w-9 h-9 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-primary" />
        )}
      </button>

      {/* Main content */}
      <div className={`flex-1 pb-20 md:pb-0 ${contentMl} transition-all duration-300`}>
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/90 backdrop-blur-xl" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative ${isActive ? "drop-shadow-[0_0_8px_hsl(263_84%_58%/0.5)]" : ""}`}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
