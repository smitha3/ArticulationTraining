import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, TrendingUp, Calendar, Award, ChevronRight, Mic, Clock, Target, Zap, BarChart3, Sparkles, MessageSquare, AlertCircle, BookOpen, Lightbulb, RefreshCw, X } from 'lucide-react';

// Custom hook for persistent storage
const useStorage = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get(key);
        if (result && result.value) {
          setValue(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No existing data found');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [key]);

  const updateValue = async (newValue) => {
    setValue(newValue);
    try {
      await window.storage.set(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  return [value, updateValue, loading];
};

const ArticulationTrainer = () => {
  const [currentDay, setCurrentDay] = useStorage('currentDay', 1);
  const [sessions, setSessions] = useStorage('sessions', []);
  const [activePhase, setActivePhase] = useState(null);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [todaySession, setTodaySession] = useState({
    topic: '',
    structureNotes: '',
    scores: { clarity: 0, conciseness: 0, flow: 0, fillers: 0 },
    compressionNotes: '',
    refinementFocus: '',
    completed: false,
    taskChecklist: {},
    learningCategory: ''
  });
  const [view, setView] = useState('home');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [speechInput, setSpeechInput] = useState('');
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const learningCategories = [
    { name: 'Business Concepts', icon: '💼', color: 'from-blue-600 to-cyan-500' },
    { name: 'Stock Trading', icon: '📈', color: 'from-green-600 to-emerald-500' },
    { name: 'Options Trading', icon: '📊', color: 'from-purple-600 to-pink-500' },
    { name: 'Organizational Behavior', icon: '👥', color: 'from-orange-600 to-red-500' },
    { name: 'Psychology', icon: '🧠', color: 'from-indigo-600 to-purple-500' },
    { name: 'Philosophy', icon: '🤔', color: 'from-yellow-600 to-orange-500' },
    { name: 'Science', icon: '🔬', color: 'from-teal-600 to-cyan-500' },
    { name: 'Technology', icon: '💻', color: 'from-violet-600 to-fuchsia-500' },
    { name: 'Economics', icon: '💰', color: 'from-amber-600 to-yellow-500' },
    { name: 'Surprise Me', icon: '🎲', color: 'from-pink-600 to-rose-500' }
  ];

  const phases = [
    {
      id: 1,
      name: 'Structure Training',
      duration: 10,
      icon: Target,
      color: 'from-blue-500 to-cyan-400',
      description: 'Organize your thoughts before speaking',
      tasks: [
        'Pick a topic (or get AI suggestions)',
        'Structure it: Context → 3 Key Points → Conclusion',
        'Write bullet points only (under 5 minutes)'
      ],
      aiPrompt: (topic, notes, category) => `Analyze this communication structure for clarity and organization:

Topic: ${topic || 'Not provided'}
Learning Category: ${category || 'General'}
Structure Notes:
${notes || 'Not provided'}

Provide specific feedback on:
1. Clarity of the main message and how well it explains the concept
2. Logical flow of the three points
3. Strength of the conclusion
4. Educational value - does this structure help someone learn?
5. Suggestions for improvement

Keep feedback actionable and encouraging. Focus on both articulation AND learning.`
    },
    {
      id: 2,
      name: 'Recorded Speaking',
      duration: 15,
      icon: Mic,
      color: 'from-purple-500 to-pink-400',
      description: 'Core articulation practice',
      tasks: [
        'Record yourself speaking for 3-5 minutes on your topic',
        'Listen back immediately',
        'Score yourself on clarity, conciseness, flow, and filler words',
        'Track your scores'
      ],
      aiPrompt: (transcript, scores, topic, category) => `Analyze this speaking performance:

Topic: ${topic || 'Not provided'}
Category: ${category || 'General'}
Transcript/Notes: ${transcript || 'Paste your transcript or describe your speaking patterns here'}

Self-Assessment Scores (1-10):
- Clarity: ${scores.clarity}
- Conciseness: ${scores.conciseness}
- Flow: ${scores.flow}
- Filler Words: ${scores.fillers}

Provide:
1. Assessment of filler word usage patterns
2. Suggestions for improving clarity when explaining complex concepts
3. Tips for more concise delivery
4. How well you explained the topic - could a beginner understand it?
5. One specific exercise to practice this week

Be specific and actionable.`
    },
    {
      id: 3,
      name: 'Compression Drill',
      duration: 10,
      icon: Zap,
      color: 'from-orange-500 to-red-400',
      description: 'Distill to the essence',
      tasks: [
        'Explain the same topic in 60 seconds',
        'Now in 30 seconds',
        'Now in just 15 seconds',
        'Record your 30-second version'
      ],
      aiPrompt: (topic, compressionNotes, category) => `Help compress and refine this message:

Topic: ${topic || 'Not provided'}
Category: ${category || 'General'}
Current attempts at compression:
${compressionNotes || 'Not provided'}

Provide:
1. A model 30-second version that captures the essence
2. Key phrases to use for maximum impact
3. What to eliminate vs. what's essential for understanding
4. How to maintain educational value while being brief
5. Tips for saying more with less

Focus on precision, impact, and teaching effectiveness.`
    },
    {
      id: 4,
      name: 'Precision Upgrade',
      duration: 10,
      icon: Award,
      color: 'from-green-500 to-emerald-400',
      description: 'Refine one specific skill',
      tasks: [
        'Choose ONE focus: precise words, intentional pauses, or smooth transitions',
        'Practice this skill deliberately',
        'Small refinements compound over time'
      ],
      aiPrompt: (focus, example, topic, category) => `Help improve this specific communication skill:

Focus Area: ${focus || 'Not selected'}
Topic Context: ${topic || 'Not provided'}
Category: ${category || 'General'}
Example or context: ${example || 'Not provided'}

Provide:
1. Three specific techniques for improving this skill
2. Common mistakes to avoid when explaining complex topics
3. A practice exercise for tomorrow
4. Before/after examples demonstrating the improvement
5. How this skill helps in teaching and explaining concepts

Make it immediately actionable.`
    }
  ];

  const refinementOptions = [
    'Replace vague words with precise language',
    'Practice slowing down with 1-second pauses',
    'Improve transitions and signposting'
  ];

  // Get AI topic suggestions
  const getTopicSuggestions = async (category) => {
    setIsLoadingTopics(true);
    setSelectedCategory(category);
    
    try {
      const prompt = category === 'Surprise Me' 
        ? `Generate 5 fascinating and intellectually stimulating topics that would make excellent practice for articulation training. Mix categories including business, trading, psychology, philosophy, science, technology, and economics. 

For each topic, provide:
1. A compelling title (10-15 words)
2. A brief hook (2-3 sentences) explaining why this topic is interesting and valuable to learn
3. The difficulty level (Beginner/Intermediate/Advanced)

Format as JSON array:
[
  {
    "title": "topic title",
    "description": "why this matters",
    "difficulty": "level",
    "category": "which field"
  }
]

Make these topics intellectually rich but accessible. Focus on topics that will help someone both practice articulation AND learn something valuable.`
        : `Generate 5 engaging topics about ${category} that would make excellent practice for articulation training while teaching valuable concepts.

For each topic, provide:
1. A compelling title (10-15 words)
2. A brief hook (2-3 sentences) explaining why this topic is interesting and valuable to learn
3. The difficulty level (Beginner/Intermediate/Advanced)
4. Key learning points (what will they understand after explaining this)

Format as JSON array:
[
  {
    "title": "topic title",
    "description": "why this matters and what you'll learn",
    "difficulty": "level",
    "keyPoints": ["point 1", "point 2", "point 3"]
  }
]

Make topics intellectually stimulating, practical, and genuinely educational. Range from fundamental concepts to more advanced ideas.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: prompt
            }
          ],
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        const text = data.content[0].text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const topics = JSON.parse(jsonMatch[0]);
          setTopicSuggestions(topics);
          setShowTopicSuggestions(true);
        } else {
          setTopicSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Topic generation error:', error);
      setTopicSuggestions([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const selectTopic = (topic) => {
    setTodaySession({
      ...todaySession,
      topic: topic.title,
      learningCategory: topic.category || selectedCategory
    });
    setShowTopicSuggestions(false);
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isTimerRunning && phaseTimer > 0) {
      interval = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, phaseTimer]);

  const startPhase = (phase) => {
    setActivePhase(phase);
    setPhaseTimer(phase.duration * 60);
    setIsTimerRunning(true);
    setView('workout');
    setAiAnalysis('');
    setSpeechInput('');
    setShowTopicSuggestions(false);
    
    // Initialize checklist for this phase
    const initialChecklist = {};
    phase.tasks.forEach((_, index) => {
      initialChecklist[index] = false;
    });
    setTodaySession({
      ...todaySession,
      taskChecklist: initialChecklist
    });
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    if (activePhase) {
      setPhaseTimer(activePhase.duration * 60);
      setIsTimerRunning(false);
    }
  };

  const toggleTask = (taskIndex) => {
    setTodaySession({
      ...todaySession,
      taskChecklist: {
        ...todaySession.taskChecklist,
        [taskIndex]: !todaySession.taskChecklist[taskIndex]
      }
    });
  };

  const getAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    
    try {
      let prompt = '';
      
      // Build prompt based on current phase
      switch(activePhase.id) {
        case 1:
          prompt = activePhase.aiPrompt(todaySession.topic, todaySession.structureNotes, todaySession.learningCategory);
          break;
        case 2:
          prompt = activePhase.aiPrompt(speechInput, todaySession.scores, todaySession.topic, todaySession.learningCategory);
          break;
        case 3:
          prompt = activePhase.aiPrompt(todaySession.topic, todaySession.compressionNotes, todaySession.learningCategory);
          break;
        case 4:
          prompt = activePhase.aiPrompt(todaySession.refinementFocus, speechInput, todaySession.topic, todaySession.learningCategory);
          break;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: prompt
            }
          ],
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        setAiAnalysis(data.content[0].text);
      } else {
        setAiAnalysis('Unable to generate analysis. Please try again.');
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiAnalysis('Error connecting to AI. Please check your input and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completeSession = async () => {
    const newSession = {
      ...todaySession,
      day: currentDay,
      date: new Date().toISOString(),
      completed: true,
      aiAnalysis: aiAnalysis
    };
    
    const updatedSessions = [...sessions, newSession];
    await setSessions(updatedSessions);
    await setCurrentDay(currentDay + 1);
    
    setTodaySession({
      topic: '',
      structureNotes: '',
      scores: { clarity: 0, conciseness: 0, flow: 0, fillers: 0 },
      compressionNotes: '',
      refinementFocus: '',
      completed: false,
      taskChecklist: {},
      learningCategory: ''
    });
    
    setView('home');
    setActivePhase(null);
    setAiAnalysis('');
    setSpeechInput('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getAverageScores = () => {
    if (sessions.length === 0) return null;
    const totals = { clarity: 0, conciseness: 0, flow: 0, fillers: 0 };
    sessions.forEach(session => {
      totals.clarity += session.scores.clarity;
      totals.conciseness += session.scores.conciseness;
      totals.flow += session.scores.flow;
      totals.fillers += session.scores.fillers;
    });
    return {
      clarity: (totals.clarity / sessions.length).toFixed(1),
      conciseness: (totals.conciseness / sessions.length).toFixed(1),
      flow: (totals.flow / sessions.length).toFixed(1),
      fillers: (totals.fillers / sessions.length).toFixed(1)
    };
  };

  const getCategoryStats = () => {
    if (sessions.length === 0) return {};
    const stats = {};
    sessions.forEach(session => {
      if (session.learningCategory) {
        stats[session.learningCategory] = (stats[session.learningCategory] || 0) + 1;
      }
    });
    return stats;
  };

  // Home View
  if (view === 'home') {
    const streak = calculateStreak();
    const avgScores = getAverageScores();
    const categoryStats = getCategoryStats();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
          
          * {
            font-family: 'Outfit', sans-serif;
          }
          
          .mono {
            font-family: 'Space Mono', monospace;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          
          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
          
          .pulse-subtle {
            animation: pulse 2s ease-in-out infinite;
          }
          
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
          
          .float {
            animation: float 3s ease-in-out infinite;
          }
          
          .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .glow {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>

        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 fade-in">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="gradient-text">Articulation</span>
              <span className="text-white"> Mastery</span>
            </h1>
            <div className="text-right">
              <div className="text-sm text-slate-400 mono">YOUR PROGRESS</div>
              <div className="text-4xl font-bold gradient-text">{currentDay}/30</div>
            </div>
          </div>
          <p className="text-slate-400 text-lg">Master communication while learning fascinating topics across multiple fields</p>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6 fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-3">
              <Calendar className="text-blue-400" size={28} />
              <span className="text-3xl font-bold mono">{streak}</span>
            </div>
            <div className="text-slate-400 text-sm">Day Streak</div>
          </div>
          
          <div className="glass rounded-2xl p-6 fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="text-green-400" size={28} />
              <span className="text-3xl font-bold mono">{sessions.length}</span>
            </div>
            <div className="text-slate-400 text-sm">Sessions Complete</div>
          </div>
          
          <div className="glass rounded-2xl p-6 fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="text-purple-400" size={28} />
              <span className="text-3xl font-bold mono">
                {Object.keys(categoryStats).length}
              </span>
            </div>
            <div className="text-slate-400 text-sm">Topics Explored</div>
          </div>
        </div>

        {/* Learning Categories */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="glass rounded-3xl p-8 fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="text-yellow-400 float" size={32} />
              <div>
                <h2 className="text-3xl font-bold">Choose Your Learning Path</h2>
                <p className="text-slate-400">Practice articulation while expanding your knowledge</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {learningCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => getTopicSuggestions(category.name)}
                  className="glass rounded-xl p-6 hover:scale-105 transition-all fade-in text-center"
                  style={{animationDelay: `${0.5 + index * 0.05}s`}}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="font-semibold text-sm">{category.name}</div>
                </button>
              ))}
            </div>

            {isLoadingTopics && (
              <div className="mt-8 text-center">
                <div className="shimmer h-4 bg-slate-700 rounded mb-3"></div>
                <div className="shimmer h-4 bg-slate-700 rounded mb-3" style={{width: '80%', margin: '0 auto'}}></div>
                <p className="text-slate-400 mt-4">Generating topics for {selectedCategory}...</p>
              </div>
            )}

            {showTopicSuggestions && topicSuggestions.length > 0 && (
              <div className="mt-8 space-y-4 fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">AI-Generated Topics: {selectedCategory}</h3>
                  <button
                    onClick={() => getTopicSuggestions(selectedCategory)}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Generate New
                  </button>
                </div>
                {topicSuggestions.map((topic, index) => (
                  <div
                    key={index}
                    onClick={() => selectTopic(topic)}
                    className="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-lg flex-1">{topic.title}</h4>
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 ml-4">
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{topic.description}</p>
                    {topic.keyPoints && (
                      <div className="flex flex-wrap gap-2">
                        {topic.keyPoints.map((point, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                            {point}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Workout */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="glass rounded-3xl p-8 fade-in" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Day {currentDay} Workout
              </h2>
              <div className="flex items-center gap-2 text-yellow-400">
                <Sparkles size={20} />
                <span className="text-sm font-semibold">AI-Powered</span>
              </div>
            </div>
            
            {todaySession.topic && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="text-sm text-blue-400 mb-1">Today's Topic:</div>
                <div className="font-bold text-lg">{todaySession.topic}</div>
                {todaySession.learningCategory && (
                  <div className="text-sm text-slate-400 mt-1">Category: {todaySession.learningCategory}</div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id}
                  className="glass rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer fade-in"
                  style={{animationDelay: `${0.7 + index * 0.1}s`}}
                  onClick={() => startPhase(phase)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center mb-4`}>
                    <phase.icon className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{phase.name}</h3>
                  <div className="text-slate-400 text-sm mb-3">{phase.description}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mono">
                    <Clock size={14} />
                    {phase.duration} min
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => startPhase(phases[0])}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all pulse-subtle"
            >
              <Play size={20} />
              Start Today's Training
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Progress Button */}
        <div className="max-w-6xl mx-auto fade-in" style={{animationDelay: '0.9s'}}>
          <button
            onClick={() => setView('progress')}
            className="w-full glass rounded-2xl p-6 hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">View Progress Dashboard</div>
                <div className="text-slate-400 text-sm">Track your improvement over time</div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={24} />
          </button>
        </div>
      </div>
    );
  }

  // Workout View
  if (view === 'workout' && activePhase) {
    const PhaseIcon = activePhase.icon;
    const progress = ((activePhase.duration * 60 - phaseTimer) / (activePhase.duration * 60)) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 fade-in">
            <button
              onClick={() => setView('home')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div className="text-slate-400 mono text-sm">
              Phase {activePhase.id}/4
            </div>
          </div>

          {/* Current Topic Display */}
          {todaySession.topic && (
            <div className="glass rounded-2xl p-6 mb-8 fade-in">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-blue-400" size={20} />
                <span className="text-slate-400 text-sm">Current Topic:</span>
              </div>
              <div className="font-bold text-xl">{todaySession.topic}</div>
              {todaySession.learningCategory && (
                <div className="text-slate-400 text-sm mt-2">{todaySession.learningCategory}</div>
              )}
            </div>
          )}

          {/* Timer Display */}
          <div className="glass rounded-3xl p-12 text-center mb-8 fade-in">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activePhase.color} flex items-center justify-center mx-auto mb-6`}>
              <PhaseIcon className="text-white" size={40} />
            </div>
            
            <h2 className="text-4xl font-bold mb-3">{activePhase.name}</h2>
            <p className="text-slate-400 text-lg mb-8">{activePhase.description}</p>
            
            <div className="text-8xl font-bold mono mb-8 gradient-text">
              {formatTime(phaseTimer)}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-8">
              <div 
                className={`h-full bg-gradient-to-r ${activePhase.color} transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={toggleTimer}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 transition-all"
              >
                {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
              
              <button
                onClick={resetTimer}
                className="glass hover:bg-white/10 font-bold py-4 px-8 rounded-xl flex items-center gap-2 transition-all"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* Tasks Checklist */}
          <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.2s'}}>
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Target size={24} />
              Your Tasks
            </h3>
            <div className="space-y-4">
              {activePhase.tasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => toggleTask(index)}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${
                      todaySession.taskChecklist[index] 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-slate-600'
                    }`}
                  >
                    {todaySession.taskChecklist[index] && (
                      <Check size={16} className="text-white" />
                    )}
                  </div>
                  <div className={`text-slate-300 ${todaySession.taskChecklist[index] ? 'line-through opacity-60' : ''}`}>
                    {task}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Suggestions Button (Phase 1 only) */}
          {activePhase.id === 1 && !todaySession.topic && (
            <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-center">
                <Lightbulb className="mx-auto mb-4 text-yellow-400" size={48} />
                <h3 className="font-bold text-xl mb-3">Need a Topic?</h3>
                <p className="text-slate-400 mb-6">Get AI-generated topic suggestions to practice with</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {learningCategories.slice(0, 6).map((category, index) => (
                    <button
                      key={index}
                      onClick={() => getTopicSuggestions(category.name)}
                      className="glass hover:bg-white/10 p-4 rounded-xl transition-all"
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-semibold">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Topic Loading */}
          {isLoadingTopics && (
            <div className="glass rounded-2xl p-8 mb-8 text-center fade-in">
              <div className="shimmer h-4 bg-slate-700 rounded mb-3"></div>
              <div className="shimmer h-4 bg-slate-700 rounded mb-3" style={{width: '80%', margin: '0 auto'}}></div>
              <p className="text-slate-400 mt-4">Generating topics...</p>
            </div>
          )}

          {/* Topic Suggestions Display */}
          {showTopicSuggestions && topicSuggestions.length > 0 && (
            <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Pick a Topic</h3>
                <button
                  onClick={() => getTopicSuggestions(selectedCategory)}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                >
                  <RefreshCw size={16} />
                  New Topics
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topicSuggestions.map((topic, index) => (
                  <div
                    key={index}
                    onClick={() => selectTopic(topic)}
                    className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold flex-1">{topic.title}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 ml-3">
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase-specific Input */}
          {activePhase.id === 1 && (
            <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.4s'}}>
              <h3 className="font-bold text-xl mb-4">Structure Your Thoughts</h3>
              <input
                type="text"
                placeholder="Today's topic..."
                value={todaySession.topic}
                onChange={(e) => setTodaySession({...todaySession, topic: e.target.value})}
                className="w-full bg-slate-800 text-white p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Write your structure:&#10;1. Context: [What is this about?]&#10;2. Three Key Points: [Point 1], [Point 2], [Point 3]&#10;3. Conclusion: [Your takeaway]"
                value={todaySession.structureNotes}
                onChange={(e) => setTodaySession({...todaySession, structureNotes: e.target.value})}
                className="w-full bg-slate-800 text-white p-4 rounded-xl h-48 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {activePhase.id === 2 && (
            <>
              <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.3s'}}>
                <h3 className="font-bold text-xl mb-4">Transcript or Speaking Notes</h3>
                <textarea
                  placeholder="Paste your transcript here or describe your speaking patterns (filler words, pace, clarity issues)..."
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                  className="w-full bg-slate-800 text-white p-4 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
                />
                <div className="text-slate-400 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Tip: Record yourself, then transcribe or note patterns you noticed</span>
                </div>
              </div>
              
              <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.4s'}}>
                <h3 className="font-bold text-xl mb-4">Score Your Speaking (1-10)</h3>
                <div className="grid grid-cols-2 gap-6">
                  {Object.keys(todaySession.scores).map((score) => (
                    <div key={score}>
                      <label className="text-slate-400 text-sm mb-2 block capitalize">{score}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={todaySession.scores[score]}
                        onChange={(e) => setTodaySession({
                          ...todaySession,
                          scores: {...todaySession.scores, [score]: parseInt(e.target.value)}
                        })}
                        className="w-full"
                      />
                      <div className="text-center font-bold text-2xl mono mt-2 gradient-text">
                        {todaySession.scores[score]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activePhase.id === 3 && (
            <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.3s'}}>
              <h3 className="font-bold text-xl mb-4">Compression Notes</h3>
              <textarea
                placeholder="Notes from your 60s / 30s / 15s versions...&#10;&#10;What did you keep? What did you cut? What was hardest to compress?"
                value={todaySession.compressionNotes}
                onChange={(e) => setTodaySession({...todaySession, compressionNotes: e.target.value})}
                className="w-full bg-slate-800 text-white p-4 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          )}

          {activePhase.id === 4 && (
            <>
              <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.3s'}}>
                <h3 className="font-bold text-xl mb-4">Choose Your Refinement Focus</h3>
                <div className="space-y-3 mb-6">
                  {refinementOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setTodaySession({...todaySession, refinementFocus: option})}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        todaySession.refinementFocus === option
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Example sentence or context for practice..."
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                  className="w-full bg-slate-800 text-white p-4 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </>
          )}

          {/* AI Analysis Section */}
          <div className="glass rounded-2xl p-8 mb-8 fade-in" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-yellow-400" size={24} />
              <h3 className="font-bold text-xl">AI Coach Analysis</h3>
            </div>
            
            {!aiAnalysis && !isAnalyzing && (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto mb-4 text-slate-600" size={48} />
                <p className="text-slate-400 mb-6">Get personalized feedback on your work and learning</p>
                <button
                  onClick={getAIAnalysis}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 mx-auto transition-all"
                >
                  <Sparkles size={20} />
                  Get AI Feedback
                </button>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="shimmer h-4 bg-slate-700 rounded mb-3"></div>
                <div className="shimmer h-4 bg-slate-700 rounded mb-3" style={{width: '80%', margin: '0 auto'}}></div>
                <div className="shimmer h-4 bg-slate-700 rounded" style={{width: '60%', margin: '0 auto'}}></div>
                <p className="text-slate-400 mt-4">Analyzing your work...</p>
              </div>
            )}
            
            {aiAnalysis && (
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                    {aiAnalysis}
                  </div>
                </div>
                <button
                  onClick={getAIAnalysis}
                  className="mt-4 text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Get New Analysis
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            {activePhase.id > 1 && (
              <button
                onClick={() => startPhase(phases[activePhase.id - 2])}
                className="glass hover:bg-white/10 font-bold py-4 px-8 rounded-xl flex-1 transition-all"
              >
                ← Previous Phase
              </button>
            )}
            {activePhase.id < 4 ? (
              <button
                onClick={() => startPhase(phases[activePhase.id])}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl flex-1 transition-all"
              >
                Next Phase →
              </button>
            ) : (
              <button
                onClick={completeSession}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl flex-1 flex items-center justify-center gap-2 transition-all"
              >
                <Check size={20} />
                Complete Day {currentDay}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Progress View
  if (view === 'progress') {
    const avgScores = getAverageScores();
    const recentSessions = [...sessions].reverse().slice(0, 7);
    const categoryStats = getCategoryStats();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-12">
          <div className="flex items-center justify-between mb-8 fade-in">
            <button
              onClick={() => setView('home')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
            <h1 className="text-4xl font-bold gradient-text">Your Progress</h1>
          </div>

          {sessions.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center fade-in">
              <BarChart3 className="mx-auto mb-4 text-slate-600" size={64} />
              <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
              <p className="text-slate-400">Complete your first session to start tracking progress!</p>
            </div>
          ) : (
            <>
              {/* Average Scores */}
              <div className="glass rounded-3xl p-8 mb-8 fade-in">
                <h2 className="text-2xl font-bold mb-6">Average Scores</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(avgScores).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-5xl font-bold mono gradient-text mb-2">{value}</div>
                      <div className="text-slate-400 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Categories */}
              {Object.keys(categoryStats).length > 0 && (
                <div className="glass rounded-3xl p-8 mb-8 fade-in" style={{animationDelay: '0.1s'}}>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <BookOpen size={24} />
                    Topics Explored
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(categoryStats).map(([category, count]) => (
                      <div key={category} className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-3xl font-bold mono gradient-text mb-1">{count}</div>
                        <div className="text-slate-400 text-sm">{category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              <div className="glass rounded-3xl p-8 fade-in" style={{animationDelay: '0.2s'}}>
                <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
                <div className="space-y-4 max-h-none">
                  {recentSessions.map((session, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all cursor-pointer border-2 border-transparent hover:border-blue-500/30"
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-bold text-lg">Day {session.day}</div>
                          <div className="text-slate-400 text-sm">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="text-green-400" size={24} />
                          <ChevronRight className="text-slate-500" size={20} />
                        </div>
                      </div>
                      
                      {session.topic && (
                        <div className="mb-3">
                          <span className="text-slate-400 text-sm">Topic: </span>
                          <span className="text-white">{session.topic}</span>
                        </div>
                      )}

                      {session.learningCategory && (
                        <div className="mb-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                            {session.learningCategory}
                          </span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(session.scores).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-2xl font-bold mono text-blue-400">{value}</div>
                            <div className="text-slate-500 text-xs capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 text-sm text-blue-400 flex items-center gap-2">
                        <MessageSquare size={16} />
                        Click to view full session details
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Session Detail Modal */}
          {selectedSession && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 fade-in overflow-y-auto" onClick={() => setSelectedSession(null)}>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-white/10 my-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold gradient-text">Day {selectedSession.day} Session</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {new Date(selectedSession.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Topic & Category */}
                {selectedSession.topic && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="text-blue-400" size={24} />
                      <h3 className="text-xl font-bold">Topic</h3>
                    </div>
                    <p className="text-lg text-white mb-2">{selectedSession.topic}</p>
                    {selectedSession.learningCategory && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {selectedSession.learningCategory}
                      </span>
                    )}
                  </div>
                )}

                {/* Structure Notes (Main Points) */}
                {selectedSession.structureNotes && (
                  <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="text-yellow-400" size={24} />
                      <h3 className="text-xl font-bold">Your Structure & Main Points</h3>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-slate-300 whitespace-pre-wrap">
                      {selectedSession.structureNotes}
                    </div>
                  </div>
                )}

                {/* Scores */}
                <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="text-purple-400" size={24} />
                    <h3 className="text-xl font-bold">Your Scores</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(selectedSession.scores).map(([key, value]) => (
                      <div key={key} className="text-center bg-slate-900/50 rounded-xl p-4">
                        <div className="text-4xl font-bold mono gradient-text mb-2">{value}</div>
                        <div className="text-slate-400 capitalize text-sm">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compression Notes */}
                {selectedSession.compressionNotes && (
                  <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-orange-400" size={24} />
                      <h3 className="text-xl font-bold">Compression Practice</h3>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-slate-300 whitespace-pre-wrap">
                      {selectedSession.compressionNotes}
                    </div>
                  </div>
                )}

                {/* Refinement Focus */}
                {selectedSession.refinementFocus && (
                  <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="text-green-400" size={24} />
                      <h3 className="text-xl font-bold">Refinement Focus</h3>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-slate-300">
                      {selectedSession.refinementFocus}
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                {selectedSession.aiAnalysis && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="text-yellow-400" size={24} />
                      <h3 className="text-xl font-bold">AI Coach Feedback</h3>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-6 text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedSession.aiAnalysis}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ArticulationTrainer;
