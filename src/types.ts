export interface GeneratedArticle {
  id: string;
  headline: string;
  content: string;
  coreTakeaways: string[];
  hashtags: string[];
  mentions: string[];
  category: string;
  writingStyle: string;
  topic: string;
  createdAt: string;
  meta: {
    wordCount: number;
    charCount: number;
    readTimeMinutes: number;
    provider: 'n8n Webhook' | 'Gemini AI Agent' | 'Pipeline Simulator';
    executionTimeMs?: number;
  };
  rawPayload?: Record<string, unknown>;
  rawResponse?: Record<string, unknown>;
}

export interface N8nSettings {
  webhookUrl: string;
  publishWebhookUrl: string;
  simulateLatency: boolean;
  apiKeyHeader?: string;
  apiKeySecret?: string;
  lastPingStatus?: 'connected' | 'error' | 'untested';
  lastPingLatencyMs?: number;
  lastTestedAt?: string;
}

