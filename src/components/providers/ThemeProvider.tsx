"use client"

import * as React from "react"

// Dark mode has been removed from the app. Keep a simple provider component
// so the rest of the codebase can still import `ThemeProvider` without
// depending on `next-themes` or injecting any `dark` class.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
