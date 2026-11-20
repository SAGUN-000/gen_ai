import { chatWithAI as chatService } from "../service/chat.service.js";
const chatWithAI = async (req, res) => {
    const content = req.body;
    const response = await chatService(content);
    return res.json(response);
};
export { chatWithAI };
//# sourceMappingURL=chat.controller.js.map