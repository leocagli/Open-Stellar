import { NextResponse } from 'next/server'
import { resolveTrack8004 } from '@/lib/protocols/track8004'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chain = searchParams.get('chain') === 'stellar' ? 'stellar' : 'bnb'
  const stellarSupports8004 = searchParams.get('stellarSupports8004') === 'true'

  const resolution = resolveTrack8004(chain, stellarSupports8004)

  return NextResponse.json({ ok: true, resolution })
}
