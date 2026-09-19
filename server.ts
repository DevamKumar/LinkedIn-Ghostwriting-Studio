import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));



// Configured default n8n webhook URLs
const DEFAULT_GENERATE_WEBHOOK_URL = 'https://shauryagupta.app.n8n.cloud/webhook/post-generator';
const DEFAULT_PUBLISH_WEBHOOK_URL = 'https://shauryagupta.app.n8n.cloud/webhook/post-to-linkedin';

async function handleGenerateFallback(topic: string, startTime: number, res: any) {
  let fallbackData;

  while (!fallbackData) {
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`[Fallback] Using Gemini to generate post for topic: ${topic}`);
        const prompt = `Write a LinkedIn post about the following topic: ${topic}. 
It should be highly engaging, professional, and targeted towards founders and engineers.
Output ONLY a JSON object with the exact following fields:
- headline (string)
- content (string)
- coreTakeaways (array of strings)
- hashtags (array of strings)`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const textResponse = result.candidates[0].content.parts[0].text;
          try {
            fallbackData = JSON.parse(textResponse);
            if (!fallbackData.content) throw new Error("Missing content in Gemini response");
            fallbackData.provider = 'Gemini API Fallback';
            fallbackData.category = 'Learning Arc';
            fallbackData.writingStyle = 'Reflective';
            fallbackData.mentions = [];
          } catch (e) {
            console.error("Gemini returned invalid JSON. Retrying...");
            fallbackData = null;
          }
        } else {
          console.error(`Gemini API failed with status ${response.status}. Retrying...`);
        }
      } catch (err) {
        console.error(`Gemini fallback failed:`, err, `. Retrying...`);
      }
    } else {
      console.error("GEMINI_API_KEY not set. Cannot use Gemini. Retrying in 5 seconds...");
    }
    
    if (!fallbackData) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const words = fallbackData.content.trim().split(/\s+/).filter(Boolean).length;
  
  const generatedArticle = {
    id: `art_${Date.now()}`,
    ...fallbackData,
    topic,
    createdAt: new Date().toISOString(),
    meta: {
      wordCount: words,
      charCount: fallbackData.content.length,
      readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
      provider: fallbackData.provider,
      executionTimeMs: Date.now() - startTime,
    },
    rawPayload: {},
    rawResponse: {}
  };

  try {
    const archivePath = path.join(process.cwd(), 'archive.json');
    let archiveData = { history: [] as any[] };
    if (fs.existsSync(archivePath)) {
      archiveData = JSON.parse(fs.readFileSync(archivePath, 'utf-8'));
    }
    archiveData.history.unshift(generatedArticle);
    fs.writeFileSync(archivePath, JSON.stringify(archiveData, null, 2));
  } catch (e) {
    console.error('Failed to save to archive', e);
  }
  
  return res.json(generatedArticle);
}

// Ping test for n8n webhook
app.post('/api/n8n/ping', async (req, res) => {
  const { webhookUrl, headers } = req.body;
  const startTime = Date.now();

  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
    // Simulated ping success for default built-in automation
    return res.json({
      status: 'success',
      mode: 'simulated',
      latencyMs: 42,
      message: 'Simulated n8n Webhook Node is active and accepting payloads.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-LinkedIn-Ghostwriting-Studio/1.0',
        ...(headers || {}),
      },
      body: JSON.stringify({
        ping: true,
        source: 'LinkedIn Ghostwriting Studio',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    res.json({
      status: response.ok ? 'success' : 'warning',
      statusCode: response.status,
      latencyMs,
      message: response.ok
        ? `n8n Webhook responded with status ${response.status} in ${latencyMs}ms`
        : `n8n Webhook returned HTTP ${response.status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    res.json({
      status: 'error',
      latencyMs,
      message: error.name === 'AbortError' ? 'Webhook ping timed out after 6s' : error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Generate New Topics Endpoint
app.post('/api/topics/generate', async (req, res) => {
  const FILE_PATH = path.join(process.cwd(), 'linkedin-topic.json');
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let existingData = { linkedin_topics: [] };
    if (fs.existsSync(FILE_PATH)) {
      const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
      existingData = JSON.parse(fileContent);
    }
    const existingTopics = existingData.linkedin_topics || [];
    const existingTitles = existingTopics.map((t: any) => t.topic);
    
    const prompt = `
You are an expert AI engineer and content creator.
Here are the titles of existing LinkedIn topics we have covered:
${JSON.stringify(existingTitles, null, 2)}

Please generate 2 NEW and unique LinkedIn post topics that logically follow, complement, or expand upon these existing themes.
The topics should be highly engaging, educational, and targeted towards software engineers learning AI and AI Engineering.
Crucially, these 2 topics must establish high credibility. Use specific technical terminology appropriately, draw on real-world engineering challenges, and avoid superficial buzzwords.

You must return ONLY valid JSON representing an array of objects. 
Each object must have exactly two string fields:
- "topic": The title of the topic
- "description": A short paragraph explaining what the post should cover.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) return res.status(500).json({ error: 'Empty response' });

    const newTopics = JSON.parse(response.text);
    if (!Array.isArray(newTopics)) return res.status(500).json({ error: 'API did not return a JSON array' });

    let nextId = 1;
    if (existingTopics.length > 0) {
      const ids = existingTopics.map((t: any) => t.id || 0);
      nextId = Math.max(...ids) + 1;
    }

    for (const t of newTopics) {
      existingTopics.push({ id: nextId, topic: t.topic || '', description: t.description || '' });
      nextId++;
    }

    fs.writeFileSync(FILE_PATH, JSON.stringify({ linkedin_topics: existingTopics }, null, 2));
    res.json({ success: true, count: newTopics.length, topics: newTopics });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate topics', details: err.message });
  }
});

// Get Unused Topics Endpoint
app.get('/api/topics/unused', (req, res) => {
  const FILE_PATH = path.join(process.cwd(), 'linkedin-topic.json');
  try {
    if (!fs.existsSync(FILE_PATH)) return res.json({ topics: [] });
    
    const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    const topics = data.linkedin_topics || [];
    
    const available = topics.filter((t: any) => !t.used);
    res.json({ topics: available });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch unused topics', details: err.message });
  }
});

// Mark Topic as Used Endpoint
app.post('/api/topics/mark-used', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const FILE_PATH = path.join(process.cwd(), 'linkedin-topic.json');
  try {
    if (!fs.existsSync(FILE_PATH)) return res.status(404).json({ error: 'File not found' });
    
    const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    const topics = data.linkedin_topics || [];
    
    const topic = topics.find((t: any) => t.id === id);
    if (topic) {
        topic.used = true;
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
        return res.json({ success: true, message: `Topic ${id} marked as used.` });
    } else {
        return res.status(404).json({ error: `Topic ${id} not found.` });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark topic as used', details: err.message });
  }
});

// Primary Article Generation Endpoint
app.post('/api/n8n/generate', async (req, res) => {
  const startTime = Date.now();
  const { topic, fullPrompt, customWebhookUrl, authorName, authorHeadline } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Topic or prompt is required' });
  }

  const outgoingPayload = {
    event: 'generate_linkedin_post',
    payload: {
      topic,
      fullPrompt,
      author: {
        name: authorName || 'Solopreneur Founder',
        headline: authorHeadline || 'Solopreneur Creator • Building in Public',
      },
      generatedTimestamp: new Date().toISOString(),
    },
    meta: {
      source: 'LinkedIn Ghostwriting Studio',
      version: '2.0',
    },
  };

  // 1. Try Custom or Default n8n Webhook
  const targetWebhookUrl = customWebhookUrl || DEFAULT_GENERATE_WEBHOOK_URL;
  if (targetWebhookUrl && typeof targetWebhookUrl === 'string' && targetWebhookUrl.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const n8nResponse = await fetch(targetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outgoingPayload),
        signal: controller.signal,
      });

      if (n8nResponse.ok) {
        let json: any = null;
        const contentType = n8nResponse.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          json = await n8nResponse.json();
        } else {
          const rawText = await n8nResponse.text();
          try {
            json = JSON.parse(rawText);
          } catch {
            json = { content: rawText };
          }
        }
        clearTimeout(timeout);

        const executionTimeMs = Date.now() - startTime;

        // Normalize possible n8n return structures (Array, { json: ... }, { output: ... }, etc.)
        let articleData = json;
        if (Array.isArray(json) && json.length > 0) {
          articleData = json[0].json || json[0].data || json[0];
        } else if (json && typeof json === 'object') {
          articleData = json.article || json.data || json.output || json.result || json.json || json;
        }

        let formattedContent = '';
        if (typeof articleData === 'string') {
          formattedContent = articleData;
        } else if (articleData && typeof articleData === 'object') {
          formattedContent =
            articleData.content ||
            articleData.post ||
            articleData.body ||
            articleData.text ||
            articleData.output ||
            articleData.message ||
            JSON.stringify(articleData, null, 2);
        } else {
          formattedContent = String(articleData || '');
        }

        const headline =
          (articleData && typeof articleData === 'object' && (articleData.headline || articleData.title)) ||
          `The Solopreneur Playbook: ${topic}`;

        const coreTakeaways =
          articleData && typeof articleData === 'object' && Array.isArray(articleData.coreTakeaways)
            ? articleData.coreTakeaways
            : [
                'Leverage automated workflows to run a 1-person company with enterprise scale.',
                'Prioritize distribution and magnetic hooks before feature expansion.',
                'Engage directly in public to compound inbound client pipeline.',
              ];

        const hashtags =
          articleData && typeof articleData === 'object' && Array.isArray(articleData.hashtags)
            ? articleData.hashtags
            : ['#Solopreneur', '#BuildingInPublic', '#LinkedInGrowth', '#CreatorEconomy'];

        const words = formattedContent.trim().split(/\s+/).filter(Boolean).length;
        const chars = formattedContent.length;

        const generatedArticle = {
          id: `art_${Date.now()}`,
          headline,
          content: formattedContent,
          coreTakeaways,
          hashtags,
          mentions: (articleData && articleData.mentions) || [],
          category: 'Learning Arc',
          writingStyle: 'Reflective',
          topic,
          createdAt: new Date().toISOString(),
          meta: {
            wordCount: words,
            charCount: chars,
            readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
            provider: 'n8n Webhook',
            executionTimeMs,
          },
          rawPayload: outgoingPayload,
          rawResponse: json,
        };

        try {
          const archivePath = path.join(process.cwd(), 'archive.json');
          let archiveData = { history: [] as any[] };
          if (fs.existsSync(archivePath)) {
            archiveData = JSON.parse(fs.readFileSync(archivePath, 'utf-8'));
          }
          archiveData.history.unshift(generatedArticle);
          fs.writeFileSync(archivePath, JSON.stringify(archiveData, null, 2));
        } catch (e) {
          console.error('Failed to save to archive', e);
        }

        return res.json(generatedArticle);
      } else {
        console.warn(`n8n webhook returned status ${n8nResponse.status}. Using fallback.`);
        return handleGenerateFallback(topic, startTime, res);
      }
    } catch (err: any) {
      console.error(`n8n webhook failed: ${err.message}. Using fallback.`);
      return handleGenerateFallback(topic, startTime, res);
    }
  }

  console.warn(`No valid webhook URL. Using fallback.`);
  return handleGenerateFallback(topic, startTime, res);


});

// Direct Publish Endpoint (Dispatches to LinkedIn webhook or simulation)
app.post('/api/n8n/publish', async (req, res) => {
  const { post, publishWebhookUrl } = req.body;

  if (!post || !post.content) {
    return res.status(400).json({ error: 'Post content is required for publishing' });
  }

  const targetPublishUrl = publishWebhookUrl || DEFAULT_PUBLISH_WEBHOOK_URL;

  if (!targetPublishUrl || typeof targetPublishUrl !== 'string' || !targetPublishUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Valid publish URL is required' });
  }

  while (true) {
    try {
      const response = await fetch(targetPublishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'linkedin_direct_publish',
          post,
          publishedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error(`n8n Publish Webhook returned HTTP ${response.status}. Retrying...`);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      let result: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch {
          result = { message: 'Successfully dispatched to LinkedIn webhook' };
        }
      } else {
        const text = await response.text();
        result = { message: text || 'Successfully dispatched to LinkedIn webhook' };
      }

      return res.json({
        success: true,
        message: 'Successfully dispatched to LinkedIn via n8n pipeline!',
        response: result,
      });
    } catch (err: any) {
      console.error(`Publishing webhook failed: ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
});

// ---- BACKEND SCHEDULER SYSTEM ----
const SCHEDULE_FILE = path.join(process.cwd(), 'schedule.json');
const ARCHIVE_FILE = path.join(process.cwd(), 'archive.json');

app.get('/api/archive', (req, res) => {
  try {
    if (!fs.existsSync(ARCHIVE_FILE)) return res.json({ history: [] });
    const fileContent = fs.readFileSync(ARCHIVE_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    res.json({ history: data.history || [] });
  } catch (err: any) {
    console.error('Failed to fetch archive', err);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

async function getOrInitDailySchedules() {
  const todayString = new Date().toLocaleDateString('en-CA');
  let schedules: any[] = [];

  if (fs.existsSync(SCHEDULE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
      if (data.date === todayString) {
        return data.schedules || [];
      }
    } catch (e) {
      console.error('Error reading schedule.json', e);
    }
  }

  // Generate new schedule for today
  console.log(`[Scheduler] Generating new automated schedule for ${todayString}...`);
  const TOPICS_FILE = path.join(process.cwd(), 'linkedin-topic.json');
  let available = [];
  if (fs.existsSync(TOPICS_FILE)) {
    const data = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
    available = (data.linkedin_topics || []).filter((t: any) => !t.used);
  }

  if (available.length >= 10) {
    const shuffled = available.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    schedules = selected.map((t: any) => {
      const delay = Math.floor(Math.random() * (endOfDay.getTime() - now.getTime()));
      return {
        id: t.id,
        topic: t.topic,
        description: t.description,
        scheduledTime: now.getTime() + delay,
        processed: false
      };
    });
    
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify({ date: todayString, schedules }, null, 2));
    console.log(`[Scheduler] 10 posts scheduled for today.`);
  } else {
    console.log(`[Scheduler] Not enough unused topics available!`);
  }
  
  return schedules;
}

app.get('/api/schedules', async (req, res) => {
  const schedules = await getOrInitDailySchedules();
  res.json({ schedules });
});

function startSchedulerLoop() {
  setInterval(async () => {
    const todayString = new Date().toLocaleDateString('en-CA');
    const schedules = await getOrInitDailySchedules();
    let updated = false;

    for (let s of schedules) {
      if (!s.processed && Date.now() >= s.scheduledTime && !s.processing) {
        console.log(`[Scheduler] Executing scheduled post: ${s.topic}`);
        s.processing = true; // prevent re-entry
        updated = true;
        fs.writeFileSync(SCHEDULE_FILE, JSON.stringify({ date: todayString, schedules }, null, 2));

        // Fire and forget execution pipeline
        (async () => {
           try {
             const genRes = await fetch(`http://127.0.0.1:${PORT}/api/n8n/generate`, {
               method: 'POST',
               headers: {'Content-Type':'application/json'},
               body: JSON.stringify({
                 topic: s.topic,
                 fullPrompt: `${s.topic} - ${s.description}`,
                 customWebhookUrl: DEFAULT_GENERATE_WEBHOOK_URL
               })
             });
             const genData = await genRes.json();
             
             if (genRes.ok) {
                const pubRes = await fetch(`http://127.0.0.1:${PORT}/api/n8n/publish`, {
                  method: 'POST',
                  headers: {'Content-Type':'application/json'},
                  body: JSON.stringify({
                    post: genData,
                    publishWebhookUrl: DEFAULT_PUBLISH_WEBHOOK_URL
                  })
                });
                
                if (pubRes.ok) {
                  // Mark as used
                  await fetch(`http://127.0.0.1:${PORT}/api/topics/mark-used`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ id: s.id })
                  });
                  // Replenish
                  await fetch(`http://127.0.0.1:${PORT}/api/topics/generate`, { method: 'POST' });
                  console.log(`[Scheduler] Successfully finished full pipeline for: ${s.topic}`);
                  s.processed = true;
                }
             }
           } catch(e) {
             console.error(`[Scheduler] Pipeline error for ${s.topic}:`, e);
           } finally {
             s.processing = false;
             fs.writeFileSync(SCHEDULE_FILE, JSON.stringify({ date: todayString, schedules }, null, 2));
           }
        })();
      }
    }
  }, 10000); // Check every 10 seconds
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    startSchedulerLoop();
  });
}

startServer();
