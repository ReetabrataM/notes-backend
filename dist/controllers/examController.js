"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExam = exports.updateExam = exports.listAll = exports.listUpcoming = exports.createExam = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const examService_1 = require("../services/examService");
exports.createExam = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const exam = await examService_1.examService.create(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, exam, 'Exam added');
});
exports.listUpcoming = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const exams = await examService_1.examService.listUpcoming(req.userId);
    return apiResponse_1.ApiResponse.success(res, exams, 'Upcoming exams fetched');
});
exports.listAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const exams = await examService_1.examService.listAll(req.userId);
    return apiResponse_1.ApiResponse.success(res, exams, 'Exams fetched');
});
exports.updateExam = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const exam = await examService_1.examService.update(req.params.id, req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, exam, 'Exam updated');
});
exports.deleteExam = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await examService_1.examService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Exam deleted');
});
//# sourceMappingURL=examController.js.map