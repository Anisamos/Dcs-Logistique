"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Pencil, Trash2, Filter } from "lucide-react";
import FormModal from "@/components/FormModal";

interface Purchase {
  id: number; title: string; description: string | null; supplier: string | null;
  category: string; amount: number; invoiceNumber: string | null;
  invoiceDate: string; paymentStatus: string; spaceId: number | null;
  projectId: number | null; activityId: number | null;
}

interface Space { id: number; name: string; }
interface Project { id: number; name: string; }

const categoryLabels: Record<string, string> = {
  equipment: "Equipement", material: "Materiel", office_supply: "Fournitures",
  cleaning: "Nettoyage", maintenance: "Maintenance", activity_supply: "Activites", other: "Autre",
};

const statusLabels: Record<string, string> = {
  paid: "Paye", pending: "En attente", cancelled: "Annule",
};

export default function AchatsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [filter, setFilter] = useState({ category: "", spaceId: "", paymentStatus: "" });
  const [form, setForm] = useState({
    title: "", description: "", supplier: "", category: "other", amount: "",
    invoiceNumber: "", invoiceDate: new Date().toISOString().split("T")[0],
    paymentStatus: "pending", spaceId: "", projectId: "", activityId: "",
  });

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/purchases"), fetch("/api/spaces"), fetch("/api/projects")])
      .then(([pRes, sRes, prRes]) => Promise.all([pRes.json(), sRes.json(), prRes.json()]))
      .then(([pData, sData, prData]) => { setPurchases(pData); setSpaces(sData); setProjects(prData); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    Promise.all([fetch("/api/purchases"), fetch("/api/spaces"), fetch("/api/projects")])
      .then(([pRes, sRes, prRes]) => Promise.all([pRes.json(), sRes.json(), prRes.json()]))
      .then(([pData, sData, prData]) => { setPurchases(pData); setSpaces(sData); setProjects(prData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm({
      title: "", description: "", supplier: "", category: "other", amount: "",
      invoiceNumber: "", invoiceDate: new Date().toISOString().split("T")[0],
      paymentStatus: "pending", spaceId: "", projectId: "", activityId: "",
    });
    setShowModal(true);
  }

  function openEdit(p: Purchase) {
    setEditing(p);
    setForm({
      title: p.title, description: p.description || "", supplier: p.supplier || "",
      category: p.category, amount: p.amount.toString(), invoiceNumber: p.invoiceNumber || "",
      invoiceDate: p.invoiceDate ? new Date(p.invoiceDate).toISOString().split("T")[0] : "",
      paymentStatus: p.paymentStatus, spaceId: p.spaceId?.toString() || "",
      projectId: p.projectId?.toString() || "", activityId: "",
    });
    setShowModal(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = {
      ...form, amount: parseFloat(form.amount),
      spaceId: form.spaceId ? parseInt(form.spaceId) : null,
      projectId: form.projectId ? parseInt(form.projectId) : null,
      activityId: form.activityId ? parseInt(form.activityId) : null,
    };
    if (editing) {
      await fetch("/api/purchases", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch("/api/purchases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette facture ?")) return;
    await fetch("/api/purchases", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  const filtered = purchases.filter(p => {
    if (filter.category && p.category !== filter.category) return false;
    if (filter.spaceId && p.spaceId !== parseInt(filter.spaceId)) return false;
    if (filter.paymentStatus && p.paymentStatus !== filter.paymentStatus) return false;
    return true;
  });

  const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Achats & Factures</h1>
          <p className="text-slate-500 text-sm">Gestion des achats et factures - Total: <strong>{totalAmount.toLocaleString()} DA</strong></p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition">
          <Plus size={18} /> Nouvel Achat
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-slate-400" />
        <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm">
          <option value="">Toutes categories</option>
          {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filter.spaceId} onChange={e => setFilter({ ...filter, spaceId: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm">
          <option value="">Tous espaces</option>
          {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filter.paymentStatus} onChange={e => setFilter({ ...filter, paymentStatus: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm">
          <option value="">Tous statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Titre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Categorie</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Fournisseur</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Montant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Statut</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{p.title}</span>
                      {p.invoiceNumber && <span className="text-xs text-slate-400 ml-2">#{p.invoiceNumber}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{categoryLabels[p.category] || p.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.supplier || "-"}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{p.amount.toLocaleString()} DA</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(p.invoiceDate).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700" : p.paymentStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {statusLabels[p.paymentStatus] || p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-slate-400">Aucun achat</p>}
        </div>
      )}

      <FormModal title={editing ? "Modifier l'achat" : "Nouvel achat"} isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categorie *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant (DA) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur</label>
              <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">N de facture</label>
              <input value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input type="date" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Espace lie</label>
              <select value={form.spaceId} onChange={e => setForm({ ...form, spaceId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="">--</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Projet lie</label>
              <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="">--</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 rounded-lg transition">
            {editing ? "Modifier" : "Creer"}
          </button>
        </form>
      </FormModal>
    </div>
  );
}
