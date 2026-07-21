import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { examService } from '../services/examService';
import { AuthRequest } from '../middlewares/authenticate';

export const createExam = asyncHandler(async (req: AuthRequest, res) => {
  const exam = await examService.create(req.userId!, req.body);
  return ApiResponse.created(res, exam, 'Exam added');
});

export const listUpcoming = asyncHandler(async (req: AuthRequest, res) => {
  const exams = await examService.listUpcoming(req.userId!);
  return ApiResponse.success(res, exams, 'Upcoming exams fetched');
});

export const listAll = asyncHandler(async (req: AuthRequest, res) => {
  const exams = await examService.listAll(req.userId!);
  return ApiResponse.success(res, exams, 'Exams fetched');
});

export const updateExam = asyncHandler(async (req: AuthRequest, res) => {
  const exam = await examService.update(req.params.id, req.userId!, req.body);
  return ApiResponse.success(res, exam, 'Exam updated');
});

export const deleteExam = asyncHandler(async (req: AuthRequest, res) => {
  await examService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Exam deleted');
});
