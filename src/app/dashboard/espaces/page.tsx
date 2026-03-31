"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import FormModal from "@/components/FormModal";

interface Space {
  id: number; name: string; description: string | null; type: string;
  status: string; address: string | null; surface: number | null;
}

const typeLabels: Record<string, string> = {
  artistic_studio: "No Name Artistic Studio Lab",
  eco_lab: "No Name Eco Lab",
  maison_hote: "La Maison d'Hote",
};

const statusLabels: Record<string, string> = {
  active: "Actif", renovation: "En travaux", inactive: "Inactif",
};

export default function EspacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Space | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "artistic_studio", status: "active", address: "", surface: "" });

  function load() {
    setLoading(true);
    fetch("/api/spaces")
      .then(r => r.json())
      .then(data => { setSpaces(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/spaces")
      .then(r => r.json())
      .then(data => { setSpaces(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", type: "artistic_studio", status: "active", address: "", surface: "" });
    setShowModal(true);
  }

  function openEdit(s: Space) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || "", type: s.type, status: s.status, address: s.address || "", surface: s.surface?.toString() || "" });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, surface: form.surface ? parseFloat(form.surface) : null };
    if (editing) {
      await fetch("/api/spaces", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch("/api/spaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet espace ?")) return;
    await fetch("/api/spaces", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Espaces</h1>
          <p className="text-slate-500 text-sm">Locaux de l&apos;association</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition">
          <Plus size={18} /> Nouvel Espace
        </button>
      </div>

      {loading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="text-amber-500" size={20} />
                  <h3 className="font-semibold text-slate-800">{space.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(space)} className="p-1.5 text-slate-400 hover:text-blue-500 transition"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(space.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </div>
              </div>
              {space.description && <p className="text-sm text-slate-500 mb-3">{space.description}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full ${space.status === "active" ? "bg-green-100 text-green-700" : space.status === "renovation" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                  {statusLabels[space.status] || space.status}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{typeLabels[space.type] || space.type}</span>
                {space.surface && <span className="text-xs text-slate-400">{space.surface} m2</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <FormModal title={editing ? "Modifier l'espace" : "Nouvel espace"} isOpen={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
              <option value="artistic_studio">No Name Artistic Studio Lab</option>
              <option value="eco_lab">No Name Eco Lab</option>
              <option value="maison_hote">La Maison d&apos;Hote</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
              <option value="active">Actif</option>
              <option value="renovation">En travaux</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Surface (m2)</label>
            <input type="number" value={form.surface} onChange={e => setForm({ ...form, surface: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" rows={3} />
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 rounded-lg transition">
            {editing ? "Modifier" : "Creer"}
          </button>
        </form>
      </FormModal>
    </div>
  );
}
