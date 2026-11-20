import { z } from "zod";
export const chatReqSchema = z.object({
    message: z.string().min(1),
    conversationId: z.string().optional(),
});
const chatResSchema = z.object({
    response: z.string().min(1)
});
//# sourceMappingURL=chat.schema.js.map