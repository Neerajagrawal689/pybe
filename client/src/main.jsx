import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Brain,
  ChartNoAxesCombined,
  Code2,
  Compass,
  Lightbulb,
  MessageSquareText,
  Play,
  Route,
  Search,
  Send,
  Sparkles,
  Menu,
  X,
  Shield,
  BookOpen,
  Target
} from 'lucide-react';
import './styles.css';
import DashboardComponent from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import CaseStudyEngine from './components/CaseStudyEngine';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function api(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [filters, setFilters] = useState({ q: '', difficulty: '', concept: '' });
  const [form, setForm] = useState({ learnerName: 'Guest learner', reasoning: '', promptText: '', reflection: '' });
  const [activeResult, setActiveResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('learning');

  useEffect(() => {
    setActiveTab(currentUser?.role === 'admin' ? 'admin-dashboard' : 'learning');
  }, [currentUser]);

  const concepts = useMemo(() => [...new Set(scenarios.flatMap((scenario) => scenario.concepts || []))].sort(), [scenarios]);

  async function refresh() {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    const [scenarioData, sessionData, analyticsData, roadmapData] = await Promise.all([
      api(`/scenarios?${params}`),
      api('/sessions'),
      api('/analytics'),
      api('/roadmap')
    ]);
    setScenarios(scenarioData);
    setSessions(sessionData);
    setAnalytics(analyticsData);
    setRoadmap(roadmapData);
    setSelected((current) => current || scenarioData[0] || null);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [filters.q, filters.difficulty, filters.concept]);

  async function submitSession(event) {
    event.preventDefault();
    if (!selected || !form.reasoning.trim()) return;
    setSubmitting(true);
    try {
      const result = await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({ 
          ...form, 
          learnerName: currentUser?.username || 'Guest learner', 
          scenarioId: selected._id 
        })
      });
      setActiveResult(result);
      setForm({ ...form, reasoning: '', promptText: '', reflection: '' });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) return <main className="loading">Loading PyBe...</main>;

  return (
    <div className="flex flex-col h-screen bg-[#f4f1ea] overflow-hidden">
      <nav className="bg-[#16231f] text-[#f8f4ec] px-6 py-4 flex items-center justify-between shadow-md z-30 border-b border-[#385149] shrink-0">
        
        {/* Left Side: Menu + Brand */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-[#a9b8b1] hover:text-[#d8f07c] transition-colors"
            title="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <Brain size={28} className="text-[#d8f07c]" />
            <div>
              <strong className="block text-xl font-bold leading-none">PyBe</strong>
              <span className="text-[#a9b8b1] text-xs">Scenario-first Python</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabs + Profile/Login */}
        <div className="flex items-center gap-6">
          {currentUser?.role !== 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'learning' 
                    ? 'bg-[#d8f07c] text-[#14201c]' 
                    : 'text-[#a9b8b1] hover:text-[#d8f07c] hover:bg-[#24342f]'
                }`}
              >
                <BookOpen size={16} /> Learning Space
              </button>
              <button
                onClick={() => setActiveTab('case-studies')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'case-studies' 
                    ? 'bg-[#d8f07c] text-[#14201c]' 
                    : 'text-[#a9b8b1] hover:text-[#d8f07c] hover:bg-[#24342f]'
                }`}
              >
                <Target size={16} /> Concept Discovery
              </button>
              <button
                onClick={() => setActiveTab('student-dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'student-dashboard' 
                    ? 'bg-[#d8f07c] text-[#14201c]' 
                    : 'text-[#a9b8b1] hover:text-[#d8f07c] hover:bg-[#24342f]'
                }`}
              >
                <ChartNoAxesCombined size={16} /> Student Dashboard
              </button>
            </div>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin-dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'admin-dashboard' 
                  ? 'bg-[#d8f07c] text-[#14201c]' 
                  : 'text-[#a9b8b1] hover:text-[#d8f07c] hover:bg-[#24342f]'
              }`}
            >
              <Shield size={16} /> Admin Dashboard
            </button>
          )}

          <div className="pl-6 border-l border-[#385149]">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-[#a9b8b1] uppercase tracking-wider">Logged in as</span>
                  <strong className="text-sm text-white capitalize">{currentUser.username} ({currentUser.role})</strong>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded bg-[#24342f] text-xs text-red-400 hover:text-red-300 font-medium border border-[#385149]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2 bg-[#d8f07c] text-[#14201c] rounded-lg text-sm font-bold hover:bg-[#c9e066] transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className={`app-shell ${!isSidebarOpen ? 'sidebar-collapsed' : ''} flex-1 overflow-hidden`}>
        {isSidebarOpen && (
          <aside className="sidebar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#f8f4ec] font-bold">Scenario Browser</h3>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="text-[#a9b8b1] hover:text-[#d8f07c] transition-colors"
                title="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {currentUser?.role !== 'admin' && (
              <>
                <label className="search">
                  <Search size={18} />
                  <input
                    value={filters.q}
                    onChange={(event) => setFilters({ ...filters, q: event.target.value })}
                    placeholder="Search scenarios"
                  />
                </label>

                <select value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}>
                  <option value="">All levels</option>
                  <option>Beginner</option>
                  <option>Explorer</option>
                  <option>Builder</option>
                </select>

                <select value={filters.concept} onChange={(event) => setFilters({ ...filters, concept: event.target.value })}>
                  <option value="">All concepts</option>
                  {concepts.map((concept) => <option key={concept}>{concept}</option>)}
                </select>

                <div className="scenario-list">
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario._id}
                      className={selected?._id === scenario._id ? 'scenario active' : 'scenario'}
                      onClick={() => {
                        setSelected(scenario);
                        setActiveResult(null);
                      }}
                    >
                      <span>{scenario.difficulty}</span>
                      <strong>{scenario.title}</strong>
                      <small>{scenario.concepts.join(' / ')}</small>
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>
        )}

        <section className="workspace">
          
        {/* LEARNING TAB */}
        {activeTab === 'learning' && (
          <>
            <header className="hero">
              <div className="flex gap-4">
                <div>
                  <p>AI-native learning journey</p>
                  <h1>Learn Python by reasoning through real situations first.</h1>
                </div>
              </div>
              <div className="hero-stats">
                <span>{analytics?.scenarioCount || 0}<small>Scenarios</small></span>
                <span>{analytics?.sessionCount || 0}<small>Sessions</small></span>
                <span>{analytics?.averagePromptScore || 0}<small>Prompt score</small></span>
              </div>
            </header>

            <div className="main-grid mt-6">
              <section className="panel learning-panel">
                <div className="section-title">
                  <Compass size={20} />
                  <h2>{selected?.title}</h2>
                </div>
                <p className="context">{selected?.context}</p>
                <div className="objective-row">
                  {selected?.objectives.map((item) => <span key={item}>{item}</span>)}
                </div>
                <form onSubmit={submitSession} className="learning-form">
                  <label>
                    Your reasoning
                    <textarea
                      required
                      value={form.reasoning}
                      onChange={(event) => setForm({ ...form, reasoning: event.target.value })}
                      placeholder={selected?.prompt}
                    />
                  </label>
                  <label>
                    Prompt you would give an AI mentor
                    <textarea
                      value={form.promptText}
                      onChange={(event) => setForm({ ...form, promptText: event.target.value })}
                      placeholder="Explain my approach step by step, then show the Python concept and code..."
                    />
                  </label>
                  <label>
                    Reflection
                    <textarea
                      value={form.reflection}
                      onChange={(event) => setForm({ ...form, reflection: event.target.value })}
                      placeholder="What did you notice about your thinking?"
                    />
                  </label>
                  <button className="primary" disabled={submitting}>
                    <Send size={18} />{submitting ? 'Mapping...' : 'Map My Reasoning'}
                  </button>
                </form>
              </section>

              <section className="panel result-panel">
                <div className="section-title">
                  <Sparkles size={20} />
                  <h2>AI Mentor Output</h2>
                </div>
                {!activeResult ? <EmptyResult /> : <Result result={activeResult} />}
              </section>
            </div>

            <section className="dashboard mt-6">
              <div className="panel">
                <div className="section-title"><ChartNoAxesCombined size={20} /><h2>Learner Analytics</h2></div>
                <Analytics analytics={analytics} />
              </div>
              <div className="panel">
                <div className="section-title"><Route size={20} /><h2>Roadmap</h2></div>
                <Roadmap roadmap={roadmap} />
              </div>
              <div className="panel">
                <div className="section-title"><MessageSquareText size={20} /><h2>Recent Sessions</h2></div>
                <SessionList sessions={sessions} />
              </div>
            </section>
          </>
        )}

        {/* STUDENT DASHBOARD TAB */}
        {activeTab === 'student-dashboard' && (
          <>
            <section className="mt-2 rounded-xl border border-slate-200 shadow-sm bg-white">
              <DashboardComponent sessions={sessions} analytics={analytics} />
            </section>
          </>
        )}

        {/* CASE STUDIES TAB */}
        {activeTab === 'case-studies' && (
          <section className="rounded-xl border border-[#e7dfd2] shadow-sm bg-[#fffdf7]">
            <CaseStudyEngine />
          </section>
        )}

        {/* ADMIN DASHBOARD TAB */}
        {activeTab === 'admin-dashboard' && currentUser?.role === 'admin' && (
          <section className="rounded-xl border border-slate-200 shadow-sm bg-white">
            <AdminDashboard />
          </section>
        )}

      </section>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <Auth 
          onLogin={(data) => {
            setCurrentUser(data.user);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      </main>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="empty">
      <Lightbulb size={38} />
      <p>Submit reasoning to see abstraction mapping, Python code, prompt feedback, and misconception signals.</p>
    </div>
  );
}

function Result({ result }) {
  return (
    <div className="result-stack">
      <div className="score"><span>{result.promptScore}</span><small>Prompt maturity</small></div>
      <div>
        {result.abstractionMap.map((item) => (
          <article className="mapping" key={item.pattern}>
            <strong>{item.pattern}</strong>
            <span>{item.pythonConcept}</span>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>
      <div className="code-block">
        <div><Code2 size={18} /> Generated Python</div>
        <pre>{result.generatedCode}</pre>
        <p>{result.codeExplanation}</p>
      </div>
      <ul className="feedback">
        {result.promptFeedback.map((item) => <li key={item}>{item}</li>)}
      </ul>
      {result.misconceptions.length > 0 && (
        <div className="note">
          <strong>Misconception watch</strong>
          {result.misconceptions.map((item) => <p key={item}>{item}</p>)}
        </div>
      )}
    </div>
  );
}

function Analytics({ analytics }) {
  const concepts = Object.entries(analytics?.conceptCounts || {});
  return (
    <div className="analytics-list">
      {concepts.length ? concepts.map(([name, count]) => (
        <div key={name}>
          <span>{name}</span>
          <meter min="0" max="10" value={count}></meter>
          <strong>{count}</strong>
        </div>
      )) : <p>No learning sessions yet.</p>}
    </div>
  );
}

function Roadmap({ roadmap }) {
  return (
    <div className="roadmap">
      {roadmap.map((phase) => (
        <article key={phase.phase}>
          <strong>{phase.phase}</strong>
          <div>
            <h3>{phase.title}</h3>
            <p>{phase.summary}</p>
            <small>{phase.items.join(' / ')}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function SessionList({ sessions }) {
  return (
    <div className="sessions">
      {sessions.length ? sessions.slice(0, 6).map((session) => (
        <article key={session._id}>
          <Play size={16} />
          <div>
            <strong>{session.scenario?.title}</strong>
            <span>{session.masterySignals.join(' / ')}</span>
          </div>
        </article>
      )) : <p>No sessions yet.</p>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
