"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Package,
  FolderKanban,
  BarChart3,
  Wrench,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
  { href: "/dashboard/espaces", label: "Espaces", icon: Building2 },
  { href: "/dashboard/equipements", label: "Equipements", icon: Wrench },
  { href: "/dashboard/stocks", label: "Stocks", icon: Package },
  { href: "/dashboard/achats", label: "Achats & Factures", icon: ShoppingCart },
  { href: "/dashboard/projets", label: "Projets & Activites", icon: FolderKanban },
  { href: "/dashboard/statistiques", label: "Statistiques", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <aside
      className={`bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-amber-400">ADC</h1>
            <p className="text-xs text-slate-400">Logistique</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-amber-500 text-slate-900 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Deconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
