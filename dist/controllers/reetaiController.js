"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePlan = exports.planTask = exports.chat = exports.search = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const reetaiService_1 = require("../services/reetaiService");
exports.search = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { query } = req.body;
    if (!query?.trim())
        throw apiResponse_1.ApiError.badRequest('A search query is required');
    const results = await reetaiService_1.reetaiService.semanticSearch(req.userId, query);
    return apiResponse_1.ApiResponse.success(res, results, 'Search complete');
});
exports.chat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { message, history } = req.body;
    if (!message?.trim())
        throw apiResponse_1.ApiError.badRequest('A message is required');
    const result = await reetaiService_1.reetaiService.chat(req.userId, message, history || []);
    return apiResponse_1.ApiResponse.success(res, result, 'ReetAI responded');
});
exports.planTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction?.trim())
        throw apiResponse_1.ApiError.badRequest('An instruction is required');
    const plan = await reetaiService_1.reetaiService.planTask(req.userId, instruction);
    return apiResponse_1.ApiResponse.success(res, { plan }, 'Plan generated');
});
exports.executePlan = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { plan } = req.body;
    if (!Array.isArray(plan) || !plan.length)
        throw apiResponse_1.ApiError.badRequest('A valid plan is required');
    const outcomes = await reetaiService_1.reetaiService.executePlan(req.userId, plan);
    return apiResponse_1.ApiResponse.success(res, { outcomes }, 'Plan executed');
});
//# sourceMappingURL=reetaiController.js.map