"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.createTag = exports.listTags = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const TagRepository_1 = require("../repositories/TagRepository");
exports.listTags = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const tags = await TagRepository_1.tagRepository.findByOwner(req.userId);
    return apiResponse_1.ApiResponse.success(res, tags, 'Tags fetched');
});
exports.createTag = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, color } = req.body;
    const tag = await TagRepository_1.tagRepository.create({ name, color, owner: req.userId });
    return apiResponse_1.ApiResponse.created(res, tag, 'Tag created');
});
exports.deleteTag = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const existing = await TagRepository_1.tagRepository.findById(req.params.id);
    if (!existing || existing.owner.toString() !== req.userId)
        throw apiResponse_1.ApiError.notFound('Tag not found');
    await TagRepository_1.tagRepository.deleteById(req.params.id);
    return apiResponse_1.ApiResponse.noContent(res, 'Tag deleted');
});
//# sourceMappingURL=tagController.js.map