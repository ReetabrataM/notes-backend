import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { savedSearchService } from '../services/savedSearchService';
import { AuthRequest } from '../middlewares/authenticate';

export const listSavedSearches = asyncHandler(async (req: AuthRequest, res) => {
  const smartFoldersOnly = req.query.smartFoldersOnly === 'true';
  const items = await savedSearchService.list(req.userId!, smartFoldersOnly);
  return ApiResponse.success(res, items, 'Saved searches fetched');
});

export const createSavedSearch = asyncHandler(async (req: AuthRequest, res) => {
  const item = await savedSearchService.create(req.userId!, req.body);
  return ApiResponse.created(res, item, 'Saved search created');
});

export const updateSavedSearch = asyncHandler(async (req: AuthRequest, res) => {
  const item = await savedSearchService.update(req.params.id, req.userId!, req.body);
  return ApiResponse.success(res, item, 'Saved search updated');
});

export const deleteSavedSearch = asyncHandler(async (req: AuthRequest, res) => {
  await savedSearchService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Saved search deleted');
});
