import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2, ImagePlus, X, Code2, FileCode, CheckCircle2, Cpu } from 'lucide-react'
import { getToken } from '../../utils/auth'
import toast from 'react-hot-toast'

function AIMessageBubble({ msg, onExplain }) {
  const isError = msg.text?.startsWith('⚠️')
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/25">
        <Bot className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="flex flex-col gap-2 max-w-[90%]">
        <div className={`flex flex-col gap-2 group rounded-2xl rounded-tl-none px-4 py-3 text-sm border shadow-lg ${
          isError
            ? 'bg-red-500/10 border-red-500/20 text-red-300'
            : 'bg-[#151524] border-indigo-500/15 text-slate-300'
        }`}>
          {msg.image && (
            <img src={msg.image} alt="Attachment" className="rounded-lg max-h-44 object-contain border border-white/5" />
          )}
          {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
        </div>
        
        {/* Explanation Button */}
        {msg.generatedFiles && msg.generatedFiles.length > 0 && (
          <button
            onClick={() => onExplain(msg.generatedFiles)}
            className="self-start flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explanation of Code
          </button>
        )}
      </div>
    </div>
  )
}

function UserMessageBubble({ msg }) {
  return (
    <div className="flex gap-3 items-start flex-row-reverse">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[90%] flex flex-col gap-2 rounded-2xl rounded-tr-none px-4 py-3 text-sm bg-gradient-to-br from-indigo-600/80 to-indigo-700/80 border border-indigo-400/20 shadow-lg text-white">
        {msg.image && (
          <img src={msg.image} alt="Attachment" className="rounded-lg max-h-44 object-contain border border-white/5" />
        )}
        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/25">
        <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
      </div>
      <div className="bg-[#151524] rounded-2xl rounded-tl-none px-5 py-3 border border-indigo-500/15 shadow-lg flex items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400"
              style={{ animation: `bounce 1.2s ${delay}s ease-in-out infinite` }}
            />
          ))}
        </div>
        <span className="text-indigo-300/70 text-xs">NexusForge is generating code...</span>
      </div>
    </div>
  )
}

export default function AIChat({ projectType, files, setFiles, setActiveFile, messages, setMessages }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  
  // Explanation Modal state
  const [explanationModalOpen, setExplanationModalOpen] = useState(false)
  const [explanationData, setExplanationData] = useState({ isLoading: false, text: '' })

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleExplainCode = async (filesToExplain) => {
    setExplanationModalOpen(true)
    setExplanationData({ isLoading: true, text: '' })
    
    try {
      const token = getToken()
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
      const res = await fetch(`${API_BASE}/api/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files: filesToExplain })
      })

      if (!res.ok) throw new Error('Failed to generate explanation')
      
      const data = await res.json()
      setExplanationData({ isLoading: false, text: data.explanation })
    } catch (err) {
      toast.error(err.message)
      setExplanationData({ isLoading: false, text: '⚠️ Failed to load explanation. Please try again.' })
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return }
    const reader = new FileReader()
    reader.onload = (event) => setSelectedImage(event.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || isLoading) return

    const userPrompt = input.trim()
    setInput('')
    const imageToSend = selectedImage
    setSelectedImage(null)

    setMessages((prev) => [...prev, { role: 'user', text: userPrompt, image: imageToSend }])
    setIsLoading(true)

    try {
      const token = getToken()
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt: userPrompt,
          contextFiles: files,
          projectType,
          image: imageToSend,
          chatHistory: messages.map(m => ({ role: m.role, text: m.text }))
        }),
      })

      if (!res.ok) {
        let errorMsg = 'Failed to generate code from AI'
        try { const errData = await res.json(); if (errData.error) errorMsg = errData.error } catch (e) {}
        throw new Error(errorMsg)
      }

      const data = await res.json()

      setMessages((prev) => [...prev, {
        role: 'ai',
        text: data.message || "Here is the code you requested. I have updated the project files.",
        generatedFiles: data.files && data.files.length > 0 ? data.files : null,
      }])

      if (data.files && Array.isArray(data.files)) {
        const newFilesList = [...files]
        data.files.forEach((generatedFile) => {
          const existingIndex = newFilesList.findIndex((f) => f.path === generatedFile.path)
          if (existingIndex >= 0) {
            newFilesList[existingIndex].content = generatedFile.content
          } else {
            newFilesList.push(generatedFile)
          }
        })
        setFiles(newFilesList)
        if (data.files.length > 0) setActiveFile(data.files[0])
        toast.success(`Generated ${data.files.length} file(s)`)
      }
    } catch (err) {
      toast.error(err.message)
      setMessages((prev) => [...prev, { role: 'ai', text: `⚠️ An error occurred: ${err.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const aiMessages = messages.filter(m => m.role === 'ai').length - 1
  const userMessages = messages.filter(m => m.role === 'user').length

  return (
    <div className="flex flex-col h-full bg-[#09091a] border-l border-indigo-500/10">
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/10 bg-[#0c0c1e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Engineer</h2>
              <p className="text-[10px] text-slate-500">Gemini 2.5 Flash • Vision Enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            {files.length > 0 && (
              <span className="flex items-center gap-1 text-emerald-400/80">
                <CheckCircle2 className="w-3 h-3" />
                {files.length} file{files.length !== 1 ? 's' : ''} generated
              </span>
            )}
            {userMessages > 0 && (
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {userMessages} msg{userMessages !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {messages.map((msg, i) => (
          msg.role === 'user'
            ? <UserMessageBubble key={i} msg={msg} />
            : <AIMessageBubble key={i} msg={msg} onExplain={handleExplainCode} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-[#0c0c1e] border-t border-indigo-500/10">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-16 w-auto rounded-xl border border-indigo-500/30 shadow-lg" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 rounded-full p-1 border border-slate-600 hover:text-white hover:bg-red-500/80 hover:border-red-400 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 bg-[#151524] border border-indigo-500/20 rounded-2xl focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all rounded-xl flex-shrink-0"
              title="Upload design image"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
              }}
              placeholder="Ask AI to build, update, or describe a design image..."
              className="w-full bg-transparent text-slate-200 text-sm py-2 outline-none resize-none flex-1 max-h-28 min-h-[40px] placeholder-slate-600"
              rows={1}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Paste images to build from designs
          </p>
        </form>
      </div>

      {/* Code Explanation Modal */}
      {explanationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f0f1d] border border-emerald-500/30 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative shadow-emerald-500/10">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 bg-[#151524] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Theoretical Code Explanation
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </h2>
                  <p className="text-xs text-slate-400">Deep-dive analysis of all generated files</p>
                </div>
              </div>
              <button
                onClick={() => setExplanationModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {explanationData.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"></div>
                  </div>
                  <p className="text-emerald-400/80 text-sm font-medium">NexusForge is analyzing the code structure...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-emerald max-w-none text-slate-300">
                  <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed break-words bg-transparent p-0 m-0">
                    {explanationData.text}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
