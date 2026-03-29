import { useEffect, useRef } from 'react'

export default function FloatingShapes() {
  const containerRef = useRef(null)

  useEffect(() => {
    const shapes = containerRef.current?.querySelectorAll('.floating-shape')
    if (!shapes) return

    shapes.forEach((shape, i) => {
      shape.style.animationDelay = `${i * 1.5}s`
      shape.style.animationDuration = `${15 + i * 5}s`
    })
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="floating-shape absolute w-72 h-72 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #6366f1, transparent)',
          top: '10%',
          left: '10%',
          animation: 'float 20s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="floating-shape absolute w-96 h-96 rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, #a855f7, transparent)',
          top: '60%',
          right: '5%',
          animation: 'float 25s ease-in-out infinite',
          filter: 'blur(60px)',
          opacity: 0.08,
        }}
      />
      <div
        className="floating-shape absolute w-64 h-64 rounded-full opacity-6"
        style={{
          background: 'radial-gradient(circle, #00d4ff, transparent)',
          bottom: '20%',
          left: '30%',
          animation: 'float 18s ease-in-out infinite',
          filter: 'blur(50px)',
          opacity: 0.06,
        }}
      />
      <div
        className="floating-shape absolute w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, #6366f1, transparent)',
          top: '40%',
          right: '30%',
          animation: 'float 22s ease-in-out infinite',
          filter: 'blur(45px)',
          opacity: 0.07,
        }}
      />
    </div>
  )
}
