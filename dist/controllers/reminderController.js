"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReminder = exports.completeReminder = exports.createReminder = exports.listReminders = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const reminderService_1 = require("../services/reminderService");
exports.listReminders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { upcoming, completed } = req.query;
    const reminders = await reminderService_1.reminderService.list(req.userId, {
        upcoming: upcoming === 'true',
        completed: completed !== undefined ? completed === 'true' : undefined,
    });
    return apiResponse_1.ApiResponse.success(res, reminders, 'Reminders fetched');
});
exports.createReminder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { noteId, dueDate, recurrence } = req.body;
    const reminder = await reminderService_1.reminderService.create(req.userId, noteId, dueDate, recurrence);
    return apiResponse_1.ApiResponse.created(res, reminder, 'Reminder set');
});
exports.completeReminder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reminder = await reminderService_1.reminderService.complete(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, reminder, 'Reminder updated');
});
exports.deleteReminder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await reminderService_1.reminderService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Reminder deleted');
});
//# sourceMappingURL=reminderController.js.map