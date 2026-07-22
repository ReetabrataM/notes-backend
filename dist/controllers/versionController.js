"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreVersion = exports.listVersions = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const versionService_1 = require("../services/versionService");
exports.listVersions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const versions = await versionService_1.versionService.list(req.params.noteId, req.userId);
    return apiResponse_1.ApiResponse.success(res, versions, 'Version history fetched');
});
exports.restoreVersion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const note = await versionService_1.versionService.restore(req.params.noteId, req.params.versionId, req.userId);
    return apiResponse_1.ApiResponse.success(res, note, 'Version restored');
});
//# sourceMappingURL=versionController.js.map