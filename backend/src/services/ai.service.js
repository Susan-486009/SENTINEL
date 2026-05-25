/**
 * ai.service.js
 *
 * Communicates with the Groq API to provide assistive analysis of complaint text.
 * Enforces strict input validation screening and high-resiliency circuit breakers.
 */

import { config } from '../config/config.js';
import { AppError } from '../utils/response.js';
import { CircuitBreaker } from '../utils/circuitBreaker.js';
import { screenPromptInput, repairJsonOutput } from '../utils/aiSafety.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Initialize a shared Circuit Breaker for Groq API completions
const groqBreaker = new CircuitBreaker('GroqCompletions', {
  failureThreshold: 3,
  recoveryTimeoutMs: 30000 // 30 seconds cooldown
});

export const aiService = {
  /**
   * Analyze complaint text and return suggested metadata.
   *
   * @param {string} text - The complaint content to analyze.
   * @returns {Promise<object>} { category, priority, recommendation }
   */
  async analyzeComplaint(text) {
    if (!config.ai.groqApiKey) {
      throw new AppError('AI service is not configured (missing API key).', 503);
    }

    // 1. Filter out prompt injection threats
    screenPromptInput(text);

    // 2. Define the remote Groq request action
    const runFetch = async () => {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.groqApiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          model: config.ai.groqModel,
          messages: [
            {
              role: 'system',
              content: `You are an assistive AI for the LASUSTECH Complaint Portal.
Your task is to analyze complaint text and suggest a category, priority level, and initial recommendation for resolution.

CATEGORIES: academic-result, academic-lecturer, facility-maint, facility-hostel, admin-staff, security, financial, it-service, other
PRIORITIES: low, medium, high

Guidelines:
1. Be assistive and helpful, not authoritative. Use phrases like "Suggested category" or "It is recommended...".
2. ALWAYS return your response as a valid JSON object.
3. If the text is empty or nonsensical, provide safe defaults and a polite request for more information in the recommendation.

Response Format:
{
  "category": "category-slug",
  "priority": "low" | "medium" | "high",
  "recommendation": "Brief assistive recommendation text..."
}`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3, // Keep it deterministic
        }),
      });

      if (!response.ok) {
        throw new AppError('Failed to communicate with AI service.', 502);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new AppError('AI service returned an empty response.', 502);
      }

      return content;
    };

    // 3. Fallback deterministic payload if Groq is failing
    const fallbackPayload = JSON.stringify({
      category: 'other',
      priority: 'low',
      recommendation: 'The Sentinel AI Assistant experienced a temporary connection limit. The case remains queued for manual administration classification.',
    });

    try {
      const content = await groqBreaker.execute(runFetch, fallbackPayload);
      return repairJsonOutput(content, JSON.parse(fallbackPayload));
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('An unexpected error occurred while analyzing the complaint.', 500);
    }
  },

  /**
   * Chat with the assistant for general advice.
   *
   * @param {Array} messages - Chat history.
   * @returns {Promise<string>} AI response message content.
   */
  async chat(messages) {
    if (!config.ai.groqApiKey) {
      throw new AppError('AI service is not configured (missing API key).', 503);
    }

    // 1. Validate prompt inputs
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content;
    if (lastUserMessage) {
      screenPromptInput(lastUserMessage);
    }

    // 2. Define remote Groq chat execution
    const runChat = async () => {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.groqApiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          model: config.ai.groqModel,
          messages: [
            {
              role: 'system',
              content: `You are SENTINEL ADVISOR, a real-life, empathetic, and friendly student mentor at LASUSTECH. 
Your tone should be very human, warm, and conversational—like a senior student or a caring staff member talking to a friend.

STRICT RULES:
1. DO NOT USE MARKDOWN. NO BOLDING (**), NO ITALICS (_), NO HEADERS (#). Just plain text.
2. Avoid sounding like a machine. Don't say "Step 1", "Step 2" in a structured list. Instead, use natural sentences like "First, I think you should..." or "Maybe try starting with...".
3. Be very empathetic. If a student is stressed, acknowledge it. Use phrases like "I totally understand how frustrating that is" or "Hang in there, we'll figure this out."
4. Keep it simple and clear. No big words. No robotic structure.
5. If it's a serious issue, gently suggest they use the formal "Launch Report" button on the portal.`,
            },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new AppError('Failed to communicate with AI service.', 502);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I could not process your advice request at this time.';
    };

    const fallbackChat = 'Hang in there! The Sentinel Advisor experienced a brief network delay. Please write your message again in a short moment, we will get this resolved!';

    try {
      const content = await groqBreaker.execute(runChat, fallbackChat);
      return { content };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('An unexpected error occurred in the chat service.', 500);
    }
  },

  /**
   * Rewrite text to be professional and suitable for an official admin reply.
   *
   * @param {string} text - The draft text.
   * @returns {Promise<string>} The rewritten text.
   */
  async rewrite(text) {
    if (!config.ai.groqApiKey) {
      throw new AppError('AI service is not configured.', 503);
    }

    screenPromptInput(text);

    const runRewrite = async () => {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.groqApiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          model: config.ai.groqModel,
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant helping a university administrator write official replies to student complaints.
Rewrite the following draft to be highly professional, polite, and clear. 
DO NOT include any conversational filler (e.g. "Here is your rewritten text:").
Just output the rewritten official reply. Keep it concise.`
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new AppError('Failed to communicate with AI service.', 502);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || text;
    };

    try {
      return await groqBreaker.execute(runRewrite, text);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('An unexpected error occurred in the AI service.', 500);
    }
  },
};
