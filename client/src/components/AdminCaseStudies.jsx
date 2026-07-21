import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Lightbulb } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.status === 204 ? null : response.json();
}

const defaultFormState = {
  title: '',
  description: '',
  availableChips: '',
  targetConcept: '',
  targetKeywords: '',
};

const AdminCaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const data = await api('/scenarios/case-studies');
      setCaseStudies(data);
    } catch (err) {
      console.error('Failed to fetch case studies', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        availableChips: form.availableChips.split(',').map(s => s.trim()).filter(Boolean),
        targetConcept: form.targetConcept,
        targetKeywords: form.targetKeywords.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingId) {
        // Not implemented PUT yet
      } else {
        await api('/scenarios/case-studies', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setForm(defaultFormState);
      setIsEditing(false);
      setEditingId(null);
      fetchCaseStudies();
    } catch (err) {
      console.error('Failed to save case study', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Case Studies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="text-amber-500" /> Concept Discovery Manager
          </h2>
          <p className="text-slate-500">Create new scenarios for the Concept Discovery Engine</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#d8f07c] text-[#16231f] font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#c5e064] transition-colors shadow-sm"
          >
            <Plus size={18} /> New Case Study
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit Case Study' : 'Create New Case Study'}
            </h2>
            <button 
              onClick={() => { setIsEditing(false); setEditingId(null); setForm(defaultFormState); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16231f]"
                placeholder="e.g., Massive Event Registration"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Real-world problem)</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 h-24 resize-y focus:outline-none focus:ring-2 focus:ring-[#16231f]"
                placeholder="You are managing an online event where 50,000 users are registering..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Available Chips (Comma-separated)</label>
              <input
                required
                type="text"
                value={form.availableChips}
                onChange={(e) => setForm({ ...form, availableChips: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16231f]"
                placeholder="Key-Value Pair, No Duplicates, Sequential List, O(1) Lookup"
              />
              <p className="text-xs text-slate-500 mt-1">Tags the student can click on to build their logic.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Concept</label>
              <input
                required
                type="text"
                value={form.targetConcept}
                onChange={(e) => setForm({ ...form, targetConcept: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16231f]"
                placeholder="e.g., Set, Dictionary, Loop"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Keywords (Comma-separated)</label>
              <input
                required
                type="text"
                value={form.targetKeywords}
                onChange={(e) => setForm({ ...form, targetKeywords: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16231f]"
                placeholder="duplicates, instant, unique, O(1), lookup"
              />
              <p className="text-xs text-slate-500 mt-1">If the student uses at least 2 of these words (or selects matching chips), they discover the concept.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingId(null); setForm(defaultFormState); }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#16231f] text-[#f8f4ec] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#24342f]"
              >
                <Save size={18} /> Save Case Study
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {caseStudies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No case studies found. Create one!</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Target Concept</th>
                  <th className="p-4">Chips</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {caseStudies.map((study) => (
                  <tr key={study.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium">{study.title}</td>
                    <td className="p-4">
                      <span className="bg-[#d8f07c]/20 text-[#66730a] px-2 py-1 rounded text-xs font-bold">
                        {study.targetConcept}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{study.availableChips?.length || 0} available</td>
                    <td className="p-4 text-right">
                      <span className="text-emerald-600 text-sm font-medium">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCaseStudies;
