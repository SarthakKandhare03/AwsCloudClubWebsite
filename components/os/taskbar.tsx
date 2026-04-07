"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Bell, Wifi, Volume2, Battery, Search,
  Home, Cloud, Users, Calendar, FolderOpen,
  BookOpen, Share2, Mail, Trophy, Terminal, X
} from "lucide-react"

type AppId =
  | "home" | "about" | "team" | "events" | "projects"
  | "resources" | "social" | "contact" | "achievements" | "terminal"
  | "profile" | "admin"

interface TaskbarProps {
  openApps: AppId[]
  activeApp: AppId | null
  onAppClick: (appId: AppId) => void
  onStartClick: () => void
}

const taskbarApps: { id: AppId; icon: React.ReactNode; label: string }[] = [
  { id: "home",         icon: <Home className="h-5 w-5" />,       label: "Home" },
  { id: "about",        icon: <Cloud className="h-5 w-5" />,      label: "About" },
  { id: "team",         icon: <Users className="h-5 w-5" />,      label: "Team" },
  { id: "events",       icon: <Calendar className="h-5 w-5" />,   label: "Events" },
  { id: "projects",     icon: <FolderOpen className="h-5 w-5" />, label: "Projects" },
  { id: "resources",    icon: <BookOpen className="h-5 w-5" />,   label: "Resources" },
  { id: "social",       icon: <Share2 className="h-5 w-5" />,     label: "Social" },
  { id: "contact",      icon: <Mail className="h-5 w-5" />,       label: "Contact" },
  { id: "achievements", icon: <Trophy className="h-5 w-5" />,     label: "Achievements" },
  { id: "terminal",     icon: <Terminal className="h-5 w-5" />,   label: "Terminal" },
]

// Full searchable app list with gradients for the dropdown
const searchableApps: { id: AppId; label: string; icon: React.ElementType; gradient: string }[] = [
  { id: "home",         label: "Home",         icon: Home,       gradient: "linear-gradient(135deg,#6B4FE8,#8B6FFF)" },
  { id: "about",        label: "About Us",     icon: Cloud,      gradient: "linear-gradient(135deg,#B8A4FF,#8B6FFF)" },
  { id: "team",         label: "Team",         icon: Users,      gradient: "linear-gradient(135deg,#5BA8D8,#4B90C8)" },
  { id: "events",       label: "Events",       icon: Calendar,   gradient: "linear-gradient(135deg,#FF9900,#E88800)" },
  { id: "projects",     label: "Projects",     icon: FolderOpen, gradient: "linear-gradient(135deg,#50C88A,#3AAA72)" },
  { id: "resources",    label: "Resources",    icon: BookOpen,   gradient: "linear-gradient(135deg,#6B4FE8,#5B3FD8)" },
  { id: "social",       label: "Social",       icon: Share2,     gradient: "linear-gradient(135deg,#E85580,#C83565)" },
  { id: "contact",      label: "Contact",      icon: Mail,       gradient: "linear-gradient(135deg,#5BA8D8,#3B88C0)" },
  { id: "achievements", label: "Achievements", icon: Trophy,     gradient: "linear-gradient(135deg,#FFB800,#E89800)" },
  { id: "terminal",     label: "Terminal",     icon: Terminal,   gradient: "linear-gradient(135deg,#2D1B8A,#1E1060)" },
]

export function Taskbar({ openApps, activeApp, onAppClick, onStartClick }: TaskbarProps) {
  const [time, setTime]                   = useState<Date | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [query, setQuery]                 = useState("")
  const [searchOpen, setSearchOpen]       = useState(false)
  const searchRef                         = useRef<HTMLDivElement>(null)
  const inputRef                          = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const trimmed = query.trim()
  const results = trimmed
    ? searchableApps.filter((a) =>
        a.label.toLowerCase().includes(trimmed.toLowerCase())
      )
    : searchableApps

  const handleSelect = (id: AppId) => {
    onAppClick(id)
    setQuery("")
    setSearchOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="neu-taskbar fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-2">

      {/* Start Button */}
      <motion.button
        onClick={onStartClick}
        className="flex h-10 items-center gap-2 rounded-xl px-3 font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, #6B4FE8, #8B6FFF)",
          boxShadow: "4px 4px 12px rgba(107,79,232,0.40), -3px -3px 8px rgba(255,255,255,0.60)",
        }}
        whileHover={{ y: -2, boxShadow: "6px 6px 16px rgba(107,79,232,0.50), -3px -3px 10px rgba(255,255,255,0.70)" }}
        whileTap={{ scale: 0.94 }}
      >
        <Image src="/logo-icon.png" alt="Start" width={22} height={22} className="object-contain" />
        <span className="hidden text-sm sm:inline">Start</span>
      </motion.button>

      {/* ── Taskbar Search Bar with Dropdown ── */}
      <div ref={searchRef} className="relative mx-2 hidden md:block">
        <div
          className="neu-inset flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ minWidth: "160px", width: searchOpen ? "220px" : "160px", transition: "width 0.2s ease" }}
        >
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#9B8FC8" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search apps..."
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: "#1E1060" }}
          />
          {query && (
            <button onClick={() => { setQuery(""); inputRef.current?.focus() }}>
              <X className="h-3.5 w-3.5" style={{ color: "#9B8FC8" }} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="neu-panel absolute bottom-12 left-0 z-50 w-56 overflow-hidden rounded-2xl py-2"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ type: "spring" as const, stiffness: 340, damping: 26 }}
            >
              {/* Label */}
              <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9B8FC8" }}>
                {trimmed
                  ? results.length > 0 ? `${results.length} app${results.length > 1 ? "s" : ""}` : "No results"
                  : "All Apps"}
              </p>

              {results.length > 0 ? (
                <div className="space-y-0.5 px-2">
                  {results.map((app, i) => {
                    const Icon = app.icon
                    return (
                      <motion.button
                        key={app.id}
                        onClick={() => handleSelect(app.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, type: "spring" as const, stiffness: 340, damping: 24 }}
                        whileHover={{ background: "rgba(107,79,232,0.08)", x: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white"
                          style={{ background: app.gradient, boxShadow: "2px 2px 6px rgba(107,79,232,0.22)" }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#1E1060" }}>{app.label}</span>
                        {openApps.includes(app.id) && (
                          <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "#6B4FE8" }} />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <p className="px-3 py-3 text-sm" style={{ color: "#9B8FC8" }}>
                  No apps match &quot;{trimmed}&quot;
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Open Apps */}
      <div className="flex flex-1 items-center justify-center gap-0.5 overflow-x-auto px-2">
        {taskbarApps.map((app) => {
          const isOpen   = openApps.includes(app.id)
          const isActive = activeApp === app.id

          return (
            <motion.button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="relative flex h-10 min-w-10 items-center justify-center rounded-xl px-3 transition-colors"
              style={{
                background: isActive
                  ? "rgba(107,79,232,0.12)"
                  : isOpen
                  ? "rgba(194,186,240,0.25)"
                  : "transparent",
                color: isActive ? "#6B4FE8" : isOpen ? "#3D2A90" : "#9B8FC8",
                boxShadow: isActive
                  ? "inset 3px 3px 8px #C2BAF0, inset -3px -3px 8px #FFFFFF"
                  : isOpen
                  ? "3px 3px 8px #C2BAF0, -3px -3px 8px #FFFFFF"
                  : "none",
              }}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              title={app.label}
            >
              {app.icon}

              {isOpen && (
                <motion.div
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ background: isActive ? "#6B4FE8" : "#B8A4FF" }}
                  animate={{ width: isActive ? 20 : 6, height: 3 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 28 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-1">
        <motion.button
          onClick={() => setShowNotifications((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ color: "#7B6FC0" }}
          whileHover={{ scale: 1.1, y: -1 }}
          whileTap={{ scale: 0.93 }}
        >
          <Bell className="h-4 w-4" />
          <motion.span
            className="absolute right-2 top-2 h-2 w-2 rounded-full"
            style={{ background: "#6B4FE8" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        <div className="hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex neu-inset-sm">
          <Wifi    className="h-4 w-4" style={{ color: "#9B8FC8" }} />
          <Volume2 className="h-4 w-4" style={{ color: "#9B8FC8" }} />
          <Battery className="h-4 w-4" style={{ color: "#9B8FC8" }} />
        </div>

        <motion.div
          className="flex flex-col items-end rounded-xl px-3 py-1.5 cursor-default"
          whileHover={{ scale: 1.03 }}
        >
          <span className="text-sm font-semibold tabular-nums" style={{ color: "#1E1060" }}>
            {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
          <span className="text-[11px]" style={{ color: "#7B6FC0" }}>
            {time ? time.toLocaleDateString([], { month: "short", day: "numeric" }) : "---"}
          </span>
        </motion.div>
      </div>

      {/* Notification panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="neu-panel absolute bottom-16 right-4 w-80 rounded-2xl p-4"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          >
            <h3 className="mb-3 font-semibold" style={{ color: "#1E1060" }}>Notifications</h3>
            <div className="space-y-2">
              <div className="neu-inset-sm rounded-xl p-3">
                <p className="text-sm font-medium" style={{ color: "#1E1060" }}>Welcome to AWS Cloud Club NMIET!</p>
                <p className="text-xs mt-0.5" style={{ color: "#7B6FC0" }}>Explore our cloud-powered workspace</p>
              </div>
              <div className="neu-inset-sm rounded-xl p-3">
                <p className="text-sm font-medium" style={{ color: "#1E1060" }}>Introductory Event — April 8, 2026</p>
                <p className="text-xs mt-0.5" style={{ color: "#7B6FC0" }}>236 RSVPs · Check Events app for details</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
