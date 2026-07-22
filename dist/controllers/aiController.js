"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplate = exports.runAIAction = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const aiService_1 = require("../services/aiService");
exports.runAIAction = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { action, text, targetLanguage } = req.body;
    const result = await aiService_1.aiService.run(action, text, { targetLanguage: targetLanguage || '' });
    return apiResponse_1.ApiResponse.success(res, { result }, 'AI response generated');
});
exports.generateTemplate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { description } = req.body;
    const template = await aiService_1.aiService.generateNoteTemplate(description);
    return apiResponse_1.ApiResponse.success(res, template, 'Template generated');
});
//# sourceMappingURL=aiController.js.map