interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 黑色主体 A */}
      <path 
        d="M45 185H75L94 75C94 75 96 68 100 68C104 68 106 75 106 75L125 185H155L115 35C115 35 110 10 100 10C90 10 85 35 85 35L45 185Z" 
        fill="currentColor"
      />
      
      {/* 绿色横条 (鞋带部分) */}
      <path d="M86 90C86 90 93 87 100 87C107 87 114 90 114 90" stroke="#00C853" strokeWidth="12" strokeLinecap="round"/>
      <path d="M80 120C80 120 90 117 100 117C110 117 120 120 120 120" stroke="#00C853" strokeWidth="12" strokeLinecap="round"/>
      <path d="M74 150C74 150 87 146 100 146C113 146 126 150 126 150" stroke="#00C853" strokeWidth="12" strokeLinecap="round"/>
    </svg>
  )
}

export default Logo
