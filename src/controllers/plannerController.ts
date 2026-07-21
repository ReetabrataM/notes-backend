import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { plannerService } from '../services/plannerService';
import { AuthRequest } from '../middlewares/authenticate';

export const listRange = asyncHandler(async (req: AuthRequest, res) => {
  const { start, end } = req.query as Record<string, string>;
  const events = await plannerService.listRange(req.userId!, start, end);
  return ApiResponse.success(res, events, 'Planner events fetched');
});

export const listUpcoming = asyncHandler(async (req: AuthRequest, res) => {
  const events = await plannerService.listUpcoming(req.userId!, Number(req.query.limit) || 10);
  return ApiResponse.success(res, events, 'Upcoming events fetched');
});

export const createEvent = asyncHandler(async (req: AuthRequest, res) => {
  const event = await plannerService.create(req.userId!, req.body);
  return ApiResponse.created(res, event, 'Event created');
});

export const updateEvent = asyncHandler(async (req: AuthRequest, res) => {
  const event = await plannerService.update(req.params.id, req.userId!, req.body);
  return ApiResponse.success(res, event, 'Event updated');
});

export const rescheduleEvent = asyncHandler(async (req: AuthRequest, res) => {
  const event = await plannerService.reschedule(req.params.id, req.userId!, req.body.date);
  return ApiResponse.success(res, event, 'Event rescheduled');
});

export const toggleComplete = asyncHandler(async (req: AuthRequest, res) => {
  const event = await plannerService.toggleComplete(req.params.id, req.userId!);
  return ApiResponse.success(res, event, 'Event updated');
});

export const deleteEvent = asyncHandler(async (req: AuthRequest, res) => {
  await plannerService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Event deleted');
});
