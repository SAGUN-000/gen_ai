 
import type { Request, Response } from "express";

import type {
  ChatRequest,
  ChatResponse,
} from "../schema/chat.schema.js";

import {
  chatService,
  getConversationsService,
  getMessageHistoryService,
} from "../service/chat.service.js";

// --------------------------------------------------
// SEND MESSAGE TO AI
// --------------------------------------------------

const chatWithAI = async (req: Request, res: Response) => {
  // Ensure the user is authenticated.
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const content = req.body as ChatRequest;

  // Process the message and generate an AI response.
  const response: ChatResponse = await chatService(
    content,
    req.user.id
  );

  return res.status(200).json(response);
};

// --------------------------------------------------
// GET ALL CONVERSATIONS OF THE AUTHENTICATED USER
// --------------------------------------------------

const getAllChats = async (req: Request, res: Response) => {
  // Ensure the user is authenticated.
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const userId: string = req.user.id;

  // Retrieve all conversations belonging to this user.
  const chats = await getConversationsService(userId);

  return res.status(200).json(chats);
};

// --------------------------------------------------
// GET MESSAGE HISTORY OF A SPECIFIC CONVERSATION
// --------------------------------------------------

const getMessageHistory = async (req: Request, res: Response) => {
  // Ensure the user is authenticated.
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const userId: string = req.user.id;
  const conversationId = req.params.conversationId;

  // Validate the conversation ID.
  if (
    typeof conversationId !== "string" ||
    !conversationId.trim()
  ) {
    return res.status(400).json({
      message: "Invalid conversation ID",
    });
  }

  // Retrieve the requested conversation and its messages.
  const history = await getMessageHistoryService(
    conversationId,
    userId
  );

  // Log when the conversation has no messages.
  if (history.messages.length === 0) {
    console.log("No messages in this conversation");
  }

  // Return the history directly.
  // Do not wrap it inside another { messages: ... } object.
  return res.status(200).json(history);
};

// --------------------------------------------------
// EXPORT CONTROLLERS
// --------------------------------------------------

export {
  chatWithAI,
  getAllChats,
  getMessageHistory,
};
