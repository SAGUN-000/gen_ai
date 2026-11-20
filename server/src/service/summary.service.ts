 
import { ai } from "../config/AIConfig.js";

interface SummaryMessage {
    role: string;
    content: string;
}

export const generateSummary = async (
    previousSummary: string | null,
    messages: SummaryMessage[]
): Promise<string> => {

    const conversation = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `
            You are a conversation summarization assistant.

            Update the existing conversation summary using
            the new messages.

            Existing summary:
            ${previousSummary || "No previous summary."}

            New conversation messages:
            ${conversation}

            Instructions:
            - Preserve important technical information.
            - Preserve user preferences and learning progress.
            - Preserve unresolved questions.
            - Remove repetitive information.
            - Do not invent information.
            - Keep the summary concise.
            - Return only the updated summary.
        `
    });

    const summary = response.text;

    if (!summary) {
        throw new Error("Gemini returned an empty summary.");
    }

    return summary;
};
