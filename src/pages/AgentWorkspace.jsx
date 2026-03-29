import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquarePlus, Download, Globe, Loader2, Sparkles } from 'lucide-react'
import JSZip from 'jszip'
import toast from 'react-hot-toast'
import FileExplorer from '../components/workspace/FileExplorer'
import CodeEditor from '../components/workspace/CodeEditor'
import AIChat from '../components/workspace/AIChat'

export default function AgentWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectType = searchParams.get('type') || 'react'
  const chatId = searchParams.get('chatId') || null
  const navigate = useNavigate()

  // Virtual file system state
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hello! I am NexusForge AI. I can help you build a new **${projectType}** project. Tell me what you'd like to create!`,
    },
  ])

  // Load project from LocalStorage if chatId exists
  useEffect(() => {
    if (chatId) {
      const savedProjects = JSON.parse(localStorage.getItem('nexusforge_chats') || '[]')
      const project = savedProjects.find(p => p.id === chatId)
      if (project) {
        setFiles(project.files || [])
        setMessages(project.messages || [])
        if (project.files && project.files.length > 0) {
          setActiveFile(project.files[0])
        }
      }
    } else {
      // It's a brand new chat; create a new generic chatId and redirect
      const newChatId = Date.now().toString()
      setSearchParams({ type: projectType, chatId: newChatId })
    }
  }, [chatId, projectType, setSearchParams])

  // Auto-save changes to LocalStorage
  useEffect(() => {
    if (!chatId || messages.length <= 1) return // Don't save empty default chats
    
    const savedProjects = JSON.parse(localStorage.getItem('nexusforge_chats') || '[]')
    const existingIndex = savedProjects.findIndex(p => p.id === chatId)
    
    // Auto-generate a title from the first user message
    const firstUserMsg = messages.find(m => m.role === 'user')?.text || 'Untitled Project'
    const title = firstUserMsg.length > 40 ? firstUserMsg.substring(0, 40) + '...' : firstUserMsg

    const projectData = {
      id: chatId,
      title,
      type: projectType,
      updatedAt: new Date().toISOString(),
      messages,
      files
    }

    if (existingIndex >= 0) {
      savedProjects[existingIndex] = projectData
    } else {
      savedProjects.unshift(projectData)
    }

    localStorage.setItem('nexusforge_chats', JSON.stringify(savedProjects))
  }, [files, messages, chatId, projectType])

  const handleNewChat = () => {
    setFiles([])
    setActiveFile(null)
    setMessages([
      {
        role: 'ai',
        text: `Hello! I am NexusForge AI. I can help you build a new **${projectType}** project. Tell me what you'd like to create!`,
      },
    ])
    const newChatId = Date.now().toString()
    setSearchParams({ type: projectType, chatId: newChatId })
  }

  const handleDownload = async () => {
    if (files.length === 0) {
      toast.error('No files to download. Ask the AI to generate some code first!')
      return
    }
    const zip = new JSZip()
    files.forEach(f => {
      zip.file(f.path, f.content || '')
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nexusforge-project.zip'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Project downloaded!')
  }

  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async () => {
    if (files.length === 0) {
      toast.error('No files to deploy. Ask the AI to generate some code first!')
      return
    }
    setIsDeploying(true)
    try {
      // Build CodeSandbox files object
      const sandboxFiles = {}
      files.forEach(f => {
        sandboxFiles[f.path] = { content: f.content || '' }
      })

      // Add a package.json if missing (required by codesandbox)
      if (!sandboxFiles['package.json']) {
        sandboxFiles['package.json'] = {
          content: JSON.stringify({
            name: 'nexusforge-project',
            version: '1.0.0',
            main: 'index.html',
            scripts: { start: projectType === 'react' ? 'react-scripts start' : '' },
            dependencies: projectType === 'react' ? { react: '^18.0.0', 'react-dom': '^18.0.0', 'react-scripts': '^5.0.0' } : {}
          }, null, 2)
        }
      }

      const payload = { files: sandboxFiles }
      const compressed = JSON.stringify(payload)
      const res = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: compressed,
      })
      const data = await res.json()
      if (data.sandbox_id) {
        const liveUrl = `https://${data.sandbox_id}.csb.app`
        toast.success('Deployed! Opening live link...')
        window.open(liveUrl, '_blank')
      } else {
        throw new Error('No sandbox ID returned')
      }
    } catch (err) {
      toast.error('Deployment failed: ' + err.message)
    } finally {
      setIsDeploying(false)
    }
  }

  const updateFileContent = (path, newContent) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content: newContent } : f))
    )
    if (activeFile && activeFile.path === path) {
      setActiveFile({ ...activeFile, content: newContent })
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#07070e] text-slate-200 overflow-hidden">
      {/* ── Top Navbar ───────────────────────────────────────── */}
      <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0 bg-[#0a0a14]/95 backdrop-blur-sm z-10">
        {/* Left: Back + project type */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline font-medium">Dashboard</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{projectType}</span>
          </div>
        </div>

        {/* Center: Brand */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          <span className="text-xs font-black text-slate-400 tracking-tight hidden sm:block">NexusForge</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            title="Download as ZIP"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all border border-white/5 hover:border-white/15"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            title="Deploy to live URL"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-emerald-500/20 border border-emerald-500/30"
          >
            {isDeploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isDeploying ? 'Deploying…' : 'Deploy'}</span>
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-500/20 border border-indigo-500/30"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* 3-Pane Workspace Dashboard */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: File Explorer (20%) */}
        <section className="w-48 sm:w-64 shrink-0 hidden md:block border-r border-indigo-500/10">
          <FileExplorer 
            files={files} 
            activeFile={activeFile} 
            setActiveFile={setActiveFile} 
          />
        </section>

        {/* Middle Pane: Code Editor (50%) */}
        <section className="flex-1 relative z-0 shadow-2xl">
          <CodeEditor 
            files={files}
            activeFile={activeFile} 
            updateFileContent={updateFileContent} 
          />
        </section>

        {/* Right Pane: AI Chat Agent (30%) */}
        <section className="w-80 sm:w-96 shrink-0 relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <AIChat 
            projectType={projectType} 
            files={files} 
            setFiles={setFiles} 
            setActiveFile={setActiveFile}
            messages={messages}
            setMessages={setMessages}
          />
        </section>

      </main>
    </div>
  )
}
