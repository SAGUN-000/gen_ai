
import { z } from "zod";

 export const chatReqSchema = z.object({
    message: z.string().min(1),
    conversationId: z.string().optional(),
});

const chatResSchema=z.object({
    response:z.string().min(1),
    conversationId: z.string().uuid().optional()

})

export type ChatRequest = z.infer<typeof chatReqSchema>;
export type ChatResponse=z.infer<typeof chatResSchema>;