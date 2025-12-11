import { HomePage } from '@/components/home/home-page'

// Pre-format stats on server to avoid hydration mismatch
const stats = {
  indexed: 1529,
  verified: 1024,
  scans: 12403,
}

export default function Page() {
  return <HomePage stats={stats} />
}
