import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Gamepad2, User, Trophy, Map } from "lucide-react";
import { cn } from "../../utils/cn";

const zones = [
  { name: "Hub", path: "/dashboard", icon: Home },
  { name: "Battle Arena", path: "/game", icon: Gamepad2 },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
];

function ZoneLink({ item, collapsed }) {
  const location = useLocation();
  const active = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <li className="flex flex-col items-center">
      <Link
        to={item.path}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg py-2 px-2 transition-all duration-200",
          active
            ? "border border-[#7d5b2f] bg-[#f3e2bb] shadow-[0_2px_0_#9f7742,0_4px_0_#664724]"
            : "hover:bg-[#f0dfb8]/65"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md border-2",
            active
              ? "border-[#795a2e] bg-[#f7e6c0]"
              : "border-[#8a7249]/45 bg-[#f8eacc]/70"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm text-[#5a4726]"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </li>
  );
}

export function MapNavStrip({ collapsed, setCollapsed }) {
  return (
    <motion.nav
      animate={{ width: collapsed ? 72 : 180 }}
      transition={{ duration: 0.25 }}
      className="fixed top-0 left-0 z-40 hidden h-screen flex-col border-r-2 border-[#6b4f29] bg-[#f0dfb8]/95 py-6 shadow-[2px_0_0_#9e7944] md:flex"
    >
      {/* TOGGLE */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-[#7a5d30] bg-[#f7e7c3] shadow-[0_2px_0_#a07842,0_4px_0_#664725] transition hover:scale-105"
        >
          <Map className="h-5 w-5 text-[#6f4d22]" />
        </button>
      </div>

      <ul className="flex flex-col gap-3 px-2">
        {zones.map((item) => (
          <ZoneLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </ul>
    </motion.nav>
  );
}