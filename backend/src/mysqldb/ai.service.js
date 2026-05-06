/**
 * ai.service.js
 *
 * Communicates with the Groq API to provide assistive analysis of complaint text.
 * Returns suggested category, priority, and recommendation in a structured format.
 */

import { config } from '../config/config.js';
import { AppError } from '../utils/response.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    try {
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Groq API Error:', errorData);
        throw new AppError('Failed to communicate with AI service.', 502);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new AppError('AI service returned an empty response.', 502);
      }

      return JSON.parse(content);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error('AI Service Exception:', err);
      throw new AppError('An unexpected error occurred while analyzing the complaint.', 500);
    }
  },
};
