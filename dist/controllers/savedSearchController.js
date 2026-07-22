"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSavedSearch = exports.updateSavedSearch = exports.createSavedSearch = exports.listSavedSearches = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const savedSearchService_1 = require("../services/savedSearchService");
exports.listSavedSearches = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const smartFoldersOnly = req.query.smartFoldersOnly === 'true';
    const items = await savedSearchService_1.savedSearchService.list(req.userId, smartFoldersOnly);
    return apiResponse_1.ApiResponse.success(res, items, 'Saved searches fetched');
});
exports.createSavedSearch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await savedSearchService_1.savedSearchService.create(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, item, 'Saved search created');
});
exports.updateSavedSearch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await savedSearchService_1.savedSearchService.update(req.params.id, req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, item, 'Saved search updated');
});
exports.deleteSavedSearch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await savedSearchService_1.savedSearchService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Saved search deleted');
});
//# sourceMappingURL=savedSearchController.js.map