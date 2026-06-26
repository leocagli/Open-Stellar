import { createHmac } from "node:crypto"
import { subscribeToSystemEvents, type PublishedSystemEvent } from "@/lib/events/system-events"
import { appendWebhookDeliveryAttempt } from "@/lib/webhooks/delivery-log"
import { listWebhooksWithSecrets, type WebhookRegistration } from "@/lib/webhooks/store"

const WEBHOOK_TIMEOUT_MS = 5_000
const WEBHOOK_RETRY_DELAY_MS = 10_000

let retryDelayMs = WEBHOOK_RETRY_DELAY_MS

const globalState = globalThis as typeof globalThis & {
  __openStellarWebhookDeliveryRegistered__?: boolean
}

interface WebhookPostResult {
  durationMs: number
  responseStatus: number | null
  ok: boolean
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function signWebhookBody(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
}

async function postWebhook(url: string, body: string, secret: string): Promise<WebhookPostResult> {
  const controller = new AbortController()
  const startedAt = Date.now()
  const timeout = setTimeout(() => {
    controller.abort()
  }, WEBHOOK_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Open-Stellar-Signature": signWebhookBody(body, secret),
      },
      body,
      signal: controller.signal,
    })
    return {
      durationMs: Date.now() - startedAt,
      responseStatus: response.status,
      ok: response.ok,
    }
  } catch {
    return {
      durationMs: Date.now() - startedAt,
      responseStatus: null,
      ok: false,
    }
  } finally {
    clearTimeout(timeout)
  }
}

function recordDeliveryAttempt(
  webhook: WebhookRegistration,
  event: string,
  result: WebhookPostResult,
  retried: boolean,
): void {
  try {
    appendWebhookDeliveryAttempt({
      webhookId: webhook.id,
      event,
      deliveredAt: new Date().toISOString(),
      durationMs: result.durationMs,
      responseStatus: result.responseStatus,
      ok: result.ok,
      retried,
    })
  } catch {
    // Delivery should not depend on local log persistence.
  }
}

async function deliverToWebhook(webhook: WebhookRegistration, event: string, body: string): Promise<void> {
  const firstAttempt = await postWebhook(webhook.url, body, webhook.secret)
  recordDeliveryAttempt(webhook, event, firstAttempt, false)
  if (firstAttempt.ok) return

  await sleep(retryDelayMs)
  const retryAttempt = await postWebhook(webhook.url, body, webhook.secret)
  recordDeliveryAttempt(webhook, event, retryAttempt, true)
}

export async function deliverWebhookEvent(event: PublishedSystemEvent): Promise<void> {
  const matchingWebhooks = listWebhooksWithSecrets().filter((webhook) => webhook.events.includes(event.type))
  if (matchingWebhooks.length === 0) return

  const body = JSON.stringify({
    type: event.type,
    payload: event,
  })

  await Promise.all(matchingWebhooks.map((webhook) => deliverToWebhook(webhook, event.type, body)))
}

export function registerWebhookDeliveryListener(): void {
  if (globalState.__openStellarWebhookDeliveryRegistered__) return
  globalState.__openStellarWebhookDeliveryRegistered__ = true

  subscribeToSystemEvents((event) => {
    void deliverWebhookEvent(event).catch(() => undefined)
  })
}

registerWebhookDeliveryListener()

export function setWebhookRetryDelayForTests(ms: number): void {
  retryDelayMs = ms
}

export function resetWebhookRetryDelayForTests(): void {
  retryDelayMs = WEBHOOK_RETRY_DELAY_MS
}
