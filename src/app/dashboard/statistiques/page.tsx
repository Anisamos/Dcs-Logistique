"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Download } from "lucide-react";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

interface StatsData {
  period: { start: string; end: string; type: string };
  purchases: {
    total: number; count: number;
    byCategory: { category: string; total: number; count: number }[];
    byMonth: { month: string; total: number }[];
    bySpace: { spaceId: number; total: number }[];
    paymentStats: { status: string; total: number; count: number }[];
  };
  stock: { totalItems: number; totalQuantity: number; totalValue: number; lowStock: { id: number; name: string; quantity: number; minQuantity: number }[] };
  equipment: { totalItems: number; totalQuantity: number; byCondition: string; count: number }[];
  projects: { status: string; count: number }[];
  spaces: { id: number; name: string; status: string; surface: number | null }[];
}

const categoryLabels: Record<string, string> = {
  equipment: "Equipement", material: "Materiel", office_supply: "Fournitures",
  cleaning: "Nettoyage", maintenance: "Maintenance", activity_supply: "Activites", other: "Autre",
};

const periodLabels: Record<string, string> = {
  daily: "Aujourd'hui", weekly: "Cette semaine", monthly: "Ce mois",
  quarterly: "Ce trimestre", semester: "Ce semestre", yearly: "Cette annee",
};

export default function StatistiquesPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [period, setPeriod] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (customStart && customEnd) {
      params.set("startDate", customStart);
      params.set("endDate", customEnd);
    }
    fetch(`/api/statistics?${params}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const params = new URLSearchParams({ period });
    if (customStart && customEnd) {
      params.set("startDate", customStart);
      params.set("endDate", customEnd);
    }
    fetch(`/api/statistics?${params}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  function handleCustomSearch() {
    if (customStart && customEnd) load();
  }

  function exportCSV() {
    if (!stats) return;
    const rows = [
      ["Periode", periodLabels[period]],
      ["Total Achats", `${stats.purchases.total} DA`],
      ["Nombre Factures", stats.purchases.count.toString()],
      ["Articles en Stock", stats.stock.totalItems.toString()],
      ["Valeur Stock", `${stats.stock.totalValue} DA`],
      [""],
      ["Achats par Categorie", "Total", "Nombre"],
      ...stats.purchases.byCategory.map(c => [categoryLabels[c.category] || c.category, `${c.total} DA`, c.count.toString()]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistiques_${period}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  if (loading || !stats) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-500">Chargement...</div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>
          <p className="text-slate-500 text-sm">Rapports et analyses - {periodLabels[period]}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm transition">
            <Download size={16} /> Exporter CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center gap-4 flex-wrap">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
          <option value="daily">Aujourd&apos;hui</option>
          <option value="weekly">Cette semaine</option>
          <option value="monthly">Ce mois</option>
          <option value="quarterly">Ce trimestre</option>
          <option value="semester">Ce semestre</option>
          <option value="yearly">Cette annee</option>
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <span className="text-slate-400">-</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleCustomSearch} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-sm font-medium">Filtrer</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Achats</p>
          <p className="text-2xl font-bold text-amber-600">{stats.purchases.total.toLocaleString()} DA</p>
          <p className="text-xs text-slate-400">{stats.purchases.count} factures</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Articles Stock</p>
          <p className="text-2xl font-bold text-blue-600">{stats.stock.totalItems}</p>
          <p className="text-xs text-slate-400">{stats.stock.totalQuantity} unites</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Valeur Stock</p>
          <p className="text-2xl font-bold text-green-600">{(stats.stock.totalValue || 0).toLocaleString()} DA</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Alertes Stock</p>
          <p className="text-2xl font-bold text-red-600">{stats.stock.lowStock.length}</p>
          <p className="text-xs text-slate-400">articles sous le seuil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Evolution des Achats</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.purchases.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} DA`} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} name="Achats (DA)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Repartition par Categorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.purchases.byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100}>
                {stats.purchases.byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} DA`} />
              <Legend formatter={(value) => categoryLabels[value as string] || value} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Achats Mensuels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.purchases.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} DA`} />
              <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Achats (DA)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Statut des Paiements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.purchases.paymentStats} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={100}>
                {stats.purchases.paymentStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} DA`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.stock.lowStock.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-semibold text-red-700 mb-3">Articles sous le seuil minimum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.stock.lowStock.map(item => (
              <div key={item.id} className="bg-white rounded-lg px-3 py-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="text-red-500">{item.quantity}/{item.minQuantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
