import Editor from '@monaco-editor/react'
import { Play, Code, FileCode2, Circle } from 'lucide-react'
import { useState } from 'react'

const FILE_ICON_COLORS = {
  jsx: '#00d4ff',
  tsx: '#3b82f6',
  ts: '#3b82f6',
  js: '#fbbf24',
  css: '#c084fc',
  html: '#f97316',
  json: '#34d399',
}

function getExt(path = '') {
  return path.split('.').pop() || ''
}

function FileTab({ file, isActive, onClick }) {
  const ext = getExt(file.path)
  const color = FILE_ICON_COLORS[ext] || '#94a3b8'
  const name = file.path.split('/').pop()
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-r border-indigo-500/10 transition-all shrink-0 max-w-[180px] group ${
        isActive
          ? 'bg-[#1e1e2e] text-slate-200 border-t-2 border-t-indigo-500'
          : 'text-slate-500 hover:text-slate-300 bg-[#111120] hover:bg-[#16162a]'
      }`}
    >
      <Circle className="w-2 h-2 shrink-0" style={{ color, fill: color }} />
      <span className="truncate">{name}</span>
    </button>
  )
}

export default function CodeEditor({ files = [], activeFile, updateFileContent }) {
  const [showPreview, setShowPreview] = useState(false)

  const getLanguage = (path) => {
    if (!path) return 'javascript'
    const ext = getExt(path)
    const map = { jsx: 'javascript', tsx: 'typescript', ts: 'typescript', js: 'javascript', css: 'css', html: 'html', json: 'json' }
    return map[ext] || 'javascript'
  }

  const handleEditorChange = (value) => {
    if (activeFile) updateFileContent(activeFile.path, value)
  }

  const getPreviewHtml = () => {
    const htmlFile = files.find(f => f.path === 'index.html' || f.path.endsWith('.html'))
    const cssFiles = files.filter(f => f.path.endsWith('.css'))
    const jsFiles = files.filter(f => f.path.endsWith('.js') && !f.path.endsWith('.jsx'))

    let html = htmlFile
      ? htmlFile.content
      : '<div style="color: white; font-family: sans-serif; padding: 20px;"><h1>No HTML file found</h1><p>Please generate an index.html file to see the preview.</p></div>'

    if (htmlFile) {
      const cssInjection = cssFiles.map(f => `<style>${f.content}</style>`).join('\n')
      const jsInjection = jsFiles.map(f => `<script>${f.content}</script>`).join('\n')
      if (html.includes('</head>')) html = html.replace('</head>', `${cssInjection}</head>`)
      else html += cssInjection
      if (html.includes('</body>')) html = html.replace('</body>', `${jsInjection}</body>`)
      else html += jsInjection
    }
    return html
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f1c]">
      {/* Toolbar */}
      <div className="flex items-center justify-between h-10 border-b border-indigo-500/10 bg-[#111120] px-3 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          <FileCode2 className="w-3.5 h-3.5" />
          <span>{files.length} file{files.length !== 1 ? 's' : ''} in workspace</span>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            showPreview
              ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/25'
              : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15'
          }`}
        >
          {showPreview ? <><Code className="w-3 h-3" /> Code</> : <><Play className="w-3 h-3" /> Preview</>}
        </button>
      </div>

      {/* Tab Bar */}
      {files.length > 0 && (
        <div className="flex overflow-x-auto border-b border-indigo-500/10 bg-[#111120] scrollbar-hide shrink-0">
          {files.map((f) => (
            <FileTab
              key={f.path}
              file={f}
              isActive={activeFile?.path === f.path}
              onClick={() => updateFileContent && updateFileContent(f.path, f.content)}
            />
          ))}
        </div>
      )}

      {/* Editor / Preview area */}
      <div className="flex-1 overflow-hidden relative">
        {showPreview ? (
          <iframe
            title="preview"
            srcDoc={getPreviewHtml()}
            className="w-full h-full bg-white border-none"
            sandbox="allow-scripts allow-metadata-invoke"
          />
        ) : activeFile ? (
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile.path}
            defaultLanguage={getLanguage(activeFile.path)}
            value={activeFile.content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true, scale: 0.6 },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              lineNumbersMinChars: 3,
              renderLineHighlight: 'gutter',
              bracketPairColorization: { enabled: true },
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600">
            <div className="w-32 h-32 opacity-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col items-center gap-2 text-center px-8">
              <Code className="w-8 h-8 text-slate-700" />
              <p className="text-sm font-medium text-slate-600">Empty Canvas</p>
              <p className="text-xs text-slate-700 max-w-[200px] leading-relaxed">
                Ask the AI to build something, and your code will appear here instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
