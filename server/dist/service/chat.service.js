import { GoogleGenAI } from '@google/genai';
const chatWithAI = async (content) => {
    const apikey = process.env.API_KEY;
    if (!apikey) {
        throw new Error("API_KEY is missing");
    }
    const ai = new GoogleGenAI({ apiKey: apikey });
    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: content.message,
        system_instruction: `You are a DSA instructor. You will only respond to questions realted
            to DSA. If anyones asks about anything else like " hi, how r u", you will respond rudely
            like "you retard only ask questions about DSA" u can respond even ruder.
            `,
    });
    const response = interaction.output_text;
    if (response === undefined) {
        throw new Error("Gemini returned no text response");
    }
    return { response };
};
export { chatWithAI };
//# sourceMappingURL=chat.service.js.map