 
import type { ChatRequest, ChatResponse } from "../schema/chat.schema.js";

import { prisma } from "../config/DBConfig.js";
import { chatWithAI } from "./AI.service.js";
import { generateSummary } from "./summary.service.js";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

// Number of individual messages required before generating a summary.
// 10 messages = approximately 5 user-assistant exchanges.
const SUMMARY_THRESHOLD = 10;

// Only the latest 10 messages are sent as recent conversation context.
const RECENT_MESSAGE_LIMIT = 10;


// --------------------------------------------------
// TYPES
// --------------------------------------------------

type Message = {
    id: string;
    content: string;
    role: "USER" | "ASSISTANT";
    createdAt: Date;
};

interface MessageHistory {
    conversationId: string;
    messages: Message[];
}


// --------------------------------------------------
// GENERATE CONVERSATION TITLE
// --------------------------------------------------

const generateConversationTitle = (message: string): string => {

    // Remove unnecessary whitespace and newlines.
    const cleanedMessage = message.trim().replace(/\s+/g, " ");

    // Keep the title unchanged if it is within 50 characters.
    if (cleanedMessage.length <= 50) {
        return cleanedMessage;
    }

    // Truncate longer messages and append ellipsis.
    return `${cleanedMessage.slice(0, 47)}...`;
};


// --------------------------------------------------
// MAIN CHAT SERVICE
// --------------------------------------------------

const chatService = async (
    content: ChatRequest,
    userId: string
): Promise<ChatResponse> => {

    // 1. FIND OR CREATE CONVERSATION

    let conversation;

    if (content.conversationId) {

        // Find the requested conversation.
        // userId ensures users cannot access another user's conversation.
        conversation = await prisma.conversation.findFirst({
            where: {
                id: content.conversationId,
                userId
            }
        });

        // Reject the request if the conversation does not exist
        // or does not belong to the authenticated user.
        if (!conversation) {
            throw new Error("Conversation not found");
        }

    } else {

        // No conversationId means the user is starting a new chat.
        // Generate its title using the first user message.
        conversation = await prisma.conversation.create({
            data: {
                userId,
                title: generateConversationTitle(content.message)
            }
        });
    }


    // 2. FETCH RECENT MESSAGES

    // Retrieve the latest 10 messages from this conversation.
    // Descending order allows us to fetch the newest messages first.
    const recentMessages = await prisma.message.findMany({
        where: {
            conversationId: conversation.id
        },
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" }
        ],
        take: RECENT_MESSAGE_LIMIT,
        select: {
            role: true,
            content: true
        }
    });

    // Reverse the array to restore chronological order.
    // The AI should receive older messages before newer ones.
    recentMessages.reverse();


    // 3. PREPARE AI CONTEXT

    // Combine the existing summary with recent messages.
    // This prevents us from sending the entire conversation history
    // to the AI on every request.
    const context = {
        summary: conversation.summary,
        recentMessages: recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        }))
    };


    // 4. GENERATE AI RESPONSE

    // Send the current message and conversation context to the AI service.
    const response = await chatWithAI(content, context);


     
    // 5. SAVE USER AND ASSISTANT MESSAGES

    // Generate distinct timestamps to guarantee chronological ordering.
    const userMessageTime = new Date();
    const assistantMessageTime = new Date(
        userMessageTime.getTime() + 1
    );

    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                role: "USER",
                content: content.message,
                createdAt: userMessageTime
            },
            {
                conversationId: conversation.id,
                role: "ASSISTANT",
                content: response,
                createdAt: assistantMessageTime
            }
        ]
    });

    // Update conversation activity time.
    await prisma.conversation.update({
        where: {
            id: conversation.id
        },
        data: {
            updatedAt: new Date()
        }
    });



    // 6. FETCH UNSUMMARIZED MESSAGES

    let unsummarizedMessages;

    if (conversation.lastSummarizedMessageId) {

        // A previous summary exists.
        // Retrieve only messages created after the last summarized message.
        // Cursor pagination avoids processing already summarized messages.
        unsummarizedMessages = await prisma.message.findMany({
            where: {
                conversationId: conversation.id
            },
            orderBy: [
                { createdAt: "asc" },
                { id: "asc" }
            ],
            cursor: {
                id: conversation.lastSummarizedMessageId
            },
            skip: 1
        });

    } else {

        // No previous summary exists.
        // Retrieve all messages from this conversation.
        unsummarizedMessages = await prisma.message.findMany({
            where: {
                conversationId: conversation.id
            },
            orderBy: [
                { createdAt: "asc" },
                { id: "asc" }
            ]
        });
    }


    // 7. GENERATE SUMMARY WHEN THRESHOLD IS REACHED

    if (unsummarizedMessages.length >= SUMMARY_THRESHOLD) {

        try {

            // Generate a new summary using:
            // 1. The existing summary.
            // 2. Messages that have not yet been summarized.
            const updatedSummary = await generateSummary(
                conversation.summary,
                unsummarizedMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            );


            // 8. SAVE UPDATED SUMMARY AND CHECKPOINT

            // The last message included in the new summary becomes
            // our checkpoint.
            // Future requests will only retrieve messages after this ID.
            const lastMessage = unsummarizedMessages[
                unsummarizedMessages.length - 1
            ];

            if (lastMessage) {

                await prisma.conversation.update({
                    where: {
                        id: conversation.id
                    },
                    data: {
                        summary: updatedSummary,
                        lastSummarizedMessageId: lastMessage.id
                    }
                });
            }

        } catch (error) {

            // The chat response has already been saved.
            // Summary generation is an additional operation.
            // Therefore, a summary failure should not invalidate
            // an otherwise successful chat response.

            console.error(
                "Failed to update conversation summary:",
                error
            );
        }
    }


    // 9. RETURN RESPONSE

    return {
        response,
        conversationId: conversation.id
    };
};


// --------------------------------------------------
// GET ALL CONVERSATIONS
// --------------------------------------------------

const getConversationsService = async (userId: string) => {

    // Retrieve all conversations belonging to the authenticated user.
    // findMany() is necessary because one user can have multiple chats.
    //
    // Only return the information required by the conversation sidebar.
    return await prisma.conversation.findMany({
        where: {
            userId
        },
        select: {
            id: true,
            title: true,
            updatedAt: true
        },
        orderBy: {
            updatedAt: "desc"
        }
    });
};


// --------------------------------------------------
// GET MESSAGE HISTORY OF A SPECIFIC CONVERSATION
// --------------------------------------------------

const getMessageHistoryService = async (
    conversationId: string,
    userId: string
): Promise<MessageHistory> => {

    // Find ONE specific conversation using its ID and owner ID.
    //
    // findFirst() returns one matching record or null.
    // It does not simply select the first conversation of the user.
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId
        },
        select: {
            id: true,

            // Retrieve all messages belonging to this conversation.
            messages: {
                orderBy: [
                    { createdAt: "asc" },
                    { id: "asc" }
                ],
                select: {
                    id: true,
                    content: true,
                    role: true,
                    createdAt: true
                }
            }
        }
    });


    // Check whether the requested conversation exists
    // and belongs to the authenticated user.
    if (!conversation) {
        throw new Error("Conversation not found");
    }


    // Return the conversation ID and its complete message history.
    // If the conversation has no messages, messages will be [].
    return {
        conversationId: conversation.id,
        messages: conversation.messages
    };
};


// --------------------------------------------------
// EXPORT SERVICES
// --------------------------------------------------

export {
    chatService,
    getConversationsService,
    getMessageHistoryService
};
