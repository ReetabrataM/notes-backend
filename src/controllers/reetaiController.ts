import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { reetaiService } from '../services/reetaiService';
import { AuthRequest } from '../middlewares/authenticate';

export const search = asyncHandler(async (req: AuthRequest, res) => {
  const { query } = req.body;
  if (!query?.trim()) throw ApiError.badRequest('A search query is required');
  const results = await reetaiService.semanticSearch(req.userId!, query);
  return ApiResponse.success(res, results, 'Search complete');
});

export const chat = asyncHandler(async (req: AuthRequest, res) => {
  const { message, history } = req.body;
  if (!message?.trim()) throw ApiError.badRequest('A message is required');
  const result = await reetaiService.chat(req.userId!, message, history || []);
  return ApiResponse.success(res, result, 'ReetAI responded');
});

export const planTask = asyncHandler(async (req: AuthRequest, res) => {
  const { instruction } = req.body;
  if (!instruction?.trim()) throw ApiError.badRequest('An instruction is required');
  const plan = await reetaiService.planTask(req.userId!, instruction);
  return ApiResponse.success(res, { plan }, 'Plan generated');
});

export const executePlan = asyncHandler(async (req: AuthRequest, res) => {
  const { plan } = req.body;
  if (!Array.isArray(plan) || !plan.length) throw ApiError.badRequest('A valid plan is required');
  const outcomes = await reetaiService.executePlan(req.userId!, plan);
  return ApiResponse.success(res, { outcomes }, 'Plan executed');
});
