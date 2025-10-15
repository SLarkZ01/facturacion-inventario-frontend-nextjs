"use client"

import { usePathname } from "next/navigation"
import React from "react"

export default function ShowUnlessRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // don't show children on the root path (/)
  if (!pathname || pathname === "/") return null
  return <>{children}</>
}
