import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings, Database, Activity } from 'lucide-react';
import AdminAnalytics from './AdminAnalytics';
import AdminCaseStudies from './AdminCaseStudies';
import { Lightbulb } from 'lucide-react';

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
  difficultyLevel: 'Beginner',
  options: ['', ''],
};

const AdminDashboard = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [adminTab, setAdminTab] = useState('scenarios');

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const data = await api('/scenarios');
      setScenarios(data);
    } catch (err) {
      console.error('Failed to fetch scenarios', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const addOption = () => {
    setForm({ ...form, options: [...form.options, ''] });
  };

  const removeOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api(`/scenarios/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await api('/scenarios', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setForm(defaultFormState);
      setIsEditing(false);
      setEditingId(null);
      fetchScenarios();
    } catch (err) {
      console.error('Failed to save scenario', err);
    }
  };

  const handleEdit = (scenario) => {
    setForm({
      title: scenario.title || '',
      description: scenario.description || scenario.context || '', // Fallback to context for older records
      difficultyLevel: scenario.difficultyLevel || scenario.difficulty || 'Beginner',
      options: scenario.options?.length > 0 ? scenario.options : ['', ''],
    });
    setEditingId(scenario._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scenario?')) return;
    try {
      await api(`/scenarios/${id}`, { method: 'DELETE' });
      fetchScenarios();
    } catch (err) {
      console.error('Failed to delete scenario', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="text-blue-600" /> Admin Dashboard
            </h1>
            <p className="text-slate-500">Manage scenarios and track student progress</p>
          </div>
          {!isEditing && adminTab === 'scenarios' && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} /> New Scenario
            </button>
          )}
        </div>

        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setAdminTab('scenarios')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              adminTab === 'scenarios' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database size={16} /> Scenario Manager
          </button>
          <button
            onClick={() => setAdminTab('analytics')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              adminTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={16} /> Student Progress
          </button>
          <button
            onClick={() => setAdminTab('case-studies')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              adminTab === 'case-studies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Lightbulb size={16} /> Concept Discovery
          </button>
        </div>

        {adminTab === 'analytics' ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <AdminAnalytics />
          </div>
        ) : adminTab === 'case-studies' ? (
          <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-6">
            <AdminCaseStudies />
          </div>
        ) : isEditing ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Scenario' : 'Create New Scenario'}
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
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Python Basics"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 h-24 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the concept..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <select
                  value={form.difficultyLevel}
                  onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>Beginner</option>
                  <option>Explorer</option>
                  <option>Builder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Multiple Choice Options</label>
                <div className="space-y-2">
                  {form.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        required
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Add another option
                </button>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700"
                >
                  <Save size={18} /> Save Scenario
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {scenarios.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No scenarios found. Add one to get started!</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Options Count</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scenarios.map((scenario) => (
                    <tr key={scenario._id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium">{scenario.title}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                          {scenario.difficultyLevel || scenario.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">{scenario.options?.length || 0} options</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(scenario)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(scenario._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg inline-flex"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
