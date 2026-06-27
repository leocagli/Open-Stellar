import { NextResponse } from "next/server"
import { getRegisteredAgent } from "@/lib/agent-registry"
import { satisfies, valid } from "semver"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: RouteContext) {
  const callerVersion = new URL(req.url).searchParams.get("callerVersion")
  if (!callerVersion) {
    return NextResponse.json(
      { ok: false, error: "callerVersion is required" },
      { status: 400 },
    )
  }

  const normalizedCallerVersion = valid(callerVersion)
  if (!normalizedCallerVersion) {
    return NextResponse.json(
      { ok: false, error: "callerVersion must be a valid semver version" },
      { status: 400 },
    )
  }

  const { id } = await context.params
  const agent = getRegisteredAgent(decodeURIComponent(id))
  if (!agent) {
    return NextResponse.json({ ok: false, error: "agent not found" }, { status: 404 })
  }

  const registrations = new Map(agent.skillVersions?.map((skill) => [skill.id, skill]))
  const skills = agent.capabilities.map((id) => {
    const registration = registrations.get(id)
    const requirement = registration?.minCallerVersion
      ? `>=${registration.minCallerVersion}`
      : undefined
    const compatible = requirement
      ? satisfies(normalizedCallerVersion, requirement)
      : true

    return {
      id,
      version: registration?.version ?? "1.0.0",
      compatible,
      ...(!compatible && requirement ? { requires: requirement } : {}),
    }
  })

  return NextResponse.json({
    compatible: skills.every((skill) => skill.compatible),
    skills,
  })
}
