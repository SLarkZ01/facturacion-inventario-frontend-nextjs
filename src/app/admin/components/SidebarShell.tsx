"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarShell() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin:sidebarCollapsed");
      setCollapsed(raw === "1");
    } catch {
      // ignore (SSR safety)
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("admin:sidebarCollapsed", collapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [collapsed]);

  return (
    // make the aside sticky so it follows the viewport while the page scrolls
    <aside className={`sticky top-0 self-start transition-all duration-200 ${collapsed ? "w-20" : "w-72"}`}>
      <div className="h-screen flex flex-col bg-transparent overflow-hidden">
        <div className="flex items-center justify-end p-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <Sidebar collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}
