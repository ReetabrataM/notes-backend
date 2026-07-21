import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { reminderService } from '../services/reminderService';
import { AuthRequest } from '../middlewares/authenticate';

export const listReminders = asyncHandler(async (req: AuthRequest, res) => {
  const { upcoming, completed } = req.query as Record<string, string>;
  const reminders = await reminderService.list(req.userId!, {
    upcoming: upcoming === 'true',
    completed: completed !== undefined ? completed === 'true' : undefined,
  });
  return ApiResponse.success(res, reminders, 'Reminders fetched');
});

export const createReminder = asyncHandler(async (req: AuthRequest, res) => {
  const { noteId, dueDate, recurrence } = req.body;
  const reminder = await reminderService.create(req.userId!, noteId, dueDate, recurrence);
  return ApiResponse.created(res, reminder, 'Reminder set');
});

export const completeReminder = asyncHandler(async (req: AuthRequest, res) => {
  const reminder = await reminderService.complete(req.params.id, req.userId!);
  return ApiResponse.success(res, reminder, 'Reminder updated');
});

export const deleteReminder = asyncHandler(async (req: AuthRequest, res) => {
  await reminderService.remove(req.params.id, req.userId!);
  return ApiResponse.noContent(res, 'Reminder deleted');
});
