import { Folder, File, ChevronRight, ChevronDown, Plus } from 'lucide-react'

export default function FileExplorer({ files, activeFile, setActiveFile }) {
  // Simple flat map converted to mock tree for UI purposes
  // In a real advanced app, this would deeply parse file paths into a nested tree state
  const filesList = files || []

  return (
    <div className="flex flex-col h-full bg-[#0a0a14] border-r border-indigo-500/10 text-slate-300 select-none">
      <div className="p-4 text-xs font-semibold tracking-wider text-slate-500 uppercase border-b border-indigo-500/10 flex items-center justify-between">
        <span>Explorer</span>
        <Plus className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2">
          <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 cursor-pointer rounded-md text-sm group">
            <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
            <Folder className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">nexusforge-project</span>
          </div>

          <div className="pl-6 pr-2 mt-1 space-y-0.5">
            {filesList.map((file, i) => (
              <div
                key={file.path + i}
                onClick={() => setActiveFile(file)}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-md transition-colors ${
                  activeFile?.path === file.path 
                    ? 'bg-indigo-500/20 text-indigo-200' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <File className={`w-3.5 h-3.5 ${activeFile?.path === file.path ? 'text-indigo-400' : 'opacity-60'}`} />
                <span className="truncate">{file.path}</span>
              </div>
            ))}
            
            {filesList.length === 0 && (
              <div className="px-2 py-4 text-xs text-slate-500 italic">
                No files generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
