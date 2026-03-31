"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import FormModal from "@/components/FormModal";

interface Project {
  id: number; name: string; description: string | null; status: string;
  startDate: string | null; endDate: string | null; budget: number | null;
}

interface Activity {
  id: number; name: string; description: string | null; type: string;
  projectId: number | null; spaceId: number | null; status: string;
  date: string | null; budget: number | null;
}

interface Space { id: number; name: string; }

const projectStatusLabels: Record<string, string> = {
  planning: "Planification", active: "Actif", completed: "Termine", cancelled: "Annule",
};

const activityTypeLabels: Record<string, string> = {
  workshop: "Atelier", performance: "Performance", meeting: "Reunion",
  event: "Evenement", training: "Formation", other: "Autre",
};

const activityStatusLabels: Record<string, string> = {
  planned: "Planifie", in_progress: "En cours", completed: "Termine", cancelled: "Annule",
};

export default function ProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "activities">("projects");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", status: "planning", startDate: "", endDate: "", budget: "" });
  const [activityForm, setActivityForm] = useState({ name: "", description: "", type: "workshop", projectId: "", spaceId: "", status: "planned", date: "", budget: "" });

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/projects"), fetch("/api/activities"), fetch("/api/spaces")])
      .then(([pRes, aRes, sRes]) => Promise.all([pRes.json(), aRes.json(), sRes.json()]))
      .then(([pData, aData, sData]) => { setProjects(pData); setActivities(aData); setSpaces(sData); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    Promise.all([fetch("/api/projects"), fetch("/api/activities"), fetch("/api/spaces")])
      .then(([pRes, aRes, sRes]) => Promise.all([pRes.json(), aRes.json(), sRes.json()]))
      .then(([pData, aData, sData]) => { setProjects(pData); setActivities(aData); setSpaces(sData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openNewProject() {
    setEditingProject(null);
    setProjectForm({ name: "", description: "", status: "planning", startDate: "", endDate: "", budget: "" });
    setShowProjectModal(true);
  }

  function openEditProject(p: Project) {
    setEditingProject(p);
    setProjectForm({
      name: p.name, description: p.description || "", status: p.status,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
      endDate: p.endDate ? new Date(p.endDate).toISOString().split("T")[0] : "",
      budget: p.budget?.toString() || "",
    });
    setShowProjectModal(true);
  }

  function openNewActivity() {
    setEditingActivity(null);
    setActivityForm({ name: "", description: "", type: "workshop", projectId: "", spaceId: "", status: "planned", date: "", budget: "" });
    setShowActivityModal(true);
  }

  function openEditActivity(a: Activity) {
    setEditingActivity(a);
    setActivityForm({
      name: a.name, description: a.description || "", type: a.type,
      projectId: a.projectId?.toString() || "", spaceId: a.spaceId?.toString() || "",
      status: a.status, date: a.date ? new Date(a.date).toISOString().split("T")[0] : "",
      budget: a.budget?.toString() || "",
    });
    setShowActivityModal(true);
  }

  async function handleProjectSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = {
      ...projectForm,
      budget: projectForm.budget ? parseFloat(projectForm.budget) : null,
      startDate: projectForm.startDate || null,
      endDate: projectForm.endDate || null,
    };
    if (editingProject) {
      await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingProject.id, ...payload }) });
    } else {
      await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowProjectModal(false);
    load();
  }

  async function handleActivitySubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = {
      ...activityForm,
      projectId: activityForm.projectId ? parseInt(activityForm.projectId) : null,
      spaceId: activityForm.spaceId ? parseInt(activityForm.spaceId) : null,
      budget: activityForm.budget ? parseFloat(activityForm.budget) : null,
      date: activityForm.date || null,
    };
    if (editingActivity) {
      await fetch("/api/activities", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingActivity.id, ...payload }) });
    } else {
      await fetch("/api/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowActivityModal(false);
    load();
  }

  async function handleDeleteProject(id: number) {
    if (!confirm("Supprimer ce projet et ses activites ?")) return;
    await fetch("/api/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  async function handleDeleteActivity(id: number) {
    if (!confirm("Supprimer cette activite ?")) return;
    await fetch("/api/activities", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projets & Activites</h1>
          <p className="text-slate-500 text-sm">Gestion des projets et activites de l&apos;association</p>
        </div>
        <button onClick={tab === "projects" ? openNewProject : openNewActivity} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition">
          <Plus size={18} /> {tab === "projects" ? "Nouveau Projet" : "Nouvelle Activite"}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("projects")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "projects" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
          <span className="flex items-center gap-2"><FolderKanban size={16} /> Projets ({projects.length})</span>
        </button>
        <button onClick={() => setTab("activities")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "activities" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
          <span className="flex items-center gap-2"><Calendar size={16} /> Activites ({activities.length})</span>
        </button>
      </div>

      {loading ? <p className="text-slate-500">Chargement...</p> : tab === "projects" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{p.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEditProject(p)} className="p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={16} /></button>
                  <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              {p.description && <p className="text-sm text-slate-500 mb-3">{p.description}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : p.status === "planning" ? "bg-blue-100 text-blue-700" : p.status === "completed" ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-700"}`}>
                  {projectStatusLabels[p.status] || p.status}
                </span>
                {p.budget && <span className="text-xs text-slate-400">Budget: {p.budget.toLocaleString()} DA</span>}
                {p.startDate && <span className="text-xs text-slate-400">{new Date(p.startDate).toLocaleDateString("fr-FR")}</span>}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                {activities.filter(a => a.projectId === p.id).length} activite(s)
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-slate-400 col-span-2 text-center py-8">Aucun projet</p>}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Projet</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Espace</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Statut</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{activityTypeLabels[a.type] || a.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{projects.find(p => p.id === a.projectId)?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{spaces.find(s => s.id === a.spaceId)?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.date ? new Date(a.date).toLocaleDateString("fr-FR") : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.status === "completed" ? "bg-green-100 text-green-700" : a.status === "in_progress" ? "bg-blue-100 text-blue-700" : a.status === "planned" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {activityStatusLabels[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditActivity(a)} className="p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={16} /></button>
                    <button onClick={() => handleDeleteActivity(a.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activities.length === 0 && <p className="text-center py-8 text-slate-400">Aucune activite</p>}
        </div>
      )}

      <FormModal title={editingProject ? "Modifier le projet" : "Nouveau projet"} isOpen={showProjectModal} onClose={() => setShowProjectModal(false)}>
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(projectStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget (DA)</label>
              <input type="number" step="0.01" value={projectForm.budget} onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date debut</label>
              <input type="date" value={projectForm.startDate} onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date fin</label>
              <input type="date" value={projectForm.endDate} onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" rows={3} />
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 rounded-lg transition">
            {editingProject ? "Modifier" : "Creer"}
          </button>
        </form>
      </FormModal>

      <FormModal title={editingActivity ? "Modifier l'activite" : "Nouvelle activite"} isOpen={showActivityModal} onClose={() => setShowActivityModal(false)}>
        <form onSubmit={handleActivitySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input value={activityForm.name} onChange={e => setActivityForm({ ...activityForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select value={activityForm.type} onChange={e => setActivityForm({ ...activityForm, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(activityTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={activityForm.status} onChange={e => setActivityForm({ ...activityForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                {Object.entries(activityStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Projet</label>
              <select value={activityForm.projectId} onChange={e => setActivityForm({ ...activityForm, projectId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="">--</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Espace</label>
              <select value={activityForm.spaceId} onChange={e => setActivityForm({ ...activityForm, spaceId: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500">
                <option value="">--</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={activityForm.date} onChange={e => setActivityForm({ ...activityForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget (DA)</label>
              <input type="number" step="0.01" value={activityForm.budget} onChange={e => setActivityForm({ ...activityForm, budget: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 rounded-lg transition">
            {editingActivity ? "Modifier" : "Creer"}
          </button>
        </form>
      </FormModal>
    </div>
  );
}
