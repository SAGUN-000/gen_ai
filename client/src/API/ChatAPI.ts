 
import API from "./Axios";

export interface ChatResponse {
  response: string;
  conversationId: string;
}

export type MessageRole = "USER" | "ASSISTANT";

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  updatedAt?: string;
}

export interface MessageHistory {
  conversationId: string;
  messages: Message[];
}

export const createChat = async (
  message: string,
  conversationId?: string
): Promise<ChatResponse> => {
  const res = await API.post<ChatResponse>("/chat", {
    message,
    conversationId,
  });

  return res.data;
};

export const getAllChats = async (): Promise<Conversation[]> => {
  const res = await API.get<Conversation[]>("/chat/conversations");

  return res.data;
};

export const getMessageHistory = async (
  conversationId: string
): Promise<MessageHistory> => {
  const res = await API.get<MessageHistory>(
    `/chat/conversations/${conversationId}`
  );

  return res.data;
};
