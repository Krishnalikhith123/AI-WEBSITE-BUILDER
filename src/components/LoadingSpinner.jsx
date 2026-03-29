export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#6366f1',
            borderRightColor: '#a855f7',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div
          className="absolute inset-1.5 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: '#00d4ff',
            borderLeftColor: '#6366f1',
            animation: 'spin 1.2s linear infinite reverse',
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
