export type SRTier = 'S' | 'A' | 'B' | 'C'

export interface BadgeOutput {
  svgUrl: string
  embedCode: string
  tier: SRTier
  color: string
  svgContent: string
}

export const TIER_COLORS: Record<SRTier, string> = {
  S: '#00FF94',
  A: '#3B82F6',
  B: '#EAB308',
  C: '#6B7280',
}

const TIER_BG_COLORS: Record<SRTier, string> = {
  S: '#064E3B',
  A: '#1E3A5F',
  B: '#713F12',
  C: '#374151',
}

export function getTierColor(tier: SRTier): string {
  return TIER_COLORS[tier] || TIER_COLORS.C
}

export function generateSvgContent(tier: SRTier, score: number, agentName?: string): string {
  const color = TIER_COLORS[tier]
  const bgColor = TIER_BG_COLORS[tier]
  const displayScore = score.toFixed(1)
  const displayName = agentName ? truncateName(agentName, 12) : 'Agent'
  const nameWidth = Math.max(displayName.length * 7, 50)
  const scoreWidth = 55
  const totalWidth = nameWidth + scoreWidth + 10

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="Signal Rank: ${tier} (${displayScore})">
  <title>Signal Rank: ${tier} (${displayScore})</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${nameWidth + 5}" height="20" fill="#555"/>
    <rect x="${nameWidth + 5}" width="${scoreWidth + 5}" height="20" fill="${bgColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${(nameWidth + 5) / 2}" y="15" fill="#010101" fill-opacity=".3">${displayName}</text>
    <text x="${(nameWidth + 5) / 2}" y="14">${displayName}</text>
    <text x="${nameWidth + 5 + (scoreWidth + 5) / 2}" y="15" fill="#010101" fill-opacity=".3">SR ${tier} ${displayScore}</text>
    <text x="${nameWidth + 5 + (scoreWidth + 5) / 2}" y="14" fill="${color}">SR ${tier} ${displayScore}</text>
  </g>
</svg>`
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength - 2) + '..'
}

export function generateBadge(agentSlug: string, tier: SRTier, score: number, agentName?: string, baseUrl: string = 'https://agentsignals.ai'): BadgeOutput {
  const color = getTierColor(tier)
  const svgContent = generateSvgContent(tier, score, agentName)
  const svgUrl = `${baseUrl}/api/badge/${agentSlug}.svg`
  const reportUrl = `${baseUrl}/agents/${agentSlug}`
  const embedCode = generateEmbedCode(svgUrl, reportUrl, tier, score)
  return { svgUrl, embedCode, tier, color, svgContent }
}

export function generateEmbedCode(svgUrl: string, reportUrl: string, tier: SRTier, score: number): string {
  return `<a href="${reportUrl}" target="_blank" rel="noopener noreferrer">
  <img src="${svgUrl}" alt="Signal Rank: ${tier} (${score.toFixed(1)})" />
</a>`
}

export function generateMarkdownEmbed(svgUrl: string, reportUrl: string, tier: SRTier, score: number): string {
  return `[![Signal Rank: ${tier} (${score.toFixed(1)})](${svgUrl})](${reportUrl})`
}

export function isValidTier(tier: string): tier is SRTier {
  return ['S', 'A', 'B', 'C'].includes(tier)
}

export function getTierFromScore(score: number): SRTier {
  if (score >= 9.0) return 'S'
  if (score >= 7.5) return 'A'
  if (score >= 5.0) return 'B'
  return 'C'
}