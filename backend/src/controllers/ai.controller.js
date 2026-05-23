/**
 * ai.controller.js
 *
 * Controller for AI-powered assistant endpoints.
 */

import { aiService }    from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/response.js';
import { AppError }     from '../utils/response.js';
import { Chat }         from '../models/Chat.js';

/**
 * POST /api/v1/ai/analyze
 * Analyzes the provided complaint text and returns assistive suggestions.
 */
export const analyzeComplaint = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || String(text).trim().length < 10) {
    throw new AppError('Complaint text is required and must be at least 10 characters long.', 400);
  }

  const analysis = await aiService.analyzeComplaint(text);

  sendSuccess(res, analysis, 'Analysis completed successfully.');
});

/**
 * POST /api/v1/ai/chat
 * Chat with the Sentinel AI assistant for advice.
 */
export const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    throw new AppError('Chat messages are required.', 400);
  }

  const response = await aiService.chat(messages);

  sendSuccess(res, response, 'Response received.');
});

/**
 * GET /api/v1/ai/history
 * Fetch the authenticated user's chat history.
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const history = await Chat.find({ user: userId }).sort({ createdAt: 1 });
  sendSuccess(res, history, 'Chat history retrieved.');
});

/**
 * POST /api/v1/ai/history
 * Save a single chat message for the authenticated user.
 */
export const saveChatMessage = asyncHandler(async (req, res) => {
  const { role, content } = req.body;

  if (!role || !content) {
    throw new AppError('Role and content are required to save a message.', 400);
  }

  const userId = req.user._id || req.user.id;
  const message = await Chat.create({
    user: userId,
    role,
    content
  });

  sendSuccess(res, message, 'Message saved.', 201);
});
