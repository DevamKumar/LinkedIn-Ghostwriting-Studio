import { GeneratedArticle } from '../types';

export const INITIAL_ARTICLE: GeneratedArticle = {
  id: 'art_default_01',
  topic: 'Why pricing too low kills 90% of solo SaaS products',
  category: 'Thought Leadership',
  writingStyle: 'Inspirational',
  headline: 'The Pricing Paradox: Why Undercharging Destroys Solopreneurs',
  content: `Charging $9/month for your software is not a growth strategy.

It's a slow death sentence for solo builders.

Here's what happens when you undercharge:

1. You attract support-heavy customers who expect custom 24/7 enterprise features for the price of two coffees.
2. You need 1,000 customers to make $9,000/month (good luck handling that support queue alone).
3. You starve your product of reinvestment capital for marketing and speed.

Last year, I watched a solo founder triple their price from $19 to $79/mo.

What happened?
• Churn dropped by 42%.
• Inbound customer quality exploded.
• MRR doubled in 60 days with fewer support tickets.

As @JustinWelsh and @AlexHormozi always preach:
"High prices create perceived value. Perceived value commands commitment. Commitment drives real outcomes."

If you're building as a 1-person company:
Stop pricing like a commodity.
Start pricing like a specialized business solution.

Are you undercharging for your offer right now? What is stopping you from raising rates today?

#Solopreneur #SaaS #BuildingInPublic #PricingStrategy #CreatorEconomy #IndieHackers`,
  coreTakeaways: [
    'Low prices attract high-friction customers who generate excessive support tickets.',
    'Higher pricing filters for committed buyers who achieve better results.',
    'A 1-person company cannot scale on high-volume, low-margin economics without burning out.',
    'Anchor pricing around the ROI delivered rather than development hours spent.'
  ],
  hashtags: ['#Solopreneur', '#SaaS', '#BuildingInPublic', '#PricingStrategy', '#CreatorEconomy', '#IndieHackers'],
  mentions: ['@JustinWelsh', '@AlexHormozi'],
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  meta: {
    wordCount: 198,
    charCount: 1354,
    readTimeMinutes: 1,
    provider: 'n8n Webhook',
    executionTimeMs: 380,
  },
  rawPayload: {
    event: 'generate_linkedin_post',
    payload: {
      topic: 'Why pricing too low kills 90% of solo SaaS products',
      category: 'Thought Leadership',
      writingStyle: 'Inspirational',
      mentions: ['@JustinWelsh', '@AlexHormozi'],
      author: {
        name: 'Alex Vance',
        headline: 'Solopreneur Creator • Building in Public',
      },
      generatedTimestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    meta: {
      source: 'LinkedIn Ghostwriting Studio',
      version: '2.0',
    },
  },
  rawResponse: {
    status: 200,
    pipeline: 'n8n-solopreneur-content-agent',
    model: 'gemini-3.7-flash',
    tokensUsed: 420,
    confidenceScore: 0.98,
  },
};

export const INITIAL_HISTORY: GeneratedArticle[] = [
  INITIAL_ARTICLE,
  {
    id: 'art_hist_02',
    topic: 'The 1-person solopreneur daily operating system',
    category: 'How-To / Tips',
    writingStyle: 'Educational',
    headline: 'The 4-Block Operating System for Solo Founders',
    content: `How I run a 6-figure 1-person business in 4 focused hours a day:

Block 1: Deep Creation (08:00 - 10:00)
• Zero notifications, zero email.
• Write 1 flagship post + iterate core product codebase.

Block 2: Audience & Inbound (10:30 - 11:30)
• Respond to all LinkedIn comments within the golden 60-minute window.
• Nurture DMs and schedule 2 high-intent client touchpoints.

Block 3: Automated Operations (14:00 - 15:00)
• Check n8n automation pipelines and Stripe webhooks.
• Review weekly cash flow and content queue.

Tagging @SamAltman and @OpenAI for making AI agents fast enough to replace full ops departments.

Structure creates freedom.

What does your daily focus block look like?

#Solopreneur #Productivity #IndieHacker #TimeManagement #CreatorEconomy`,
    coreTakeaways: [
      'Protect early morning hours for deep asymmetric creation.',
      'Batch social distribution and engagement into a dedicated 60-minute sprint.',
      'Delegate repetitive admin tasks to automated webhook agents.'
    ],
    hashtags: ['#Solopreneur', '#Productivity', '#IndieHacker', '#TimeManagement', '#CreatorEconomy'],
    mentions: ['@SamAltman', '@OpenAI'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    meta: {
      wordCount: 162,
      charCount: 1042,
      readTimeMinutes: 1,
      provider: 'n8n Webhook',
      executionTimeMs: 412,
    },
  },
  {
    id: 'art_hist_03',
    topic: 'How I turned 1 viral post into $4,200 in inbound consulting',
    category: 'Case Study',
    writingStyle: 'Storytelling',
    headline: 'Case Study: Converting LinkedIn Dwell Time into High-Ticket Clients',
    content: `Most people write on LinkedIn for likes.

I write on LinkedIn to generate pipeline.

Here is the exact 3-step breakdown of how 1 post brought in $4,200:

Step 1: The Specificity Hook
Instead of "How to grow on social media", I wrote "How we fixed 3 broken funnel stages for a B2B SaaS in 48 hours".

Step 2: Give Away the Secret, Sell the Implementation
I published the exact framework with zero gatekeeping.
Readers realized the solution was obvious, but executing it required speed and domain expertise.

Step 3: Frictionless DM Conversion
At the end of the post, I included a simple CTA: "DM me 'AUDIT' and I'll send my 10-point checklist."
Received 38 inbound messages -> 4 discovery calls -> 2 closed clients.

Big thanks to @LennyRachitsky and @HubSpot for inspiration on high-density breakdown formats.

Are you optimizing your content for vanity reach or commercial conversion?

#CaseStudy #B2BGrowth #LinkedInMarketing #Solopreneur #Consulting`,
    coreTakeaways: [
      'High-converting content solves a specific, painful problem in public.',
      'Giving away frameworks builds undeniable authority and inbound trust.',
      'Keep comment/DM conversion calls-to-action frictionless with simple trigger words.'
    ],
    hashtags: ['#CaseStudy', '#B2BGrowth', '#LinkedInMarketing', '#Solopreneur', '#Consulting'],
    mentions: ['@LennyRachitsky', '@HubSpot'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    meta: {
      wordCount: 185,
      charCount: 1210,
      readTimeMinutes: 1,
      provider: 'Gemini AI Agent',
      executionTimeMs: 490,
    },
  }
];
