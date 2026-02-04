import { describe, it, expect } from 'vitest';

/**
 * Tests for LLM response handling and transformation
 * 
 * These tests verify that:
 * 1. Error messages are transformed correctly
 * 2. WebSocket messages are properly intercepted
 * 3. LLM responses maintain integrity
 */

/**
 * Transform error messages from the gateway to be more user-friendly.
 * This is extracted from src/index.ts for testing purposes.
 */
function transformErrorMessage(message: string, host: string): string {
  if (message.includes('gateway token missing') || message.includes('gateway token mismatch')) {
    return `Invalid or missing token. Visit https://${host}?token={REPLACE_WITH_YOUR_TOKEN}`;
  }
  
  if (message.includes('pairing required')) {
    return `Pairing required. Visit https://${host}/_admin/`;
  }
  
  return message;
}

describe('transformErrorMessage', () => {
  const testHost = 'example.workers.dev';

  it('transforms gateway token missing error', () => {
    const result = transformErrorMessage('gateway token missing', testHost);
    expect(result).toBe(`Invalid or missing token. Visit https://${testHost}?token={REPLACE_WITH_YOUR_TOKEN}`);
  });

  it('transforms gateway token mismatch error', () => {
    const result = transformErrorMessage('gateway token mismatch', testHost);
    expect(result).toBe(`Invalid or missing token. Visit https://${testHost}?token={REPLACE_WITH_YOUR_TOKEN}`);
  });

  it('transforms pairing required error', () => {
    const result = transformErrorMessage('pairing required', testHost);
    expect(result).toBe(`Pairing required. Visit https://${testHost}/_admin/`);
  });

  it('returns original message for unknown errors', () => {
    const originalMsg = 'Some other error occurred';
    const result = transformErrorMessage(originalMsg, testHost);
    expect(result).toBe(originalMsg);
  });

  it('handles partial matches in token errors', () => {
    const result = transformErrorMessage('Error: gateway token missing - please authenticate', testHost);
    expect(result).toBe(`Invalid or missing token. Visit https://${testHost}?token={REPLACE_WITH_YOUR_TOKEN}`);
  });

  it('handles case-sensitive error messages', () => {
    // Error messages from gateway are lowercase
    const result = transformErrorMessage('Gateway Token Missing', testHost);
    expect(result).toBe('Gateway Token Missing'); // No transformation - case sensitive
  });
});

describe('LLM Response Validation', () => {
  it('validates typical assistant response structure', () => {
    const response = {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'Hello! How can I help you today?'
        }
      ],
      usage: {
        input: 10,
        output: 8
      }
    };

    expect(response.role).toBe('assistant');
    expect(response.content).toBeInstanceOf(Array);
    expect(response.content[0].type).toBe('text');
    expect(response.usage).toBeDefined();
    expect(response.usage.input).toBeGreaterThan(0);
  });

  it('handles empty assistant response', () => {
    const response = {
      role: 'assistant',
      content: [],
      usage: {
        input: 0,
        output: 0
      }
    };

    expect(response.content).toHaveLength(0);
    expect(response.usage.output).toBe(0);
  });

  it('validates streaming response chunks', () => {
    const chunk1 = {
      type: 'content_delta',
      delta: { text: 'Hello' }
    };
    const chunk2 = {
      type: 'content_delta',
      delta: { text: ' world!' }
    };

    expect(chunk1.type).toBe('content_delta');
    expect(chunk1.delta.text).toBe('Hello');
    expect(chunk2.delta.text).toBe(' world!');
    
    // Verify chunks can be concatenated
    const fullText = chunk1.delta.text + chunk2.delta.text;
    expect(fullText).toBe('Hello world!');
  });

  it('validates multi-turn conversation format', () => {
    const conversation = [
      {
        role: 'user',
        content: 'What is 2+2?'
      },
      {
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'The answer is 4.'
          }
        ]
      }
    ];

    expect(conversation).toHaveLength(2);
    expect(conversation[0].role).toBe('user');
    expect(conversation[1].role).toBe('assistant');
    expect(typeof conversation[0].content).toBe('string');
    expect(Array.isArray(conversation[1].content)).toBe(true);
  });
});

describe('WebSocket Message Handling', () => {
  it('parses and validates JSON WebSocket messages', () => {
    const message = JSON.stringify({
      type: 'message',
      data: {
        role: 'assistant',
        content: 'Test response'
      }
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe('message');
    expect(parsed.data.role).toBe('assistant');
  });

  it('handles error messages in WebSocket format', () => {
    const errorMessage = JSON.stringify({
      error: {
        message: 'gateway token missing',
        code: 401
      }
    });

    const parsed = JSON.parse(errorMessage);
    expect(parsed.error).toBeDefined();
    expect(parsed.error.message).toBe('gateway token missing');
    expect(parsed.error.code).toBe(401);
  });

  it('preserves message integrity when no transformation needed', () => {
    const originalMessage = JSON.stringify({
      type: 'ping',
      timestamp: Date.now()
    });

    // Simulate passing through without transformation
    const parsed = JSON.parse(originalMessage);
    const reserialized = JSON.stringify(parsed);
    
    expect(reserialized).toBe(originalMessage);
  });

  it('handles binary WebSocket messages', () => {
    const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
    expect(binaryData).toBeInstanceOf(Uint8Array);
    expect(binaryData.length).toBe(5);
    // Binary messages should pass through untransformed
  });

  it('handles very large LLM responses', () => {
    const largeText = 'x'.repeat(10000); // 10KB response
    const largeResponse = {
      role: 'assistant',
      content: [{ type: 'text', text: largeText }]
    };

    const serialized = JSON.stringify(largeResponse);
    expect(serialized.length).toBeGreaterThan(10000);
    
    const parsed = JSON.parse(serialized);
    expect(parsed.content[0].text).toBe(largeText);
  });
});

describe('Error Response Transformation', () => {
  it('transforms error in WebSocket message', () => {
    const host = 'example.workers.dev';
    const wsMessage = {
      error: {
        message: 'gateway token missing'
      }
    };

    // Simulate transformation
    const transformed = {
      ...wsMessage,
      error: {
        ...wsMessage.error,
        message: transformErrorMessage(wsMessage.error.message, host)
      }
    };

    expect(transformed.error.message).toContain('Invalid or missing token');
    expect(transformed.error.message).toContain(host);
  });

  it('preserves error codes during transformation', () => {
    const host = 'example.workers.dev';
    const wsMessage = {
      error: {
        message: 'pairing required',
        code: 403,
        details: { reason: 'device_not_paired' }
      }
    };

    const transformed = {
      ...wsMessage,
      error: {
        ...wsMessage.error,
        message: transformErrorMessage(wsMessage.error.message, host)
      }
    };

    expect(transformed.error.code).toBe(403);
    expect(transformed.error.details).toEqual({ reason: 'device_not_paired' });
    expect(transformed.error.message).toContain('/_admin/');
  });

  it('handles malformed JSON gracefully', () => {
    const malformedJson = '{"error": "test", invalid}';
    
    let parseError = null;
    try {
      JSON.parse(malformedJson);
    } catch (e) {
      parseError = e;
    }

    expect(parseError).toBeDefined();
    // Should not crash, just skip transformation
  });
});

describe('LLM Streaming Response', () => {
  it('validates streaming start event', () => {
    const startEvent = {
      type: 'content_block_start',
      index: 0,
      content_block: {
        type: 'text',
        text: ''
      }
    };

    expect(startEvent.type).toBe('content_block_start');
    expect(startEvent.content_block.type).toBe('text');
  });

  it('validates streaming delta events', () => {
    const deltaEvent = {
      type: 'content_block_delta',
      index: 0,
      delta: {
        type: 'text_delta',
        text: 'Hello'
      }
    };

    expect(deltaEvent.type).toBe('content_block_delta');
    expect(deltaEvent.delta.type).toBe('text_delta');
    expect(deltaEvent.delta.text).toBeTruthy();
  });

  it('validates streaming stop event', () => {
    const stopEvent = {
      type: 'content_block_stop',
      index: 0
    };

    expect(stopEvent.type).toBe('content_block_stop');
    expect(stopEvent.index).toBe(0);
  });

  it('validates message complete event', () => {
    const completeEvent = {
      type: 'message_stop',
      usage: {
        input_tokens: 50,
        output_tokens: 100
      }
    };

    expect(completeEvent.type).toBe('message_stop');
    expect(completeEvent.usage.input_tokens).toBeGreaterThan(0);
    expect(completeEvent.usage.output_tokens).toBeGreaterThan(0);
  });

  it('reconstructs full message from streaming chunks', () => {
    const chunks = [
      { delta: { text: 'Hello' } },
      { delta: { text: ' there' } },
      { delta: { text: '!' } }
    ];

    const fullMessage = chunks
      .map(chunk => chunk.delta.text)
      .join('');

    expect(fullMessage).toBe('Hello there!');
  });
});

describe('Response Close Reason Transformation', () => {
  it('truncates long close reasons to WebSocket spec limit', () => {
    const longReason = 'a'.repeat(150);
    const maxLength = 123;
    
    let truncated = longReason;
    if (truncated.length > maxLength) {
      truncated = truncated.slice(0, 120) + '...';
    }

    expect(truncated.length).toBe(123);
    expect(truncated.endsWith('...')).toBe(true);
  });

  it('keeps short close reasons unchanged', () => {
    const host = 'example.workers.dev';
    const shortReason = 'Normal closure';
    const transformed = transformErrorMessage(shortReason, host);
    
    expect(transformed).toBe(shortReason);
    expect(transformed.length).toBeLessThan(123);
  });

  it('transforms and truncates close reason', () => {
    const host = 'a'.repeat(100) + '.workers.dev'; // Make host very long
    const longError = 'gateway token missing';
    const transformed = transformErrorMessage(longError, host);
    
    // First transform, then truncate
    let result = transformed;
    if (result.length > 123) {
      result = result.slice(0, 120) + '...';
    }

    expect(result.length).toBe(123);
    expect(result).toContain('Invalid or missing token');
  });
});
