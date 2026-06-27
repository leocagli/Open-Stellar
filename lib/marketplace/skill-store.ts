export interface Skill {
  id: string
  agentId: string
  name: string
  description: string
  priceXLM: number
  callUrl: string
  active: boolean
  createdAt: number
}

export interface CreateSkillInput {
  agentId: string
  name: string
  description: string
  priceXLM: number
  callUrl: string
}

export interface ListSkillsFilters {
  name?: string
  maxPriceXLM?: number
  agentId?: string
}

class SkillStoreError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "SkillStoreError"
    this.statusCode = statusCode
  }
}

type SkillStoreState = {
  __marketplaceSkills__?: Skill[]
}

const globalState = globalThis as typeof globalThis & SkillStoreState

function getSkillRegistry(): Skill[] {
  if (!globalState.__marketplaceSkills__) {
    globalState.__marketplaceSkills__ = []
  }

  return globalState.__marketplaceSkills__
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function validateCreateSkillInput(input: CreateSkillInput): void {
  const agentId = normalizeString(input.agentId)
  const name = normalizeString(input.name)
  const description = normalizeString(input.description)
  const callUrl = normalizeString(input.callUrl)

  if (!agentId) {
    throw new SkillStoreError("agentId is required", 400)
  }

  if (!name) {
    throw new SkillStoreError("name is required", 400)
  }

  if (!description) {
    throw new SkillStoreError("description is required", 400)
  }

  if (!callUrl) {
    throw new SkillStoreError("callUrl is required", 400)
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(callUrl)
  } catch {
    throw new SkillStoreError("callUrl must be a valid URL", 400)
  }

  if (parsedUrl.protocol !== "https:") {
    throw new SkillStoreError("callUrl must use HTTPS", 400)
  }

  const priceXLM = Number(input.priceXLM)
  if (!Number.isFinite(priceXLM) || priceXLM <= 0 || priceXLM > 100) {
    throw new SkillStoreError("priceXLM must be > 0 and <= 100", 400)
  }
}

export function resetSkillStoreForTests(): void {
  globalState.__marketplaceSkills__ = []
}

export function registerSkill(input: CreateSkillInput): Skill {
  validateCreateSkillInput(input)

  const registry = getSkillRegistry()
  const activeSkillsForAgent = registry.filter((skill) => skill.agentId === input.agentId && skill.active)
  if (activeSkillsForAgent.length >= 20) {
    throw new SkillStoreError("Agent has reached the max of 20 active skills", 429)
  }

  const skill: Skill = {
    id: createId("skill"),
    agentId: normalizeString(input.agentId),
    name: normalizeString(input.name),
    description: normalizeString(input.description),
    priceXLM: Number(input.priceXLM),
    callUrl: normalizeString(input.callUrl),
    active: true,
    createdAt: Date.now(),
  }

  registry.push(skill)
  return skill
}

export function listSkills(filters: ListSkillsFilters = {}): Skill[] {
  const registry = getSkillRegistry()
  const normalizedName = normalizeString(filters.name).toLowerCase()
  const agentId = normalizeString(filters.agentId)
  const maxPriceXLM = filters.maxPriceXLM === undefined ? undefined : Number(filters.maxPriceXLM)

  return registry
    .filter((skill) => skill.active)
    .filter((skill) => !agentId || skill.agentId === agentId)
    .filter((skill) => !normalizedName || skill.name.toLowerCase().includes(normalizedName))
    .filter((skill) => {
      if (maxPriceXLM === undefined) {
        return true
      }

      return Number.isFinite(maxPriceXLM) && skill.priceXLM <= maxPriceXLM
    })
    .sort((left, right) => right.createdAt - left.createdAt)
}

export function deactivateSkill(skillId: string, agentId: string): Skill {
  const registry = getSkillRegistry()
  const skill = registry.find((entry) => entry.id === skillId)

  if (!skill) {
    throw new SkillStoreError("Skill not found", 404)
  }

  if (skill.agentId !== normalizeString(agentId)) {
    throw new SkillStoreError("You do not own this skill", 403)
  }

  skill.active = false
  return skill
}

export { SkillStoreError }
