"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.toggleComplete = exports.rescheduleEvent = exports.updateEvent = exports.createEvent = exports.listUpcoming = exports.listRange = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const plannerService_1 = require("../services/plannerService");
exports.listRange = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { start, end } = req.query;
    const events = await plannerService_1.plannerService.listRange(req.userId, start, end);
    return apiResponse_1.ApiResponse.success(res, events, 'Planner events fetched');
});
exports.listUpcoming = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const events = await plannerService_1.plannerService.listUpcoming(req.userId, Number(req.query.limit) || 10);
    return apiResponse_1.ApiResponse.success(res, events, 'Upcoming events fetched');
});
exports.createEvent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const event = await plannerService_1.plannerService.create(req.userId, req.body);
    return apiResponse_1.ApiResponse.created(res, event, 'Event created');
});
exports.updateEvent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const event = await plannerService_1.plannerService.update(req.params.id, req.userId, req.body);
    return apiResponse_1.ApiResponse.success(res, event, 'Event updated');
});
exports.rescheduleEvent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const event = await plannerService_1.plannerService.reschedule(req.params.id, req.userId, req.body.date);
    return apiResponse_1.ApiResponse.success(res, event, 'Event rescheduled');
});
exports.toggleComplete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const event = await plannerService_1.plannerService.toggleComplete(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.success(res, event, 'Event updated');
});
exports.deleteEvent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await plannerService_1.plannerService.remove(req.params.id, req.userId);
    return apiResponse_1.ApiResponse.noContent(res, 'Event deleted');
});
//# sourceMappingURL=plannerController.js.map