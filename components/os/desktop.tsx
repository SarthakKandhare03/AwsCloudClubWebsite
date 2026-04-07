"use client"

import { useState, useCallback, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal, UserCircle, ShieldCheck
} from "lucide-react"
import Image from "next/image"
import { Window } from "./window"
import { Taskbar } from "./taskbar"
import { DesktopIcon } from "./desktop-icon"
import { WeatherWidget } from "./weather-widget"
import { CalendarWidget } from "./calendar-widget"
import { StartMenu } from "./start-menu"
import { HomeApp } from "../apps/home-app"
import { AboutApp } from "../apps/about-app"
import { TeamApp } from "../apps/team-app"
import { EventsApp } from "../apps/events-app"
import { ProjectsApp } from "../apps/projects-app"
import { ResourcesApp } from "../apps/resources-app"
import { SocialApp } from "../apps/social-app"
import { ContactApp } from "../apps/contact-app"
import { AchievementsApp } from "../apps/achievements-app"
import { TerminalApp } from "../apps/terminal-app"
import { ProfileApp } from "../apps/profile-app"
import { AdminApp } from "../apps/admin-app"
import { getAccessToken, parseJwtPayload, signOut } from "@/lib/auth-client"
import { MeetupProvider } from "@/lib/meetup-context"

type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin"

interface WindowState {
  id: AppId
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

const desktopApps: { id: AppId; label: string; icon: React.ReactNode; gradient: string }[] = [
  { id: "home", label: "Home", icon: <Home className="h-6 w-6" />, gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
  { id: "about", label: "About Us", icon: <Cloud className="h-6 w-6" />, gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
  { id: "team", label: "Team", icon: <Users className="h-6 w-6" />, gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
  { id: "events", label: "Events", icon: <Calendar className="h-6 w-6" />, gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
  { id: "projects", label: "Projects", icon: <FolderOpen className="h-6 w-6" />, gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
  { id: "resources", label: "Resources", icon: <BookOpen className="h-6 w-6" />, gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
  { id: "social", label: "Social", icon: <Share2 className="h-6 w-6" />, gradient: "linear-gradient(135deg,#E85580,#C83565)" },
  { id: "contact", label: "Contact", icon: <Mail className="h-6 w-6" />, gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  { id: "achievements", label: "Achievements", icon: <Trophy className="h-6 w-6" />, gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "terminal", label: "Terminal", icon: <Terminal className="h-6 w-6" />, gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
]

const appTitles: Record<AppId, string> = {
  home: "Introduction", about: "About Us", team: "Team",
  events: "Events", projects: "Projects", resources: "Resources",
  social: "Social Media", contact: "Contact Us",
  achievements: "Achievements", terminal: "Terminal", profile: "My Profile",
  admin: "Admin Panel",
}

const appIcons: Record<AppId, React.ReactNode> = {
  home: <Home className="h-4 w-4" />, about: <Cloud className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />, events: <Calendar className="h-4 w-4" />,
  projects: <FolderOpen className="h-4 w-4" />, resources: <BookOpen className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />, contact: <Mail className="h-4 w-4" />,
  achievements: <Trophy className="h-4 w-4" />, terminal: <Terminal className="h-4 w-4" />,
  profile: <UserCircle className="h-4 w-4" />, admin: <ShieldCheck className="h-4 w-4" />,
}

// AWS inspirational quotes that cycle randomly
const AWS_QUOTES = [
  { text: "The cloud is not a place, it's a way of doing IT.", author: "— AWS" },
  { text: "Build the future, one microservice at a time.", author: "— Cloud Club NMIET" },
  { text: "Failures are the stepping stone to a resilient architecture.", author: "— AWS Well-Architected" },
  { text: "Scale infinitely. Pay only for what you use.", author: "— AWS Philosophy" },
  { text: "From idea to cloud in minutes, not months.", author: "— Cloud Native" },
  { text: "Security is not a feature, it's a foundation.", author: "— AWS Security Pillar" },
  { text: "Every great cloud journey starts with a single EC2 instance.", author: "— Cloud Club NMIET" },
  { text: "Think big, start small, scale fast.", author: "— Amazon Leadership Principle" },
  { text: "DevOps is not a tool, it's a culture of collaboration.", author: "— AWS DevOps" },
  { text: "The best architecture is the one that evolves with your needs.", author: "— AWS Well-Architected" },
]

// Fixed positions for background particles — increased opacity for more visible depth
const bgFloaters = [
  { w: 280, h: 280, left: "3%", top: "6%", dur: 7, delay: 0, color: "rgba(107,79,232,0.28)" },
  { w: 200, h: 200, left: "86%", top: "4%", dur: 5.5, delay: 1.2, color: "rgba(91,63,216,0.22)" },
  { w: 320, h: 320, left: "72%", top: "52%", dur: 8, delay: 0.5, color: "rgba(184,164,255,0.20)" },
  { w: 150, h: 150, left: "16%", top: "70%", dur: 4.5, delay: 0.8, color: "rgba(107,79,232,0.26)" },
  { w: 220, h: 220, left: "52%", top: "12%", dur: 6, delay: 0.3, color: "rgba(255,153,0,0.14)" },
  { w: 170, h: 170, left: "90%", top: "32%", dur: 6.5, delay: 1.5, color: "rgba(107,79,232,0.22)" },
  { w: 250, h: 250, left: "36%", top: "76%", dur: 5.5, delay: 0.7, color: "rgba(91,63,216,0.20)" },
  { w: 140, h: 140, left: "1%", top: "42%", dur: 4, delay: 1.0, color: "rgba(80,200,138,0.16)" },
]

const bgSparkles = [
  { top: "6%", left: "20%", delay: 0, size: 14, dur: 3, color: "rgba(107,79,232,0.7)" },
  { top: "13%", left: "66%", delay: 0.6, size: 10, dur: 2.5, color: "rgba(255,153,0,0.8)" },
  { top: "26%", left: "86%", delay: 1.2, size: 16, dur: 3.5, color: "rgba(184,164,255,0.7)" },
  { top: "40%", left: "4%", delay: 0.4, size: 11, dur: 2.8, color: "rgba(107,79,232,0.6)" },
  { top: "56%", left: "76%", delay: 1.8, size: 18, dur: 4, color: "rgba(91,63,216,0.7)" },
  { top: "68%", left: "40%", delay: 0.9, size: 10, dur: 3.2, color: "rgba(255,153,0,0.65)" },
  { top: "80%", left: "12%", delay: 0.2, size: 12, dur: 2.6, color: "rgba(107,79,232,0.65)" },
  { top: "86%", left: "83%", delay: 1.4, size: 15, dur: 3.8, color: "rgba(80,200,138,0.7)" },
  { top: "20%", left: "34%", delay: 0.7, size: 8, dur: 2.4, color: "rgba(232,85,128,0.65)" },
  { top: "63%", left: "58%", delay: 1.1, size: 17, dur: 3.6, color: "rgba(107,79,232,0.7)" },
  { top: "48%", left: "92%", delay: 0.5, size: 9, dur: 2.9, color: "rgba(255,153,0,0.7)" },
  { top: "33%", left: "50%", delay: 1.6, size: 11, dur: 3.1, color: "rgba(184,164,255,0.6)" },
]

const bgDots = [
  { left: "10%", top: "18%", dur: 4, delay: 0, size: 9, color: "#6B4FE8" },
  { left: "76%", top: "10%", dur: 5, delay: 0.7, size: 8, color: "#FF9900" },
  { left: "43%", top: "66%", dur: 3.5, delay: 1.2, size: 10, color: "#B8A4FF" },
  { left: "86%", top: "43%", dur: 6, delay: 0.3, size: 8, color: "#6B4FE8" },
  { left: "20%", top: "83%", dur: 4.5, delay: 0.9, size: 9, color: "#50C88A" },
  { left: "58%", top: "36%", dur: 5.5, delay: 1.5, size: 7, color: "#5BA8D8" },
  { left: "4%", top: "58%", dur: 3.8, delay: 0.4, size: 8, color: "#6B4FE8" },
  { left: "68%", top: "76%", dur: 4.8, delay: 1.1, size: 8, color: "#FF9900" },
  { left: "33%", top: "46%", dur: 5.2, delay: 0.6, size: 7, color: "#B8A4FF" },
  { left: "88%", top: "66%", dur: 4.2, delay: 1.8, size: 10, color: "#E85580" },
  { left: "48%", top: "90%", dur: 3.6, delay: 0.2, size: 8, color: "#6B4FE8" },
  { left: "14%", top: "48%", dur: 5.8, delay: 1.3, size: 7, color: "#FF9900" },
]

// Professional top-center quote ticker
function QuoteTicker() {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setQuoteIdx(i => (i + 1) % AWS_QUOTES.length); setVisible(true) }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const q = AWS_QUOTES[quoteIdx]

  return (
    <motion.div
      className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none"
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      style={{ maxWidth: 500 }}
    >
      {/* Thin top rule */}
      <div className="flex items-center gap-3 mb-2 justify-center">
        <div style={{ width: 32, height: 1, background: "rgba(30,16,96,0.25)" }} />
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "rgba(30,16,96,0.4)", fontFamily: "Georgia, serif", letterSpacing: "0.18em" }}>
          quote of the moment
        </span>
        <div style={{ width: 32, height: 1, background: "rgba(30,16,96,0.25)" }} />
      </div>

      <motion.p
        key={quoteIdx}
        style={{
          color: "#1E1060",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "0.9rem",
          fontStyle: "italic",
          fontWeight: 400,
          lineHeight: 1.55,
          letterSpacing: "0.01em",
        }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -5 }}
        transition={{ duration: 0.4 }}
      >
        "{q.text}"
      </motion.p>

      <motion.p
        key={`a-${quoteIdx}`}
        className="mt-1.5 text-xs tracking-wider"
        style={{
          color: "rgba(107,79,232,0.75)",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {q.author}
      </motion.p>
    </motion.div>
  )
}

export function Desktop({ onLogout }: { onLogout: () => void }) {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "home", isMinimized: false, isMaximized: false, zIndex: 10 },
  ])
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(11)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      const payload = parseJwtPayload(token)
      const groups = (payload["cognito:groups"] as string[]) || []
      setIsAdmin(groups.includes("admins"))
    }
  }, [])

  const appContent: Record<AppId, React.ReactNode> = {
    home: <HomeApp onLearnMore={() => openApp("about")} />, about: <AboutApp />, team: <TeamApp />,
    events: <EventsApp />, projects: <ProjectsApp />, resources: <ResourcesApp />,
    social: <SocialApp />, contact: <ContactApp />,
    achievements: <AchievementsApp />, terminal: <TerminalApp />,
    profile: <ProfileApp onLogout={onLogout} />,
    admin: <AdminApp />,
  }

  const openApp = useCallback((appId: AppId) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === appId)
      if (existing) {
        if (existing.isMinimized) {
          return prev.map((w) =>
            w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
          )
        }
        setHighestZIndex((z) => z + 1)
        return prev.map((w) =>
          w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w
        )
      }
      setHighestZIndex((z) => z + 1)
      return [...prev, { id: appId, isMinimized: false, isMaximized: false, zIndex: highestZIndex + 1 }]
    })
  }, [highestZIndex])

  const closeApp = useCallback((id: AppId) => setWindows((p) => p.filter((w) => w.id !== id)), [])
  const minimizeApp = useCallback((id: AppId) => setWindows((p) => p.map((w) => w.id === id ? { ...w, isMinimized: true } : w)), [])
  const maximizeApp = useCallback((id: AppId) => setWindows((p) => p.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)), [])

  const focusApp = useCallback((id: AppId) => {
    setHighestZIndex((z) => z + 1)
    setWindows((p) => p.map((w) => w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w))
  }, [highestZIndex])

  const getActiveApp = () => {
    const visible = windows.filter((w) => !w.isMinimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
  }

  const getInitialPosition = (appId: AppId) => {
    const index = desktopApps.findIndex((a) => a.id === appId)
    const i = index < 0 ? 0 : index
    return { x: 200 + (i % 4) * 40, y: 60 + (i % 5) * 24 }
  }

  const introIsMaximized = !!windows.find((w) => w.id === "home" && w.isMaximized && !w.isMinimized)

  return (
    <MeetupProvider>
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #EDE8FF 0%, #E8E3FF 30%, #EAE6FF 60%, #E5E0FF 100%)"
      }}
    >
      {/* ══════════════════════════════════════════
          LIVE WALLPAPER LAYER
          ══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Subtle animated dot grid */}
        <svg className="absolute inset-0 h-full w-full opacity-20">
          <defs>
            <pattern id="dot" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="18" cy="18" r="1" fill="#9B8FD8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot)" />
        </svg>

        {/* Large ambient gradient orbs — more vibrant */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(107,79,232,0.18) 0%, transparent 60%)" }} />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(91,63,216,0.16) 0%, transparent 60%)" }} />
        <div className="absolute top-1/2 -translate-y-1/2 -right-32 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(184,164,255,0.14) 0%, transparent 60%)" }} />
        <div className="absolute bottom-24 left-1/3 h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,153,0,0.08) 0%, transparent 60%)" }} />
        <div className="absolute top-20 right-1/3 h-48 w-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(80,200,138,0.07) 0%, transparent 60%)" }} />

        {/* Floating colored blobs */}
        {bgFloaters.map((f, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: f.w, height: f.h, left: f.left, top: f.top,
              background: `radial-gradient(circle, ${f.color} 0%, transparent 70%)`,
            }}
            animate={{ y: [0, -24, 0], scale: [1, 1.10, 1] }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Colored sparkle stars */}
        {bgSparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: s.top, left: s.left }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
                fill={s.color}
              />
            </svg>
          </motion.div>
        ))}

        {/* Colored floating dots — bright and visible */}
        {bgDots.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: d.left, top: d.top,
              width: d.size, height: d.size,
              background: d.color,
              boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.6, 1, 0.6], scale: [1, 1.4, 1] }}
            transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* ── CENTER LOGO — vibrant, colorful, glowing ── */}
        {!introIsMaximized && (
          <div className="absolute inset-0 flex items-center justify-center">

            {/* Colorful multi-layer glow halo */}
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: 380, height: 380,
                background: "radial-gradient(circle, rgba(107,79,232,0.28) 0%, rgba(91,63,216,0.14) 40%, transparent 70%)",
              }}
            />
            <div
              className="absolute rounded-full blur-2xl"
              style={{
                width: 280, height: 280,
                background: "radial-gradient(circle, rgba(255,153,0,0.12) 0%, transparent 70%)",
              }}
            />

            {/* Pulse rings — vivid and visible */}
            {[320, 430, 555].map((r, i) => (
              <motion.div
                key={r}
                className="absolute rounded-full"
                style={{
                  width: r, height: r,
                  border: `${i === 0 ? 2.5 : 2}px solid rgba(107,79,232,${0.38 - i * 0.10})`,
                  boxShadow: i === 0 ? "0 0 24px rgba(107,79,232,0.18), inset 0 0 12px rgba(107,79,232,0.08)" : "none",
                }}
                animate={{ scale: [1, 1.14, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 4 + i * 1.8, delay: i * 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {/* Orange accent ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: 490, height: 490, border: "1px solid rgba(255,153,0,0.12)" }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.15, 0.6] }}
              transition={{ duration: 7, delay: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Slow rotating dashed ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: 370, height: 370, border: "1.5px dashed rgba(107,79,232,0.18)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            {/* Counter-rotating ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: 440, height: 440, border: "1px dashed rgba(255,153,0,0.12)" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            />

            {/* Orbiting colored accent dots */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const r = 195
              const colors = ["#6B4FE8", "#FF9900", "#B8A4FF", "#50C88A", "#E85580", "#5BA8D8"]
              return (
                <motion.div
                  key={angle}
                  className="absolute rounded-full"
                  style={{
                    width: 8, height: 8,
                    background: colors[i],
                    x: Math.cos(rad) * r,
                    y: Math.sin(rad) * r,
                    boxShadow: `0 0 8px ${colors[i]}`,
                  }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, delay: i * 0.42, repeat: Infinity, ease: "easeInOut" }}
                />
              )
            })}

            {/* The LOGO — bright, vivid, not faded */}
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -16, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Colorful glow halo directly behind logo */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(107,79,232,0.45) 0%, rgba(91,63,216,0.22) 40%, transparent 70%)",
                  margin: "-40px",
                  filter: "blur(20px)",
                }}
              />
              {/* Orange accent glow */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "radial-gradient(circle at 70% 30%, rgba(255,153,0,0.18) 0%, transparent 60%)",
                  margin: "-20px",
                  filter: "blur(12px)",
                }}
              />
              <div
                style={{
                  opacity: 0.92,
                  filter: "saturate(1.4) brightness(1.05) drop-shadow(0 0 20px rgba(107,79,232,0.5))",
                }}
              >
                <Image
                  src="/logo-full.png"
                  alt="AWS Cloud Club NMIET"
                  width={280}
                  height={280}
                  className="rounded-3xl select-none"
                  draggable={false}
                  priority
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── AWS Quotes Ticker (bottom center, above taskbar) ── */}
      {!introIsMaximized && <QuoteTicker />}

      {/* ── Desktop Icons — 2-col, above taskbar ── */}
      <div
        className="absolute left-4 top-4 grid grid-cols-2 gap-2 z-10 hide-scrollbar"
        style={{ paddingBottom: "72px", maxHeight: "calc(100vh - 20px)", overflowY: "auto" }}
      >
        {desktopApps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: "spring" as const, stiffness: 260, damping: 22 }}
          >
            <DesktopIcon
              icon={app.icon}
              label={app.label}
              gradient={app.gradient}
              onClick={() => openApp(app.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Right sidebar widgets ── */}
      {!introIsMaximized && (
        <div className="absolute right-4 top-4 hidden w-64 lg:flex flex-col gap-3 z-10">
          {/* Status card */}
          <motion.div className="neu-raised rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" as const, stiffness: 260 }}>
            <div className="px-4 py-3"
              style={{ background: "linear-gradient(135deg,rgba(107,79,232,0.10),rgba(255,153,0,0.05))" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 6px #4ade80" }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: "#6B4FE8" }}>SYSTEM: ONLINE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg,#5B3FE0,#6B4FE8)", boxShadow: "0 4px 10px rgba(107,79,232,0.35)" }}>
                  <Image src="/logo-full.png" alt="Logo" width={22} height={22} className="rounded-lg object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "#1E1060" }}>Cloud OS</h3>
                  <p className="text-xs" style={{ color: "#6B4FE8" }}>AWS Cloud Club NMIET</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2">
              <p className="text-xs" style={{ color: "#7B6FC0" }}>Click icons to open apps. Drag windows to move them.</p>
            </div>
          </motion.div>

          {/* Weather widget */}
          <WeatherWidget />

          {/* Calendar widget */}
          <CalendarWidget />
        </div>
      )}


      {/* ── Windows ── */}
      <AnimatePresence>
        {windows.map((win) => (
          <Window
            key={win.id}
            id={win.id}
            title={appTitles[win.id]}
            icon={appIcons[win.id]}
            isActive={getActiveApp() === win.id}
            isMinimized={win.isMinimized}
            isMaximized={win.isMaximized}
            initialPosition={getInitialPosition(win.id)}
            initialSize={
              win.id === "terminal" ? { width: 640, height: 440 } :
                win.id === "profile" ? { width: 520, height: 640 } :
                  { width: 840, height: 620 }
            }
            onClose={() => closeApp(win.id)}
            onMinimize={() => minimizeApp(win.id)}
            onMaximize={() => maximizeApp(win.id)}
            onFocus={() => focusApp(win.id)}
            zIndex={win.zIndex}
          >
            {appContent[win.id]}
          </Window>
        ))}
      </AnimatePresence>

      {/* ── Start Menu ── */}
      <AnimatePresence>
        {showStartMenu && (
          <StartMenu
            onAppClick={(id) => { openApp(id as AppId); setShowStartMenu(false) }}
            onClose={() => setShowStartMenu(false)}
            onShutdown={() => { signOut(); onLogout() }}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>

      {/* ── Taskbar ── */}
      <Taskbar
        openApps={windows.map((w) => w.id)}
        activeApp={getActiveApp()}
        onAppClick={openApp}
        onStartClick={() => setShowStartMenu((v) => !v)}
      />
    </div>
    </MeetupProvider>
  )
}
