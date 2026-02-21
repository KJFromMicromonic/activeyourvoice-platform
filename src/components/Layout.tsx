import { NavLink, Outlet } from "react-router-dom";
import { Home, Users, Rocket, Calendar, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/people", icon: Users, label: "People" },
  { to: "/teams", icon: Rocket, label: "Teams" },
  { to: "/event", icon: Calendar, label: "Event" },
  { to: "/profile", icon: User, label: "Profile" },
];

const Layout = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5" style={{ background: "rgba(10, 10, 15, 0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
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
