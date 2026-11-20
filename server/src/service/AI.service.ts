import { ai } from "../config/AIConfig.js";
import type { ChatRequest } from "../schema/chat.schema.js";

interface ChatContext {
    summary: string | null;
    recentMessages: {
        role: "USER" | "ASSISTANT";
        content: string;
    }[];
}

const chatWithAI = async (
    content: ChatRequest,
    context: ChatContext
): Promise<string> => {

    const history = context.recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n\n");

    const input = `
        CONVERSATION SUMMARY:
        ${context.summary || "No previous context."}

        RECENT CONVERSATION:
        ${history || "No previous messages."}

        CURRENT USER MESSAGE:
        ${content.message}
    `;

    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        store: false,
        input,
        system_instruction: `
            You are a DSA instructor.

            Only answer questions related to Data Structures
            and Algorithms.

            If a question is unrelated to DSA, rudely
            tell them that u are dsa instructor and cannot ans
            unrelated question for example if someone asks how r u 
            or hi just tell them u stupid retard i am not ur friend 
            i am dsa instructor and here to teach u.

            Explain concepts clearly and provide code examples
            when appropriate.
        `
    });

    const response = interaction.output_text;

    if (!response) {
        throw new Error("Gemini returned no text response");
    }

    return response;
};

export { chatWithAI };