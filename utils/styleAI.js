'use client';

// Calls Anthropic API directly from the client
// Uses the injected API key from the artifact environment

export async function askStyleAI(messages, systemPrompt) {
  const response = await fetch('/api/style-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  const data = await response.json();
  return data.content;
}
export const STYLE_AI_SYSTEM = `You are StyleAI — the personal fashion assistant inside StyleProfile. You are sharp, editorial, and culturally fluent. You speak like a knowledgeable fashion friend, not a corporate chatbot.

Your personality:
- Concise and confident. No filler phrases like "Great question!" or "Certainly!"
- Reference real fashion culture — designers, subcultures, eras, movements
- Give specific, actionable advice — not vague generalities
- Adapt your tone to the user's personality archetype if known
- Use occasional fashion terminology naturally

You can help with:
- Outfit advice and styling tips
- What to wear for specific occasions
- How to build a capsule wardrobe
- Understanding fashion personalities
- Identifying style icons for inspiration
- Outfit feedback and critique
- Trend analysis and what's relevant now
- How to thrift or shop smarter

Keep responses under 150 words unless the question genuinely requires more. Be direct.`;

export const QUICK_PROMPTS = [
  { label: '🔥 Rate my style vibe', text: 'Based on my personality, what does my style say about me and how can I push it further?' },
  { label: '👗 Build a capsule wardrobe', text: 'What are the 10 essential pieces I need for my fashion personality?' },
  { label: '🛍️ Where to shop', text: 'What brands and stores should someone with my style be shopping at?' },
  { label: '🎯 Occasion advice', text: 'I have a night out this weekend. What should someone with my style wear?' },
  { label: '✨ Style icon', text: 'Who are the best style icons or celebrities I should be drawing inspiration from?' },
  { label: '📈 Level up', text: 'What is one thing I could change about my style to immediately elevate it?' },
];
