import React from "react";
import { Flame, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapWorldBackground, MapButton } from "../components/map-ui";
import PixelHeroSection from "../components/landing/PixelHeroSection";
import {
  SectionWrapper,
  MapPreviewStrip,
  FeatureTile,
  StepPath,
  FloatingStatCard,
  CTAHub,
  MinimalFooter,
} from "../components/landing";

const navItems = [
  { label: "HOME", href: "#" },
  { label: "WORLD", href: "#world" },
  { label: "FEATURES", href: "#features" },
  { label: "FAQ", href: "#trust" },
];

const capabilities = [
  {
    title: "Discover Quests",
    text: "Explore quests across regions and pick the challenge that matches your next skill level.",
    type: "stall",
  },
  {
    title: "Join Guilds",
    text: "Join guilds and collaborate with fellow learners to solve missions faster and smarter.",
    type: "building",
  },
  {
    title: "Track Your Journey",
    text: "Watch your XP grow as each completed challenge unlocks new paths in your learning world.",
    type: "home",
  },
];

export default function LandingPitch() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <MapWorldBackground className="min-h-screen overflow-x-hidden font-sans text-map-ink">

      <header className="sticky top-0 z-50 border-b-2 border-[#0b2f72] bg-[#123d8f]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 text-xl font-black tracking-wider text-[#ffd966]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-[#8f5f17] bg-[#e1a929] shadow-[inset_0_1px_0_rgba(255,236,164,0.75)]">
              <Flame className="h-5 w-5 text-[#6b3f13]" />
            </span>
            FlameRoar
          </motion.a>

          <nav className="hidden items-center gap-6 md:flex lg:gap-9">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                className="text-sm font-extrabold tracking-wider text-white/90 transition duration-200 hover:scale-105 hover:text-[#ffe07a]"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden md:inline-block"
            >
              <MapButton to="/auth" className="px-5 py-2 text-xs">
                Start the Game
              </MapButton>
            </motion.div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-[#8f5f17]/50 bg-[#e1a929]/20 text-white/90 transition hover:bg-[#e1a929]/40 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-[#0b2f72]/50 md:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-extrabold tracking-wider text-white/90 transition hover:bg-white/10 hover:text-[#ffe07a]"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <MapButton to="/auth" className="w-full px-5 py-2.5 text-xs text-center">
                    Start the Game
                  </MapButton>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main>

        <PixelHeroSection />

        <div id="world" className="scroll-mt-24">
          <MapPreviewStrip />
        </div>

        <SectionWrapper
          id="features"
          eyebrow="WHAT YOU CAN DO"
          title="Explore your world, not another dashboard"
          description="Choose your path through quests, guilds, and progression systems designed like a living game world."
          className="section scroll-mt-24 py-20 md:py-28"
          contentClassName="relative"
          headerAdornment={(
            <span className="inline-flex items-center gap-2 rounded-md border border-[#846026]/35 bg-[#fff0c4]/80 px-2.5 py-1">
              <span
                className="relative inline-block h-3 w-3 bg-[#f9c63d]"
                style={{
                  boxShadow:
                    "3px 0 0 #f9c63d,0 3px 0 #f9c63d,3px 3px 0 #f9c63d,6px 3px 0 #9d6a1b,3px 6px 0 #9d6a1b",
                }}
                aria-hidden
              />
              <span className="text-[11px] font-bold tracking-[0.16em] text-[#805d2d]">FEATURES</span>
            </span>
          )}
          eyebrowClassName="text-[#6f7a3c]"
          titleClassName="max-w-4xl font-sans text-3xl font-black text-[#304026] md:text-[2.5rem]"
          descriptionClassName="max-w-3xl text-[#5b694d]"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl border border-[#6b6f3f]/15 bg-[#e6f2c9]" />
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl bg-[radial-gradient(circle_at_1px_1px,rgba(72,88,45,0.12)_1px,transparent_0)] bg-size-[7px_7px] opacity-35" />
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl bg-linear-to-b from-transparent via-transparent to-[#f3e6bd]/65" />
          <div className="pointer-events-none absolute left-6 top-5 h-4 w-4 bg-[#81b653] shadow-[4px_0_0_#81b653,0_4px_0_#81b653,4px_4px_0_#67903f]" />
          <div className="pointer-events-none absolute right-16 top-8 h-3 w-3 bg-[#8ca56a] shadow-[3px_0_0_#8ca56a,0_3px_0_#8ca56a,3px_3px_0_#6c7d52]" />
          <div className="pointer-events-none absolute bottom-8 left-20 h-3 w-3 bg-[#9ca879] shadow-[3px_0_0_#9ca879,0_3px_0_#9ca879,3px_3px_0_#7a805d]" />
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {capabilities.map((c, i) => (
              <FeatureTile key={c.title} {...c} delay={i * 0.08} />
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper
          id="how-it-works"
          eyebrow="TRAVEL LOG"
          title="How the journey unfolds"
          titleAccent="across the realm"
          description="A simple path: enter, explore, and grow your skill tree one quest at a time."
          className="section scroll-mt-24 py-16 md:py-24"
          contentClassName="relative"
          eyebrowClassName="font-pixel text-[0.56rem] tracking-[0.14em] text-[#6f7a3c]"
          titleClassName="max-w-4xl font-sans text-3xl font-black text-[#304026] md:text-[2.5rem]"
          descriptionClassName="max-w-3xl text-[#5b694d]"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl border border-[#6b6f3f]/15 bg-[#e6f2c9]" />
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl bg-[radial-gradient(circle_at_1px_1px,rgba(72,88,45,0.12)_1px,transparent_0)] bg-size-[7px_7px] opacity-35" />
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl bg-linear-to-b from-transparent via-transparent to-[#f3e6bd]/65" />
          <img
            src="/assets/tilemap.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[78%] w-[56%] rounded-br-4xl rounded-tl-3xl border-l-2 border-t-2 border-[#6a7f44]/35 object-cover object-[64%_56%] opacity-25 [image-rendering:pixelated]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-9 rounded-b-4xl border-t border-[#54793b]/30 bg-[radial-gradient(circle_at_1px_1px,rgba(73,118,49,0.3)_1px,transparent_0)] bg-size-[7px_7px]" />
          <span className="pointer-events-none absolute left-[14%] top-[34%] h-1.5 w-1.5 rounded-full bg-[#fff2a3]/70 blur-[0.4px]" />
          <span className="pointer-events-none absolute left-[22%] top-[46%] h-1 w-1 rounded-full bg-[#f9f2b8]/60 blur-[0.4px]" />
          <span className="pointer-events-none absolute right-[18%] top-[39%] h-1.5 w-1.5 rounded-full bg-[#fff2a3]/65 blur-[0.4px]" />
          <div className="relative px-4 py-4 md:px-6 md:py-6">
            <StepPath />
          </div>
        </SectionWrapper>

        <SectionWrapper
          id="trust"
          eyebrow="WORLD ACTIVITY"
          title="Guild Stats"
          description="Adventurers exploring the world"
          className="section scroll-mt-24 py-16 md:py-20"
          contentClassName="relative"
          headerAdornment={(
            <span className="inline-flex items-center gap-2 rounded-md border border-[#846026]/35 bg-[#fff0c4]/80 px-2.5 py-1">
              <span
                className="relative inline-block h-3 w-3 bg-[#f9c63d]"
                style={{
                  boxShadow:
                    "3px 0 0 #f9c63d,0 3px 0 #f9c63d,3px 3px 0 #f9c63d,6px 3px 0 #9d6a1b,3px 6px 0 #9d6a1b",
                }}
                aria-hidden
              />
              <span className="font-pixel text-[0.53rem] uppercase tracking-[0.12em] text-[#805d2d]">GUILD BOARD</span>
            </span>
          )}
          eyebrowClassName="font-pixel text-[0.56rem] tracking-[0.14em] text-[#6f7a3c]"
          titleClassName="max-w-4xl font-sans text-3xl font-black text-[#304026] md:text-[2.5rem]"
          descriptionClassName="max-w-3xl text-[#5b694d]"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl border border-[#6b6f3f]/15 bg-[#deedbc]" />
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-4xl bg-[radial-gradient(circle_at_1px_1px,rgba(71,95,43,0.13)_1px,transparent_0)] bg-size-[7px_7px] opacity-45" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-10 rounded-b-4xl border-t border-[#5f7f3f]/30 bg-[repeating-linear-gradient(90deg,#7aa652_0_8px,#70984b_8px_16px)]" />
          <span className="pointer-events-none absolute left-[9%] top-[64%] h-1.5 w-1.5 rounded-full bg-[#fff3a8]/70 blur-[0.4px]" />
          <span className="pointer-events-none absolute left-[28%] top-[56%] h-1 w-1 rounded-full bg-[#ffe78a]/70 blur-[0.3px]" />
          <span className="pointer-events-none absolute right-[15%] top-[60%] h-1.5 w-1.5 rounded-full bg-[#fff3a8]/70 blur-[0.4px]" />

          <img
            src="/assets/pikachu.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-9 left-4 z-10 h-14 w-14 opacity-95 [image-rendering:pixelated] md:h-16 md:w-16"
          />
          <span className="pointer-events-none absolute bottom-16 left-[36%] h-2 w-2 bg-[#d0a457] shadow-[2px_0_0_#d0a457,0_2px_0_#d0a457,2px_2px_0_#8a6327]" />
          <span className="pointer-events-none absolute bottom-12 left-[56%] h-2.5 w-2.5 bg-[#74a551] shadow-[3px_0_0_#74a551,0_3px_0_#74a551,3px_3px_0_#4f7337]" />
          <span className="pointer-events-none absolute bottom-11 right-[26%] h-2 w-3 bg-[#8c8f76] shadow-[3px_0_0_#8c8f76,0_2px_0_#8c8f76,3px_2px_0_#5e6250]" />

          <div className="grid gap-5 px-4 py-5 sm:grid-cols-3 md:px-6 md:py-7">
            <div className="sm:translate-y-1">
              <FloatingStatCard label="Adventurers" value={12} suffix="k+" sub="Currently exploring the world" />
            </div>
            <div className="sm:-translate-y-1">
              <FloatingStatCard label="Guilds" value={48} suffix="+" sub="Active learning communities" />
            </div>
            <div className="sm:translate-y-2">
              <FloatingStatCard label="Player Satisfaction" value={98} suffix="%" sub="Positive feedback from players" />
            </div>
          </div>
        </SectionWrapper>

        <section id="journey" className="section scroll-mt-24 px-6 py-20 md:px-10 md:py-28">
          <div className="relative mx-auto max-w-5xl">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl border-2 border-[#6f522b] bg-[#f5e6c2] shadow-[0_3px_0_#9a7642,0_7px_0_#694a25,0_11px_0_rgba(58,40,20,0.25)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2 rounded-t-xl bg-[#fff4d8]" />
            <div className="px-4 py-4 md:px-6 md:py-6">
              <CTAHub />
            </div>
          </div>
        </section>
      </main>

      <MinimalFooter />
    </MapWorldBackground>
  );
}
