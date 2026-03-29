import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, Atom, LogOut, Sparkles, Zap, Eye, Brain, Layers,
  Clock, FolderOpen, GitBranch, Globe, ChevronRight, Star,
  ArrowUpRight, MessageSquare, Calendar, Cpu, Rocket
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logoutUser } from '../utils/auth'
import FloatingShapes from '../components/FloatingShapes'

function TypingText({ text, className }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) { setDisplayed(text.slice(0, i)); i++ }
      else { setDone(true); clearInterval(interval) }
    }, 40)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-5 bg-primary-light ml-0.5 align-middle" style={{ animation: 'pulse-glow 1s ease-in-out infinite' }} />}
    </span>
  )
}

const techCards = [
  {
    id: 'html-css-js',
    title: 'HTML / CSS / JS',
    description: 'Build static modern websites with clean, responsive layouts and interactive elements.',
    icon: Code2,
    gradient: 'from-orange-600/25 to-amber-500/15',
    glowColor: 'rgba(251,146,60,0.15)',
    iconColor: '#fb923c',
    badge: 'Static Site',
    badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    accent: '#fb923c',
  },
  {
    id: 'react',
    title: 'React.js',
    description: 'Build dynamic and scalable web apps with component-based architecture.',
    icon: Atom,
    gradient: 'from-cyan-600/25 to-blue-500/15',
    glowColor: 'rgba(0,212,255,0.12)',
    iconColor: '#00d4ff',
    badge: 'Dynamic App',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    accent: '#00d4ff',
  },
]

const features = [
  { icon: Eye, title: 'Vision AI', desc: 'Upload any image mockup and the AI recreates it as live code', color: '#a78bfa' },
  { icon: Brain, title: 'Site Architect', desc: 'Describe a project and get a fully structured multi-page website', color: '#34d399' },
  { icon: Zap, title: 'Instant Deploy', desc: 'Deploy to a public live URL with one click via CodeSandbox', color: '#fbbf24' },
  { icon: Layers, title: 'Multi-File Output', desc: 'AI generates organized components, routes, and stylesheets separately', color: '#f87171' },
  { icon: GitBranch, title: 'Conversation Memory', desc: 'Bot remembers everything you built and updates on command', color: '#60a5fa' },
  { icon: Globe, title: 'Download & Export', desc: 'Export your full project as a ZIP and run it anywhere', color: '#c084fc' },
]

const stats = [
  { label: 'AI Engine', value: 'Gemini 2.5' },
  { label: 'Tech Stacks', value: '2+' },
  { label: 'Output', value: 'ZIP + URL' },
  { label: 'Speed', value: '~5s' },
]

export default function Home({ user }) {
  const navigate = useNavigate()
  const [savedProjects, setSavedProjects] = useState([])

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('nexusforge_chats') || '[]')
    setSavedProjects(projects)
  }, [])

  const handleLogout = () => {
    logoutUser()
    toast.success('Logged out')
    navigate('/login')
  }

  const totalProjects = savedProjects.length
  const allHistory = savedProjects.slice(0, 6)

  return (
    <div className="gradient-bg relative min-h-screen">
      <FloatingShapes />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-black gradient-text tracking-tight">NexusForge AI</span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] text-slate-500 leading-none tracking-wide">Welcome back,</span>
              <span className="text-sm font-bold text-white leading-tight mt-0.5">{user.name || user.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-indigo-400/30 shadow-lg shadow-indigo-500/20 text-sm select-none">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-all cursor-pointer px-4 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
              id="home-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        )}
      </nav>

      <main className="relative z-10 px-6 md:px-12 pt-12 pb-24">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 mb-6 backdrop-blur">
            <Cpu className="w-3 h-3" />
            Powered by Gemini 2.5 Flash with Vision AI
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight gradient-text neon-glow leading-tight" id="home-title">
            NexusForge AI
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-center mb-10 max-w-2xl mx-auto">
          <TypingText text="Create your modern and advanced UI website using AI" className="text-lg md:text-xl text-slate-300 leading-relaxed" />
        </motion.div>

        {/* ── Stats bar ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex flex-wrap justify-center gap-8 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-black text-white">{s.value}</span>
              <span className="text-[11px] text-slate-500 tracking-wide">{s.label}</span>
            </div>
          ))}
          {totalProjects > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-black text-indigo-400">{totalProjects}</span>
              <span className="text-[11px] text-slate-500 tracking-wide">Saved Projects</span>
            </div>
          )}
        </motion.div>

        {/* ── Tech Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto mb-6">
          {techCards.map((card, i) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <div
                className="glass-card tech-card p-8 group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl"
                style={{ '--hover-shadow': card.glowColor }}
                id={`card-${card.id}`}
                onClick={() => navigate(`/workspace?type=${card.id}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-700" style={{ background: card.accent }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: `${card.iconColor}18`, border: `1px solid ${card.iconColor}35` }}>
                      <card.icon className="w-7 h-7" style={{ color: card.iconColor }} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wider uppercase ${card.badgeBg}`}>{card.badge}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors mb-6">{card.description}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-indigo-400 transition-all duration-300">
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Start Building</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Recent History Section ───────────────────────────── */}
        {allHistory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }} className="w-full max-w-3xl mx-auto mb-12">
            
            {/* Section heading */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">Recent Projects</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">{allHistory.length} saved session{allHistory.length !== 1 ? 's' : ''} — click to resume</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-400/60 border border-indigo-500/20 px-2.5 py-1 rounded-full bg-indigo-500/5 uppercase tracking-widest">History</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allHistory.map((proj, idx) => {
                const isReact = proj.type === 'react'
                const accent = isReact ? { color: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' } : { color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)' }
                const Icon = isReact ? Atom : Code2
                const msgCount = proj.messages?.length || 0
                const date = new Date(proj.updatedAt)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + idx * 0.06 }}
                    onClick={() => navigate(`/workspace?type=${proj.type}&chatId=${proj.id}`)}
                    className="group relative cursor-pointer rounded-2xl border bg-[#0e0e1c] p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = accent.border
                      e.currentTarget.style.background = accent.bg
                      e.currentTarget.style.boxShadow = `0 0 32px ${accent.color}18`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.background = '#0e0e1c'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Decorative glow blob */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-500 pointer-events-none"
                      style={{ background: accent.color }} />

                    <div className="relative z-10 flex items-start gap-3.5">
                      {/* Tech icon */}
                      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: `${accent.color}15`, border: `1px solid ${accent.color}30` }}>
                        <Icon className="w-5 h-5" style={{ color: accent.color }} />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate leading-tight">
                            {proj.title}
                          </h3>
                          <div className="shrink-0 w-6 h-6 rounded-lg border border-white/5 group-hover:border-white/20 flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
                            {isReact ? 'React' : 'HTML/CSS'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {msgCount} msgs
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {dateStr} · {timeStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-b-2xl" style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Features Grid ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">What NexusForge Can Do</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.07 }}
                className="glass-card p-5 flex flex-col gap-3 hover:border-white/10 group cursor-default transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}25` }}>
                  <feat.icon className="w-4.5 h-4.5" style={{ color: feat.color }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">{feat.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="mt-16 text-xs text-slate-700 text-center">
          Powered by Gemini Deep Learning AI • Built for the future of web development
        </motion.p>
      </main>
    </div>
  )
}
