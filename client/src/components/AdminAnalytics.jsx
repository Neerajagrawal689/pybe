import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Users, TrendingUp, Award, Zap, Activity, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PAGE_SIZE = 15;

// Generate 1000 dummy students for the demo!
const mockStudents = Array.from({ length: 1000 }).map((_, i) => ({
  name: `Student ${i + 1} (Demo)`,
  totalSessions: Math.floor(Math.random() * 50) + 1,
  averagePromptScore: Math.floor(Math.random() * 10) + 1,
  conceptsLearned: Math.floor(Math.random() * 10) + 1,
}));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-600 bg-red-50 rounded-xl m-4 border border-red-200">
          <h2 className="font-bold text-xl mb-2">Analytics Engine Crashed</h2>
          <p className="mb-4 text-sm">Please share this error message with the AI:</p>
          <pre className="text-xs overflow-auto bg-white p-4 rounded border border-red-100">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminAnalyticsContent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch(`${API_URL}/analytics/students`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <div className="p-12 flex justify-center text-[#7b867f] animate-pulse">Loading analytics engine...</div>;

  const baseData = students.length > 0 ? students : mockStudents;
  const isDemo = students.length === 0;

  // Search filter
  const filteredData = baseData.filter((s) => 
    (s?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  // Pagination for table
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const tableData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Charts only show Top 15 of the current filter so they don't get squished
  const chartData = filteredData.slice(0, 15);

  return (
    <div className="bg-[#fffdf7] min-h-full">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#16231f] to-[#24342f] p-8 text-[#f8f4ec] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#d8f07c]/20 rounded-lg text-[#d8f07c]">
              <Users size={28} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Student Progress Engine</h2>
          </div>
          <p className="text-[#a9b8b1] max-w-lg">
            Monitor learning trajectories, prompt maturity, and concept mastery across your entire student base.
          </p>
        </div>
      </div>

      <div className="p-8">
        {isDemo && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
            <Zap size={18} className="text-blue-500" />
            Showing demo data. Once students complete sessions, real data will appear here.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Chart 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7dfd2] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="text-[#16231f]" size={20} />
                <h3 className="font-bold text-[#16231f]">Total Sessions Completed</h3>
              </div>
              <span className="text-xs text-[#a9b8b1] font-semibold">Top {chartData.length} Shown</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7dfd2" />
                  <XAxis dataKey="name" tick={{ fill: '#7b867f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#7b867f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f4f1ea' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalSessions" name="Sessions" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#16231f' : '#24342f'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7dfd2] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="text-[#66730a]" size={20} />
                <h3 className="font-bold text-[#16231f]">Average Prompt Score</h3>
              </div>
              <span className="text-xs text-[#a9b8b1] font-semibold">Top {chartData.length} Shown</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7dfd2" />
                  <XAxis dataKey="name" tick={{ fill: '#7b867f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#7b867f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f4f1ea' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="averagePromptScore" name="Avg Score" fill="#d8f07c" radius={[6, 6, 0, 0]}>
                     {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.averagePromptScore >= 8 ? '#d8f07c' : entry.averagePromptScore >= 5 ? '#e7f2cb' : '#f4f1ea'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Table Header */}
        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-xl font-bold text-[#16231f]">Student Directory</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a9b8b1]" size={18} />
            <input 
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#e7dfd2] rounded-xl focus:outline-none focus:border-[#16231f] w-64 bg-white"
            />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7dfd2]">
          <div className="bg-[#f4f1ea] px-6 py-4 grid grid-cols-4 gap-4 border-b border-[#e7dfd2]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#52605b]">Learner</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#52605b]">Sessions</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#52605b]">Prompt Mastery</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#52605b]">Concepts</div>
          </div>
          <div className="divide-y divide-[#f4f1ea]">
            {tableData.map((student, i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-4 gap-4 items-center hover:bg-[#fffdf7] transition-colors group">
                <div className="font-bold text-[#16231f] capitalize flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#16231f] text-[#d8f07c] flex items-center justify-center text-xs font-bold">
                    {(student?.name || '?').charAt(0)}
                  </div>
                  {student?.name || 'Unknown'}
                </div>
                <div className="text-[#52605b] font-medium">{student?.totalSessions || 0} completed</div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    student.averagePromptScore >= 8 ? 'bg-[#d8f07c] text-[#16231f]' : 
                    student.averagePromptScore >= 5 ? 'bg-[#e7dfd2] text-[#16231f]' : 
                    'bg-[#f4f1ea] text-[#7b867f]'
                  }`}>
                    {student.averagePromptScore} / 10 Score
                  </span>
                </div>
                <div className="text-[#52605b] font-medium flex items-center gap-2">
                  {student?.conceptsLearned || 0} unique
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
               <div className="p-12 text-center text-[#7b867f] font-medium">No students found matching your search.</div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredData.length > PAGE_SIZE && (
            <div className="bg-[#f4f1ea] px-6 py-3 flex items-center justify-between border-t border-[#e7dfd2]">
              <span className="text-xs font-medium text-[#7b867f]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length} students
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-[#d4cdc0] bg-white text-[#16231f] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f4ec] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-[#d4cdc0] bg-white text-[#16231f] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f4ec] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <ErrorBoundary>
      <AdminAnalyticsContent />
    </ErrorBoundary>
  );
}
