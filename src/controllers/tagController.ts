import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { tagRepository } from '../repositories/TagRepository';
import { AuthRequest } from '../middlewares/authenticate';

export const listTags = asyncHandler(async (req: AuthRequest, res) => {
  const tags = await tagRepository.findByOwner(req.userId!);
  return ApiResponse.success(res, tags, 'Tags fetched');
});

export const createTag = asyncHandler(async (req: AuthRequest, res) => {
  const { name, color } = req.body;
  const tag = await tagRepository.create({ name, color, owner: req.userId as any });
  return ApiResponse.created(res, tag, 'Tag created');
});

export const deleteTag = asyncHandler(async (req: AuthRequest, res) => {
  const existing = await tagRepository.findById(req.params.id);
  if (!existing || existing.owner.toString() !== req.userId) throw ApiError.notFound('Tag not found');
  await tagRepository.deleteById(req.params.id);
  return ApiResponse.noContent(res, 'Tag deleted');
});
