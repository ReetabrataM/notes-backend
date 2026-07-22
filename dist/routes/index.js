"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const env_1 = require("../config/env");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const noteRoutes_1 = __importDefault(require("./noteRoutes"));
const folderRoutes_1 = __importDefault(require("./folderRoutes"));
const tagRoutes_1 = __importDefault(require("./tagRoutes"));
const dashboardRoutes_1 = __importDefault(require("./dashboardRoutes"));
const commentRoutes_1 = __importDefault(require("./commentRoutes"));
const versionRoutes_1 = __importDefault(require("./versionRoutes"));
const reminderRoutes_1 = __importDefault(require("./reminderRoutes"));
const notificationRoutes_1 = __importDefault(require("./notificationRoutes"));
const attachmentRoutes_1 = __importDefault(require("./attachmentRoutes"));
const sharingRoutes_1 = __importDefault(require("./sharingRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const aiRoutes_1 = __importDefault(require("./aiRoutes"));
const exportImportRoutes_1 = __importDefault(require("./exportImportRoutes"));
const plannerRoutes_1 = __importDefault(require("./plannerRoutes"));
const reetaiRoutes_1 = __importDefault(require("./reetaiRoutes"));
const savedSearchRoutes_1 = __importDefault(require("./savedSearchRoutes"));
const flashcardRoutes_1 = __importDefault(require("./flashcardRoutes"));
const pomodoroRoutes_1 = __importDefault(require("./pomodoroRoutes"));
const examRoutes_1 = __importDefault(require("./examRoutes"));
const studyStatsRoutes_1 = __importDefault(require("./studyStatsRoutes"));
const workspaceRoutes_1 = __importDefault(require("./workspaceRoutes"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({ success: true, message: 'API is healthy', data: { timestamp: new Date().toISOString() } });
});
router.get('/config', (_req, res) => {
    res.json({
        success: true,
        message: 'Public config',
        data: {
            googleOAuthEnabled: env_1.env.googleOAuthConfigured,
            aiEnabled: env_1.env.aiConfigured,
            emailEnabled: env_1.env.smtpConfigured,
        },
    });
});
router.use('/auth', authRoutes_1.default);
router.use('/users', userRoutes_1.default);
router.use('/notes', noteRoutes_1.default);
router.use('/folders', folderRoutes_1.default);
router.use('/tags', tagRoutes_1.default);
router.use('/dashboard', dashboardRoutes_1.default);
router.use('/comments', commentRoutes_1.default);
router.use('/versions', versionRoutes_1.default);
router.use('/reminders', reminderRoutes_1.default);
router.use('/notifications', notificationRoutes_1.default);
router.use('/attachments', attachmentRoutes_1.default);
router.use('/sharing', sharingRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/ai', aiRoutes_1.default);
router.use('/export', exportImportRoutes_1.default);
router.use('/planner', plannerRoutes_1.default);
router.use('/reetai', reetaiRoutes_1.default);
router.use('/saved-searches', savedSearchRoutes_1.default);
router.use('/flashcards', flashcardRoutes_1.default);
router.use('/pomodoro', pomodoroRoutes_1.default);
router.use('/exams', examRoutes_1.default);
router.use('/study', studyStatsRoutes_1.default);
router.use('/workspaces', workspaceRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map