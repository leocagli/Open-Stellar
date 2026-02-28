import { generateKeypair } from "@/lib/stellar"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const kp = generateKeypair()
    return NextResponse.json(kp)
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate keypair" }, { status: 500 })
  }
}
