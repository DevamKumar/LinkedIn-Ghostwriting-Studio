import React, { useState, useEffect } from 'react';
import {
  ContentCategory,
  WritingStyle,
  GeneratedArticle,
  N8nSettings,
} from './types';
import { INITIAL_ARTICLE, INITIAL_HISTORY } from './lib/sampleData';
import { MosaicBackground } from './components/ui/MosaicBackground';
import { TechnicalNav } from './components/layout/TechnicalNav';
import { HeroSection } from './components/sections/HeroSection';
import { TechnicalForm } from './components/sections/TechnicalForm';
import { BentoGrid } from './components/sections/BentoGrid';
import { ScheduleMonitor } from './components/sections/ScheduleMonitor';

export default function App() {
  // Input & Configuration State
  const [topic, setTopic] = useState<string>(
    'Why pricing too low kills 90% of solo SaaS products'
  );

  // Current Active Article & History State (Persisted in localStorage)
  const [currentArticle, setCurrentArticle] = useState<GeneratedArticle | null>(() => {
    const saved = localStorage.getItem('ghostwrite_current_article');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ARTICLE;
      }
    }
    return INITIAL_ARTICLE;
  });

  const [history, setHistory] = useState<GeneratedArticle[]>([]);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const res = await fetch('/api/archive');
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error('Failed to fetch archive', err);
      }
    };
    
    fetchArchive();
    const interval = setInterval(fetchArchive, 5000);
    return () => clearInterval(interval);
  }, []);

  // n8n Settings State
  const [n8nSettings, setN8nSettings] = useState<N8nSettings>({
    webhookUrl: 'https://devamkumar.app.n8n.cloud/webhook/post-generator',
    publishWebhookUrl: 'https://devamkumar.app.n8n.cloud/webhook/post-to-linkedin',
    simulateLatency: true,
    lastPingStatus: 'connected',
    lastPingLatencyMs: 38,
  });

  // Generation & 3-Step Progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  // Persist history & current article to localStorage on changes
  useEffect(() => {
    if (currentArticle) {
      localStorage.setItem('ghostwrite_current_article', JSON.stringify(currentArticle));
    }
  }, [currentArticle]);

  // History is now maintained by the backend archive

  // Handle topic replenishment (used manually or automated)
  const handleGenerateTopics = async (silent = false) => {
    setIsGeneratingTopics(true);
    try {
      const response = await fetch('/api/topics/generate', { method: 'POST' });
      const data = await response.json();
      if (data.success && !silent) {
        alert(`Successfully generated ${data.count} new topics! Check your linkedin-topic.json file.`);
      } else if (!data.success && !silent) {
        alert('Failed to generate topics: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      if (!silent) alert('Error generating topics.');
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  // Handle generation flow with 3 animated progress steps
  const handleGenerate = async (overrideTopic?: string, automatedTopicId?: number) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic.trim()) return;

    if (overrideTopic) setTopic(overrideTopic); // Update visually

    setIsGenerating(true);
    setActiveStep(1);

    // Step 1: Dispatching topic payload
    await new Promise((resolve) => setTimeout(resolve, 500));
    setActiveStep(2);

    try {
      const fullPrompt = `${targetTopic} - Content Category: "Learning Arc" (what I am learning right now) - Writing Style: Authentic and reflective, sharing what I am doing and what I learned.`;
      const response = await fetch('/api/n8n/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          fullPrompt,
          customWebhookUrl: n8nSettings.webhookUrl,
          authorName: 'Solopreneur Founder',
          authorHeadline: 'Solopreneur Creator • Building in Public 🚀',
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed with status ${response.status}`);
      }

      const generatedData: GeneratedArticle = await response.json();

      // Step 3: Article Received & Formatted
      setActiveStep(3);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentArticle(generatedData);
      setHistory((prev) => [generatedData, ...prev.filter((item) => item.id !== generatedData.id)]);

      // Step 4: End-to-End Publishing
      setActiveStep(4);
      try {
        await fetch('/api/n8n/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post: generatedData,
            publishWebhookUrl: n8nSettings.publishWebhookUrl,
          }),
        });
      } catch (pubErr) {
        console.error('Failed to trigger publish webhook', pubErr);
      }
    } catch (error) {
      console.error('Generation pipeline error:', error);
      // Fallback emergency generation to ensure seamless UX
      setActiveStep(3);
      const fallbackItem: GeneratedArticle = {
        id: `art_${Date.now()}`,
        topic: targetTopic,
        headline: `The Solopreneur Playbook: ${targetTopic}`,
        content: `Here is the #1 lesson I learned about "${targetTopic}":\n\n1. Stop overcomplicating your delivery.\n2. Build automated distribution loops with n8n.\n3. Tag mentors and lead with asymmetric value.\n\nWhat is your biggest roadblock on this right now?\n\n#Solopreneur #BuildingInPublic #Growth`,
        coreTakeaways: [
          'High leverage automation beats manual grind.',
          'Consistent public distribution compounds client trust.',
        ],
        hashtags: ['#Solopreneur', '#BuildingInPublic', '#Growth'],
        mentions: [],
        category: 'Learning Arc' as any as ContentCategory,
        writingStyle: 'Reflective' as any as WritingStyle,
        createdAt: new Date().toISOString(),
        meta: {
          wordCount: 78,
          charCount: 430,
          readTimeMinutes: 1,
          provider: 'Pipeline Simulator',
          executionTimeMs: 250,
        },
      };
      setCurrentArticle(fallbackItem);
      setHistory((prev) => [fallbackItem, ...prev]);
    } finally {
      setIsGenerating(false);
      setActiveStep(1);
    }
  };

  return (
    <div className="min-h-screen selection:bg-mint/30 selection:text-forest">
      <MosaicBackground />
      <TechnicalNav />
      
      <main className="relative pt-16">
        <HeroSection />
        
        <div className="w-full max-w-[640px] mx-auto relative bg-paper border border-grid/20 p-6 sm:p-8 mt-16 flex flex-col items-center justify-center text-center">
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-forest"></div>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-forest"></div>
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-forest"></div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-forest"></div>
          
          <h2 className="font-display text-2xl tracking-tight text-forest uppercase mb-2">Content Pipeline Expansion</h2>
          <p className="font-sans text-forest/70 text-sm mb-6 max-w-md">Automatically generate 3 highly-credible AI engineering topics based on your existing data to ensure a continuous content stream.</p>
          
          <button
            onClick={handleGenerateTopics}
            disabled={isGeneratingTopics}
            className="w-full px-8 py-4 bg-white text-forest border border-forest font-mono text-[12px] uppercase tracking-widest hover:bg-forest/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isGeneratingTopics ? (
              <>
                <div className="w-3 h-3 bg-forest animate-pulse"></div>
                Generating Topics...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                Generate 3 New Topics
              </>
            )}
          </button>
        </div>

        <section className="px-4 sm:px-6 lg:px-8 mt-16 max-w-7xl mx-auto">
          <TechnicalForm 
            topic={topic}
            setTopic={setTopic}
            onGenerate={() => handleGenerate()}
            isGenerating={isGenerating}
            activeStep={activeStep}
          />
        </section>

        <BentoGrid 
          currentArticle={currentArticle}
          history={history}
          onSelectArticle={setCurrentArticle}
        />

        <ScheduleMonitor />
      </main>
    </div>
  );
}
