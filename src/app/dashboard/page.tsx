"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShoppingCart, Package, FolderKanban, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

interface Stats {
  purchases: { total: number; count: number; byCategory: { category: string; total: number; count: number }[]; byMonth: { month: string; total: number }[]; paymentStats: { status: string; total: number; count: number }[] };
  stock: { totalItems: number; totalQuantity: number; totalValue: number; lowStock: { id: number; name: string; quantity: number; minQuantity: number }[] };
  equipment: { totalItems: number; totalQuantity: number; byCondition: string; count: number }[];
  projects: { status: string; count: number }[];
  spaces: { id: number; name: string; status: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) router.push("/");
    });
  }, [router]);

  useEffect(() => {
    fetch(`/api/statistics?period=${period}`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading || !stats) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-500">Chargement...</div></div>;
  }

  const categoryLabels: Record<string, string> = {
    equipment: "Equipement", material: "Materiel", office_supply: "Fournitures",
    cleaning: "Nettoyage", maintenance: "Maintenance", activity_supply: "Activites", other: "Autre",
  };

  const statusLabels: Record<string, string> = {
    paid: "Paye", pending: "En attente", cancelled: "Annule",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord</h1>
          <p className="text-slate-500 text-sm">Association Danseurs Citoyens - Departement Logistique</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500"
        >
          <option value="daily">Aujourd&apos;hui</option>
          <option value="weekly">Cette semaine</option>
          <option value="monthly">Ce mois</option>
          <option value="quarterly">Ce trimestre</option>
          <option value="semester">Ce semestre</option>
          <option value="yearly">Cette annee</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Achats" value={`${stats.purchases.total.toLocaleString()} DA`} subtitle={`${stats.purchases.count} factures`} color="amber" icon={<ShoppingCart size={20} />} />
        <StatCard title="Articles en Stock" value={stats.stock.totalItems} subtitle={`${stats.stock.totalQuantity} unites totales`} color="blue" icon={<Package size={20} />} />
        <StatCard title="Valeur Stock" value={`${(stats.stock.totalValue || 0).toLocaleString()} DA`} subtitle="Valeur estimee" color="green" icon={<Package size={20} />} />
        <StatCard title="Espaces" value={stats.spaces.length} subtitle={`${stats.spaces.filter(s => s.status === "active").length} actifs`} color="purple" icon={<Building2 size={20} />} />
      </div>

      {stats.stock.lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-semibold text-red-700">Alertes Stock Faible</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.stock.lowStock.map((item) => (
              <div key={item.id} className="bg-white rounded-lg px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="text-red-500 ml-2">{item.quantity}/{item.minQuantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Achats par Mois</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.purchases.byMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} DA`} />
              <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Achats par Categorie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.purchases.byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                {stats.purchases.byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} DA`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Statut des Paiements</h3>
          <div className="space-y-3">
            {stats.purchases.paymentStats.map((p) => (
              <div key={p.status} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{statusLabels[p.status] || p.status}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{p.total.toLocaleString()} DA</span>
                  <span className="text-xs text-slate-400">({p.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Projets</h3>
          <div className="space-y-3">
            {stats.projects.map((p) => (
              <div key={p.status} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 capitalize">{p.status}</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">{p.count}</span>
              </div>
            ))}
            {stats.projects.length === 0 && <p className="text-sm text-slate-400">Aucun projet</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.spaces.map((space) => (
          <div key={space.id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-amber-500" size={20} />
              <h3 className="font-semibold text-slate-700">{space.name}</h3>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${space.status === "active" ? "bg-green-100 text-green-700" : space.status === "renovation" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {space.status === "active" ? "Actif" : space.status === "renovation" ? "En travaux" : "Inactif"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
