/**
 * Agent Registration Stub
 *
 * Configure your agent's identity and capabilities here.
 * This file is the entry point for the Open-Stellar agent runtime.
 */

export interface AgentConfig {
  /** Unique identifier for this agent (alphanumeric, hyphens allowed) */
  id: string
  /** Display name shown in the Open-Stellar hub */
  name: string
  /** Short description of what this agent does */
  description: string
  /** Semantic version of the agent */
  version: string
  /** Agent capabilities / skill tags */
  capabilities: string[]
}

/**
 * Define your agent's configuration here.
 * Replace the placeholder values with your own.
 */
export const agentConfig: AgentConfig = {
  id: 'my-agent',
  name: 'My Agent',
  description: 'A minimal Open-Stellar agent. Edit this in lib/agent.ts.',
  version: '0.1.0',
  capabilities: ['chat'],
}

/**
 * Called once on startup to register the agent with the Open-Stellar runtime.
 * Extend this function to add custom initialisation logic (e.g. loading models,
 * connecting to external services, etc.).
 */
export async function registerAgent(config: AgentConfig = agentConfig): Promise<void> {
  console.log(`[open-stellar] Registering agent: ${config.name} (${config.id}) v${config.version}`)
  // TODO: add your agent initialisation logic here
}
