"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface DesktopIconProps {
  icon: ReactNode
  label: string
  onClick: () => void
  gradient?: string
}

export function DesktopIcon({ icon, label, onClick, gradient }: DesktopIconProps) {
  return (
    <motion.button
      onClick={onClick}
      onDoubleClick={onClick}
      className="group flex w-[72px] flex-col items-center gap-1.5 rounded-2xl p-1.5"
      whileHover={{ y: -4, scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring" as const, stiffness: 380, damping: 22 }}
    >
      {/* Icon square — slightly larger on mobile for easier tapping */}
      <motion.div
        className="flex h-14 w-14 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white"
        style={{
          background: gradient ?? "linear-gradient(135deg,#6B4FE8,#8B6FFF)",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
        }}
        whileHover={{
          boxShadow: "7px 7px 20px #C2BAF0, -7px -7px 20px #FFFFFF",
        }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>

      {/* Hover tooltip label — appears to the right */}
      <motion.span
        className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2
          whitespace-nowrap rounded-xl px-2.5 py-1 text-xs font-semibold
          opacity-0 group-hover:opacity-100 z-50"
        style={{
          background: "rgba(30,16,96,0.82)",
          color: "#FFFFFF",
          backdropFilter: "blur(8px)",
          boxShadow: "2px 2px 8px rgba(107,79,232,0.25)",
          transition: "opacity 0.18s ease",
        }}
      >
        {label}
      </motion.span>
    </motion.button>
  )
}
