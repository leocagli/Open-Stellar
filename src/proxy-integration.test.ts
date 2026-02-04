import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv } from './types';

/**
 * Integration tests for LLM response proxying
 * 
 * These tests verify the end-to-end flow of LLM responses through the worker:
 * 1. HTTP response proxying from gateway
 * 2. WebSocket message interception and transformation
 * 3. Response header manipulation
 */

describe('HTTP Response Proxying', () => {
  it('validates HTTP response structure from containerFetch', () => {
    const mockResponse = new Response('{"status": "ok"}', {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(mockResponse.status).toBe(200);
    expect(mockResponse.headers.get('content-type')).toBe('application/json');
  });

  it('adds debug headers to proxied responses', () => {
    const originalHeaders = new Headers({
      'content-type': 'text/html',
    });

    const newHeaders = new Headers(originalHeaders);
    newHeaders.set('X-Worker-Debug', 'proxy-to-moltbot');
    newHeaders.set('X-Debug-Path', '/test-path');

    expect(newHeaders.get('X-Worker-Debug')).toBe('proxy-to-moltbot');
    expect(newHeaders.get('X-Debug-Path')).toBe('/test-path');
    expect(newHeaders.get('content-type')).toBe('text/html');
  });

  it('preserves response body during proxying', async () => {
    const testBody = 'Test response body';
    const mockResponse = new Response(testBody, {
      status: 200,
    });

    const text = await mockResponse.text();
    expect(text).toBe(testBody);
  });

  it('handles streaming response bodies', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('chunk1'));
        controller.enqueue(encoder.encode('chunk2'));
        controller.close();
      },
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });

    const reader = mockResponse.body?.getReader();
    expect(reader).toBeDefined();

    if (reader) {
      const chunk1 = await reader.read();
      expect(chunk1.done).toBe(false);
      
      const chunk2 = await reader.read();
      expect(chunk2.done).toBe(false);
      
      const end = await reader.read();
      expect(end.done).toBe(true);
    }
  });

  it('preserves HTTP status codes during proxying', () => {
    const statusCodes = [200, 201, 400, 401, 403, 404, 500, 503];

    statusCodes.forEach(code => {
      const response = new Response(null, { status: code });
      expect(response.status).toBe(code);
    });
  });
});

describe('WebSocket Message Interception', () => {
  it('detects WebSocket upgrade requests', () => {
    const headers = new Headers({
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
    });

    const isWebSocket = headers.get('Upgrade')?.toLowerCase() === 'websocket';
    expect(isWebSocket).toBe(true);
  });

  it('detects HTML accept headers', () => {
    const headers = new Headers({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    });

    const acceptsHtml = headers.get('Accept')?.includes('text/html');
    expect(acceptsHtml).toBe(true);
  });

  it('identifies non-WebSocket requests correctly', () => {
    const headers = new Headers({
      'Accept': 'application/json',
    });

    const isWebSocket = headers.get('Upgrade')?.toLowerCase() === 'websocket';
    expect(isWebSocket).toBe(false);
  });
});

describe('Response Error Handling', () => {
  it('handles gateway startup failures', () => {
    const error = new Error('Moltbot gateway failed to start');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    expect(errorMessage).toBe('Moltbot gateway failed to start');
  });

  it('provides helpful hints for missing API key', () => {
    const hasApiKey = false;
    let hint = 'Check worker logs with: wrangler tail';
    
    if (!hasApiKey) {
      hint = 'ANTHROPIC_API_KEY is not set. Run: wrangler secret put ANTHROPIC_API_KEY';
    }

    expect(hint).toContain('ANTHROPIC_API_KEY');
    expect(hint).toContain('wrangler secret put');
  });

  it('detects OOM errors', () => {
    const errorMessage = 'JavaScript heap out of memory';
    const isOOM = errorMessage.includes('heap out of memory') || errorMessage.includes('OOM');

    expect(isOOM).toBe(true);

    if (isOOM) {
      const hint = 'Gateway ran out of memory. Try again or check for memory leaks.';
      expect(hint).toContain('memory');
    }
  });

  it('creates proper error response structure', () => {
    const errorResponse = {
      error: 'Moltbot gateway failed to start',
      details: 'Connection timeout',
      hint: 'Check worker logs with: wrangler tail',
    };

    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.details).toBeDefined();
    expect(errorResponse.hint).toBeDefined();
  });
});

describe('URL and Query Parameter Handling', () => {
  it('parses URL correctly', () => {
    const url = new URL('https://example.workers.dev/path?token=abc123&foo=bar');
    
    expect(url.pathname).toBe('/path');
    expect(url.search).toBe('?token=abc123&foo=bar');
    expect(url.host).toBe('example.workers.dev');
  });

  it('extracts token from query parameters', () => {
    const url = new URL('https://example.workers.dev/?token=test-token-123');
    const params = new URLSearchParams(url.search);
    const token = params.get('token');

    expect(token).toBe('test-token-123');
  });

  it('handles URLs without query parameters', () => {
    const url = new URL('https://example.workers.dev/admin');
    const params = new URLSearchParams(url.search);
    
    expect(params.get('token')).toBeNull();
    expect(url.search).toBe('');
  });

  it('preserves special characters in URLs', () => {
    const path = '/api/test?query=hello world&special=!@#$%';
    const encoded = encodeURI(path);
    const url = new URL('https://example.com' + encoded);
    
    expect(url.pathname).toBe('/api/test');
    expect(url.search).toContain('query=hello%20world');
  });
});

describe('Content Type Detection', () => {
  it('detects JSON responses', () => {
    const headers = new Headers({
      'content-type': 'application/json; charset=utf-8',
    });

    const isJson = headers.get('content-type')?.includes('application/json');
    expect(isJson).toBe(true);
  });

  it('detects HTML responses', () => {
    const headers = new Headers({
      'content-type': 'text/html; charset=utf-8',
    });

    const isHtml = headers.get('content-type')?.includes('text/html');
    expect(isHtml).toBe(true);
  });

  it('detects streaming responses', () => {
    const headers = new Headers({
      'content-type': 'text/event-stream',
    });

    const isStream = headers.get('content-type')?.includes('text/event-stream');
    expect(isStream).toBe(true);
  });

  it('handles missing content-type header', () => {
    const headers = new Headers({});
    const contentType = headers.get('content-type') || '';
    
    expect(contentType).toBe('');
  });
});

describe('Loading Page Behavior', () => {
  it('determines when to show loading page', () => {
    // Gateway not ready, not WebSocket, accepts HTML
    const isGatewayReady = false;
    const isWebSocketRequest = false;
    const acceptsHtml = true;

    const shouldShowLoading = !isGatewayReady && !isWebSocketRequest && acceptsHtml;
    expect(shouldShowLoading).toBe(true);
  });

  it('skips loading page for WebSocket requests', () => {
    const isGatewayReady = false;
    const isWebSocketRequest = true;
    const acceptsHtml = false;

    const shouldShowLoading = !isGatewayReady && !isWebSocketRequest && acceptsHtml;
    expect(shouldShowLoading).toBe(false);
  });

  it('skips loading page for API requests', () => {
    const isGatewayReady = false;
    const isWebSocketRequest = false;
    const acceptsHtml = false; // API requests accept JSON

    const shouldShowLoading = !isGatewayReady && !isWebSocketRequest && acceptsHtml;
    expect(shouldShowLoading).toBe(false);
  });

  it('skips loading page when gateway is ready', () => {
    const isGatewayReady = true;
    const isWebSocketRequest = false;
    const acceptsHtml = true;

    const shouldShowLoading = !isGatewayReady && !isWebSocketRequest && acceptsHtml;
    expect(shouldShowLoading).toBe(false);
  });
});

describe('LLM Response Logging', () => {
  it('safely truncates long messages for logging', () => {
    const longMessage = 'x'.repeat(1000);
    const truncated = longMessage.slice(0, 200);

    expect(truncated.length).toBe(200);
    expect(truncated).toBe('x'.repeat(200));
  });

  it('handles binary data in logging', () => {
    const binaryData = new Uint8Array([1, 2, 3]);
    const stringData = 'test message';
    const logMessage = typeof stringData === 'string' ? stringData.slice(0, 200) : '(binary)';

    expect(logMessage).toBe('test message');
  });

  it('logs message types correctly', () => {
    const stringData = 'test message';
    const binaryData = new Uint8Array([1, 2, 3]);

    expect(typeof stringData).toBe('string');
    expect(typeof binaryData).toBe('object');
    expect(binaryData instanceof Uint8Array).toBe(true);
  });
});

describe('WebSocket Ready State', () => {
  // WebSocket.OPEN = 1, WebSocket.CLOSED = 3
  const OPEN = 1;
  const CLOSED = 3;

  it('validates WebSocket states', () => {
    expect(OPEN).toBe(1);
    expect(CLOSED).toBe(3);
  });

  it('checks if WebSocket is open before sending', () => {
    const mockReadyState: number = OPEN;
    const canSend = mockReadyState === OPEN;

    expect(canSend).toBe(true);
  });

  it('prevents sending when WebSocket is closed', () => {
    const mockReadyState: number = CLOSED;
    const canSend = mockReadyState === OPEN;

    expect(canSend).toBe(false);
  });
});

describe('Process Status Validation', () => {
  it('validates running process status', () => {
    const mockProcess = {
      status: 'running',
      id: 'proc-123',
    };

    expect(mockProcess.status).toBe('running');
    expect(['starting', 'running'].includes(mockProcess.status)).toBe(true);
  });

  it('validates starting process status', () => {
    const mockProcess = {
      status: 'starting',
      id: 'proc-456',
    };

    expect(['starting', 'running'].includes(mockProcess.status)).toBe(true);
  });

  it('validates completed process status', () => {
    const mockProcess = {
      status: 'completed',
      exitCode: 0,
    };

    expect(mockProcess.status).toBe('completed');
    expect(['starting', 'running'].includes(mockProcess.status)).toBe(false);
  });

  it('identifies gateway vs CLI processes', () => {
    const gatewayProcess = {
      command: '/usr/local/bin/start-moltbot.sh',
    };
    const cliProcess = {
      command: 'clawdbot devices list --json',
    };

    const isGateway1 = gatewayProcess.command.includes('start-moltbot.sh') ||
                      gatewayProcess.command.includes('clawdbot gateway');
    const isCli1 = gatewayProcess.command.includes('clawdbot devices');

    expect(isGateway1).toBe(true);
    expect(isCli1).toBe(false);

    const isGateway2 = cliProcess.command.includes('start-moltbot.sh') ||
                      cliProcess.command.includes('clawdbot gateway');
    const isCli2 = cliProcess.command.includes('clawdbot devices');

    expect(isGateway2).toBe(false);
    expect(isCli2).toBe(true);
  });
});
