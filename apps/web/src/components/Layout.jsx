import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Flame, X } from "lucide-react";
import { cn } from "../utils/cn";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  MapWorldBackground,
  MapNavStrip,
  FloatingPanel,
  MapPageTransition,
} from "./map-ui";

import {
  DistrictMenu,
  SearchOverlay,
  NotificationToast,
} from "./world";

import { useWorldUI } from "../context/WorldUIContext";

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(true);

  const isGameRoute = location.pathname === "/game";
  const isDashboardRoute = location.pathname === "/dashboard";
  const isFullscreenGame =
    isGameRoute &&
    new URLSearchParams(location.search).get("mode") === "fullscreen";

  const hideChrome = isFullscreenGame;

  const { user, logout } = useAuth();
  const { setSearchOpen } = useWorldUI();

  useEffect(() => {
    if (!isFullscreenGame) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        navigate("/dashboard");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreenGame, navigate]);

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 180);

  return (
    <MapWorldBackground>
      {/* SIDEBAR */}
      {!hideChrome && (
        <MapNavStrip
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}

      {!hideChrome && <SearchOverlay />}
      {!hideChrome && <NotificationToast />}

      {/* 🔥 TOP NAVBAR (FIXED PROPERLY) */}
      {!hideChrome && (
        <motion.div
          animate={{
            x: sidebarWidth,
            width: `calc(100% - ${sidebarWidth}px)`,
          }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 20,
          }}
          className="fixed top-0 left-0 z-40"
        >
          <FloatingPanel
            className={cn(
              "w-full !left-auto !right-auto",
              isDashboardRoute
                ? "rounded-xl border-2 border-[#6f522b] bg-[#f5e6c2] px-4 py-2.5 shadow-[0_2px_0_#9a7642,0_5px_0_#694a25]"
                : "rounded-lg border-2 border-[#6f522b] bg-[#f5e6c2] px-4 py-3 shadow-[0_2px_0_#9a7642,0_5px_0_#694a25]"
            )}
          >
            <div className="flex w-full flex-wrap items-center gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
              
              {/* LEFT */}
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-[#7d5c31] bg-[#f7e7c4] shadow-[0_2px_0_#9f7842,0_4px_0_#654724]">
                  <Flame className="h-5 w-5 text-[#6b3f13]" />
                </span>

                <div className="min-w-0">
                  <p className="font-pixel truncate text-[0.55rem] uppercase tracking-widest text-[#7a5a2d] md:text-[0.6rem]">
                    FlameRoar
                  </p>
                  <p className="truncate text-sm font-black text-[#344427] md:text-base">
                    Village Hub
                  </p>
                </div>

                <DistrictMenu />
              </div>

              {/* CENTER */}
              <div className="order-3 ml-auto flex gap-2 md:order-0">
                <button
                  onClick={() => navigate("/mentors")}
                  className="hidden sm:block rounded-md border-2 border-[#7d5e33] bg-[#f8ebcf] px-4 py-2 text-xs font-black uppercase text-[#5c6747] shadow-[0_2px_0_#a07b44,0_4px_0_#674925] transition hover:-translate-y-0.5 hover:text-[#32432b]"
                >
                  Mentors
                </button>
              </div>

              {/* RIGHT */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                {user?.username && (
                  <span className="max-w-32 truncate rounded-md border-2 border-[#7e6034] bg-[#f8e7c2] px-3 py-1.5 text-xs font-semibold text-[#4b5a3e] shadow-[0_2px_0_#9f7943,0_4px_0_#694b26] sm:max-w-40">
                    {user.username}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 rounded-md border-2 border-[#7f6034] bg-[#f8e7c2] px-2.5 py-1.5 font-pixel text-[0.52rem] uppercase tracking-widest text-[#714f23] shadow-[0_2px_0_#9f7943,0_4px_0_#694b26]">
                  🪙 {user?.coins ?? 0}
                </span>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#7e3b34] bg-[#d86f64] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#fff0e7] shadow-[0_2px_0_#8e4238,0_4px_0_#5b241f] transition hover:-translate-y-0.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Leave Village</span>
                  <span className="sm:hidden">Leave</span>
                </button>
              </div>
            </div>
          </FloatingPanel>
        </motion.div>
      )}

      {/* FULLSCREEN EXIT */}
      {isFullscreenGame && (
        <button
          onClick={() => navigate("/dashboard")}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-lg border border-white/45 bg-[#102b4fcc] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#e9f3ff] shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition hover:bg-[#163864]"
        >
          <X className="h-4 w-4" />
          Exit
        </button>
      )}

      {/* 🔥 MAIN CONTENT */}
      <motion.main
        animate={{
          x: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
        transition={{
          type: "spring",
          stiffness: 140,
          damping: 20,
        }}
        className={cn(
          "relative z-10 text-map-ink",
          isFullscreenGame
            ? "min-h-dvh"
            : isDashboardRoute
            ? "min-h-dvh px-4 pt-24 pb-24 md:px-8 md:pt-28 md:pb-12"
            : isGameRoute
            ? "min-h-dvh pb-24 pt-17 md:pb-6 md:pt-18"
            : "mx-auto max-w-7xl pb-24 px-4 pt-26 md:pb-12 md:pt-28"
        )}
      >
        {isGameRoute ? (
          children
        ) : (
          <MapPageTransition mode="fadePan">
            {children}
          </MapPageTransition>
        )}
      </motion.main>
    </MapWorldBackground>
  );
};