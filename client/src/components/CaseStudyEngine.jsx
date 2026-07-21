import React, { useState, useEffect } from 'react';
import { Target, Sparkles, ChevronRight, CheckCircle2, AlertCircle, BookOpen, Brain } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CaseStudyEngine() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [userLogicText, setUserLogicText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const response = await fetch(`${API_URL}/scenarios/case-studies`);
        const data = await response.json();
        setScenarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchScenarios();
  }, []);

  const currentScenario = scenarios[currentIndex];

  const toggleChip = (chip) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const analyzeLogic = async () => {
    if (!userLogicText.trim() && selectedChips.length === 0) return;
    setAnalyzing(true);
    
    try {
      const response = await fetch(`${API_URL}/scenarios/evaluate-logic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: currentScenario.id,
          userLogicText,
          selectedChips
        })
      });
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const nextScenario = () => {
    setUserLogicText('');
    setSelectedChips([]);
    setFeedback(null);
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#fffdf7] p-8 flex justify-center text-[#7b867f] animate-pulse">Loading Discovery Engine...</div>;
  }

  if (!currentScenario) {
    return <div className="min-h-screen bg-[#fffdf7] p-8 flex justify-center text-[#7b867f]">No case studies available.</div>;
  }

  return (
    <div className="bg-[#fffdf7] min-h-[500px] rounded-xl overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#16231f] to-[#24342f] p-8 text-[#f8f4ec] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Brain size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#d8f07c]/20 rounded-lg text-[#d8f07c]">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Concept Discovery Engine</h2>
          </div>
          <p className="text-[#a9b8b1] max-w-lg">
            Analyze real-world scenarios and discover the underlying logic without writing a single line of syntax.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8 space-y-8">
        
        {/* Scenario Card */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7dfd2]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest text-[#66730a] uppercase bg-[#e7f2cb] px-3 py-1 rounded-full">
              Level {currentIndex + 1} of {scenarios.length}
            </span>
            {feedback && (
              <span className="text-sm font-bold text-[#16231f]">Score: {feedback.score}/100</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#16231f] mb-4">{currentScenario.title}</h3>
          <p className="text-lg text-[#52605b] leading-relaxed">
            {currentScenario.description}
          </p>
        </div>

        {/* Student Workspace */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7dfd2] relative">
          <h4 className="text-lg font-bold text-[#16231f] mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-[#66730a]" />
            Your Logical Breakdown
          </h4>
          
          <div className="mb-6 flex flex-wrap gap-2">
            {currentScenario.availableChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => toggleChip(chip)}
                disabled={feedback !== null}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedChips.includes(chip) 
                    ? 'bg-[#16231f] text-[#d8f07c] shadow-md transform scale-105' 
                    : 'bg-[#f4f1ea] text-[#7b867f] hover:bg-[#e7dfd2] hover:text-[#16231f]'
                } ${feedback !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {chip}
              </button>
            ))}
          </div>

          <textarea
            value={userLogicText}
            onChange={(e) => setUserLogicText(e.target.value)}
            disabled={feedback !== null}
            placeholder="Explain how you would solve this conceptually. What properties does your data need to have?"
            className="w-full h-40 p-4 bg-[#f4f1ea] border border-[#e7dfd2] rounded-xl focus:outline-none focus:border-[#16231f] focus:ring-1 focus:ring-[#16231f] resize-none text-[#16231f] placeholder:text-[#a9b8b1] disabled:opacity-50"
          />

          {!feedback && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={analyzeLogic}
                disabled={analyzing || (!userLogicText.trim() && selectedChips.length === 0)}
                className="flex items-center gap-2 px-6 py-3 bg-[#d8f07c] text-[#16231f] font-bold rounded-xl hover:bg-[#c5e064] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <Sparkles className="animate-spin" size={20} />
                    Analyzing Logic...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze Logic
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Feedback Panel */}
        {feedback && (
          <div className="animate-fade-in-up bg-[#16231f] rounded-2xl p-8 shadow-xl text-[#f8f4ec] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target size={120} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  {feedback.conceptMatch ? (
                     <div className="w-12 h-12 rounded-full bg-[#d8f07c] flex items-center justify-center text-[#16231f]">
                        <CheckCircle2 size={28} />
                     </div>
                  ) : (
                     <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-[#16231f]">
                        <AlertCircle size={28} />
                     </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold">
                      {feedback.conceptMatch ? 'Concept Successfully Discovered!' : 'Partial Concept Match'}
                    </h4>
                    <p className="text-[#d8f07c] font-medium text-lg">
                      🎯 Target Concept: {feedback.discoveredConcept}
                    </p>
                  </div>
                </div>

                <div className="bg-[#24342f] p-6 rounded-xl border border-[#30443d] mb-6">
                  <p className="text-lg leading-relaxed">{feedback.aiFeedback}</p>
                </div>

                <div className="flex justify-end">
                  {currentIndex < scenarios.length - 1 ? (
                    <button
                      onClick={nextScenario}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-[#16231f] font-bold rounded-xl hover:bg-[#f4f1ea] transition-colors"
                    >
                      Next Case Study
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-2 px-6 py-3 bg-[#30443d] text-[#7b867f] font-bold rounded-xl"
                    >
                      All Scenarios Completed
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
