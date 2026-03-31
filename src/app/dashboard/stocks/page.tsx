"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Pencil, Trash2, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import FormModal from "@/components/FormModal";

interface StockItem {
  id: number; name: string; description: string | null; category: string;
  unit: string; quantity: number; minQuantity: number; unitPrice: number | null; spaceId: number | null;
}

interface Space { id: number; name: string; }

const categoryLabels: Record<string, string> = {
  office_supply: "Fournitures de bureau", cleaning: "Nettoyage", material: "Materiel", consumable: "Consommable", other: "Autre",
};

export default function StocksPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "office_supply", unit: "piece", quantity: "0", minQuantity: "0", unitPrice: "", spaceId: "" });
  const [movement, setMovement] = useState({ type: "in", quantity: "", reason: "purchase", notes: "" });

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/stock"), fetch("/api/spaces")])
      .then(([stRes, spRes]) => Promise.all([stRes.json(), spRes.json()]))
      .then(([stData, spData]) => { setItems(stData); setSpaces(spData); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    Promise.all([fetch("/api/stock"), fetch("/api/spaces")])
      .then(([stRes, spRes]) => Promise.all([stRes.json(), spRes.json()]))
      .then(([stData, spData]) => { setItems(stData); setSpaces(spData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", category: "office_supply", unit: "piece", quantity: "0", minQuantity: "0", unitPrice: "", spaceId: "" });
    setShowModal(true);
  }

  function openEdit(s: StockItem) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || "", category: s.category, unit: s.unit, quantity: s.quantity.toString(), minQuantity: s.minQuantity.toString(), unitPrice: s.unitPrice?.toString() || "", spaceId: s.spaceId?.toString() || "" });
    setShowModal(true);
  }

  function openMovement(item: StockItem) {
    setSelectedItem(item);
    setMovement({ type: "in", quantity: "", reason: "purchase", notes: "" });
    setShowMovement(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = { ...form, quantity: parseInt(form.quantity), minQuantity: parseInt(form.minQuantity), unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : null, spaceId: form.spaceId ? parseInt(form.spaceId) : null };
    if (editing) {
      await fetch("/api/stock", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch("/api/stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowModal(false);
    load();
  }

  async function handleMovement(ev: React.FormEvent) {
    ev.preventDefault();
    if (!selectedItem) return;
    await fetch("/api/stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "movement", stockItemId: selectedItem.id, type: movement.type, quantity: parseInt(movement.quantity), reason: movement.reason, notes: movement.notes }) });
    setShowMovement(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch("/api/stock", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Stocks</h1>
          <p className="text-slate-500 text-sm">Inventaire et mouvements de stock</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition">
          <Plus size={18} /> Nouvel Article
        </button>
      </div>

      {loading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Article</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Categorie</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Quantite</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Seuil</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Prix unitaire</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 ${item.quantity <= item.minQuantity ? "bg-red-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.quantity <= item.minQuantity && <AlertTriangle className="text-red-500" size={16} />}
                      <div>
                        <span className="text-sm font-medium text-slate-800">{item.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({item.unit})</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{categoryLabels[item.category] || item.category}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-400">{item.minQuantity}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.unitPrice ? `${item.unitPrice.toLocaleString()} DA` : "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openMovement(item)} className="p-1.5 text-slate-400 hover:text-green-500" title="Mouvement"><ArrowUp size={16} /></button>
                    <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-center py-8 text-slate-400">Aucun article en stock</p>}
        </div>
      )}

      <FormModal title={editing ? "Modifier l'article" : "Nouvel article"} isOpen={showModal} onClose={() => setShowModal(false)}>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Unite</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="piece">Piece</option>
                <option value="kg">Kg</option>
                <option value="liter">Litre</option>
                <option value="box">Boite</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantite</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seuil min</label>
              <input type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix unitaire</label>
              <input type="number" step="0.01" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Espace</label>
            <select value={form.spaceId} onChange={e => setForm({ ...form, spaceId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
              <option value="">--</option>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 rounded-lg transition">
            {editing ? "Modifier" : "Creer"}
          </button>
        </form>
      </FormModal>

      <FormModal title={`Mouvement: ${selectedItem?.name || ""}`} isOpen={showMovement} onClose={() => setShowMovement(false)}>
        <form onSubmit={handleMovement} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={movement.type} onChange={e => setMovement({ ...movement, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="in">Entree</option>
                <option value="out">Sortie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantite *</label>
              <input type="number" value={movement.quantity} onChange={e => setMovement({ ...movement, quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison</label>
            <select value={movement.reason} onChange={e => setMovement({ ...movement, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
              <option value="purchase">Achat</option>
              <option value="usage">Utilisation</option>
              <option value="transfer">Transfert</option>
              <option value="adjustment">Ajustement</option>
              <option value="loss">Perte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={movement.notes} onChange={e => setMovement({ ...movement, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition">
            Enregistrer le mouvement
          </button>
        </form>
      </FormModal>
    </div>
  );
}
