import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { BookOpen, Brain, Target, Trophy, Activity } from 'lucide-react';

const Dashboard = ({ sessions = [], analytics = null }) => {
  // Dynamically compute session history for the line chart
  const sessionData = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    
    // Reverse to show chronological order if sessions are latest-first, 
    // assuming they come in chronological order, we just map them:
    const data = [...sessions].reverse().map((session, index) => {
      return {
        session: `S${index + 1}`,
        score: session.promptScore || 0,
        average: 70 // Static class average benchmark
      };
    });
    
    // If only one session exists, duplicate it so the line chart can draw a line
    if (data.length === 1) {
      return [...data, { ...data[0], session: 'S2 (Proj.)' }];
    }
    return data;
  }, [sessions]);

  // Dynamically compute skill matrix (concept counts mapped to 1-100 scale for visual impact)
  const skillData = useMemo(() => {
    if (!analytics?.conceptCounts || Object.keys(analytics.conceptCounts).length === 0) {
      // Fallback data if no concepts have been learned yet
      return [
        { subject: 'Variables', A: 10 },
        { subject: 'Loops', A: 10 },
        { subject: 'Conditionals', A: 10 },
        { subject: 'Functions', A: 10 }
      ];
    }

    const concepts = Object.entries(analytics.conceptCounts);
    // Find max value to scale the radar chart properly
    const maxCount = Math.max(...concepts.map(([, count]) => count), 1);
    
    return concepts.map(([subject, count]) => ({
      subject,
      A: Math.round((count / maxCount) * 100), // Scale to 100 for better radar visualization
    })).slice(0, 6); // Limit to top 6 concepts to keep chart clean
  }, [analytics]);

  // Dynamically compute high-level stats
  const stats = useMemo(() => {
    const accuracy = sessions?.length > 0 
      ? Math.round((sessions.filter(s => !s.misconceptions || s.misconceptions.length === 0).length / sessions.length) * 100)
      : 0;
      
    return [
      { 
        title: "Average Score", 
        value: analytics?.averagePromptScore || 0, 
        change: "Pts", 
        icon: Trophy, 
        color: "text-yellow-500", 
        bg: "bg-yellow-50" 
      },
      { 
        title: "Topics Mastered", 
        value: Object.keys(analytics?.conceptCounts || {}).length, 
        change: "Concepts", 
        icon: Brain, 
        color: "text-emerald-500", 
        bg: "bg-emerald-50" 
      },
      { 
        title: "Total Sessions", 
        value: analytics?.sessionCount || 0, 
        change: "Completed", 
        icon: BookOpen, 
        color: "text-blue-500", 
        bg: "bg-blue-50" 
      },
      { 
        title: "Accuracy Rate", 
        value: `${accuracy}%`, 
        change: "Clean runs", 
        icon: Target, 
        color: "text-purple-500", 
        bg: "bg-purple-50" 
      },
    ];
  }, [sessions, analytics]);

  if (!analytics && sessions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
        <Activity className="w-12 h-12 mb-4 text-slate-300" />
        <p>No learning data available yet.</p>
        <p className="text-sm">Complete some scenarios to unlock your dashboard!</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 w-full">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Progress Dashboard</h1>
          <p className="text-slate-500">Track your learning journey and skill development in real-time.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                    <span className="text-sm font-medium text-slate-400">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Progress Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Learning Progress</h2>
              <p className="text-sm text-slate-500">Your score history across recent sessions</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="session" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    type="monotone" 
                    name="Your Score"
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: 'white' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    name="Class Average"
                    dataKey="average" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Matrix Radar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Concept Mastery</h2>
              <p className="text-sm text-slate-500">Your strength in different Python concepts</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Mastery Level"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.4}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
