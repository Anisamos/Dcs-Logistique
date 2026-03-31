"use client";

import { useEffect, useState } from "react";
import { Wrench, Plus, Pencil, Trash2 } from "lucide-react";
import FormModal from "@/components/FormModal";

interface Equipment {
  id: number; name: string; description: string | null; category: string;
  spaceId: number | null; quantity: number; condition: string;
  purchasePrice: number | null;
}

interface Space { id: number; name: string; }

const categoryLabels: Record<string, string> = {
  sound: "Son", light: "Eclairage", furniture: "Mobilier", it: "Informatique", cleaning: "Nettoyage", other: "Autre",
};

const conditionLabels: Record<string, string> = {
  excellent: "Excellent", good: "Bon", fair: "Moyen", poor: "Mauvais", broken: "Hors service",
};

export default function EquipementsPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "other", spaceId: "", quantity: "1", condition: "good", purchasePrice: "" });

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/equipment"), fetch("/api/spaces")])
      .then(([eqRes, spRes]) => Promise.all([eqRes.json(), spRes.json()]))
      .then(([eqData, spData]) => { setItems(eqData); setSpaces(spData); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    Promise.all([fetch("/api/equipment"), fetch("/api/spaces")])
      .then(([eqRes, spRes]) => Promise.all([eqRes.json(), spRes.json()]))
      .then(([eqData, spData]) => { setItems(eqData); setSpaces(spData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", category: "other", spaceId: "", quantity: "1", condition: "good", purchasePrice: "" });
    setShowModal(true);
  }

  function openEdit(e: Equipment) {
    setEditing(e);
    setForm({ name: e.name, description: e.description || "", category: e.category, spaceId: e.spaceId?.toString() || "", quantity: e.quantity.toString(), condition: e.condition, purchasePrice: e.purchasePrice?.toString() || "" });
    setShowModal(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = { ...form, spaceId: form.spaceId ? parseInt(form.spaceId) : null, quantity: parseInt(form.quantity), purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null };
    if (editing) {
      await fetch("/api/equipment", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch("/api/equipment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ?")) return;
    await fetch("/api/equipment", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipements</h1>
          <p className="text-slate-500 text-sm">Materiels et equipements des espaces</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition">
          <Plus size={18} /> Nouvel Equipement
        </button>
      </div>

      {loading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Categorie</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Espace</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Qt</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Etat</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{categoryLabels[item.category] || item.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{spaces.find(s => s.id === item.spaceId)?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.condition === "excellent" ? "bg-green-100 text-green-700" : item.condition === "good" ? "bg-blue-100 text-blue-700" : item.condition === "fair" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {conditionLabels[item.condition] || item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-center py-8 text-slate-400">Aucun equipement</p>}
        </div>
      )}

      <FormModal title={editing ? "Modifier" : "Nouvel equipement"} isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categorie</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantite</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Espace</label>
              <select value={form.spaceId} onChange={e => setForm({ ...form, spaceId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="">--</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Etat</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(conditionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prix d&apos;achat (DA)</label>
            <input type="number" step="0.01" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
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
