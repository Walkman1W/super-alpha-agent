export function GridBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(circle at center, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 100%)',
      }}
    />
  )
}

export default GridBackground
