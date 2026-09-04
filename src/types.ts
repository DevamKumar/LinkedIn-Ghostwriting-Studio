export type ContentCategory =
  | 'Thought Leadership'
  | 'Personal Story'
  | 'Industry Insight'
  | 'Case Study'
  | 'Announcement'
  | 'How-To / Tips'
  | 'Career Advice';

export type WritingStyle =
  | 'Professional'
  | 'Inspirational'
  | 'Educational'
  | 'Storytelling'
  | 'Conversational'
  | 'Promotional';

export interface GenerationRequest {
  topic: string;
  category: ContentCategory;
  writingStyle: WritingStyle;
  mentions: string[];
  customWebhookUrl?: string;
  authorName?: string;
  authorHeadline?: string;
}

export interface GeneratedArticle {
  id: string;
  headline: string;
  content: string;
  coreTakeaways: string[];
  hashtags: string[];
  mentions: string[];
  category: ContentCategory;
  writingStyle: WritingStyle;
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

export interface GenerationStep {
  step: 1 | 2 | 3;
  label: string;
  status: 'pending' | 'active' | 'completed';
}
