"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
exports.emitToUser = emitToUser;
exports.emitToNote = emitToNote;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let io = null;
// noteId -> Map<socketId, { userId, name, color, cursor }>
const presenceByNote = new Map();
function initSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.clientUrl, credentials: true },
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                (socket.handshake.headers.authorization || '').replace('Bearer ', '');
            if (!token)
                return next(new Error('Authentication required'));
            const payload = (0, jwt_1.verifyAccessToken)(token);
            socket.userId = payload.userId;
            next();
        }
        catch {
            next(new Error('Invalid or expired token'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.debug('Socket connected', { userId: socket.userId, socketId: socket.id });
        // Personal room for direct notifications
        if (socket.userId)
            socket.join(`user:${socket.userId}`);
        socket.on('note:join', ({ noteId, name, color }) => {
            socket.join(`note:${noteId}`);
            if (!presenceByNote.has(noteId))
                presenceByNote.set(noteId, new Map());
            presenceByNote.get(noteId).set(socket.id, { userId: socket.userId, name, color });
            io.to(`note:${noteId}`).emit('note:presence', {
                users: Array.from(presenceByNote.get(noteId).values()),
            });
        });
        socket.on('note:leave', ({ noteId }) => {
            socket.leave(`note:${noteId}`);
            presenceByNote.get(noteId)?.delete(socket.id);
            io.to(`note:${noteId}`).emit('note:presence', {
                users: Array.from(presenceByNote.get(noteId)?.values() || []),
            });
        });
        socket.on('note:update', ({ noteId, content, plainText, title }) => {
            socket.to(`note:${noteId}`).emit('note:update', { noteId, content, plainText, title, from: socket.userId });
        });
        socket.on('note:cursor', ({ noteId, cursor, name, color }) => {
            socket.to(`note:${noteId}`).emit('note:cursor', { socketId: socket.id, cursor, name, color, userId: socket.userId });
        });
        socket.on('note:typing', ({ noteId, isTyping }) => {
            socket.to(`note:${noteId}`).emit('note:typing', { userId: socket.userId, isTyping });
        });
        socket.on('disconnect', () => {
            presenceByNote.forEach((users, noteId) => {
                if (users.has(socket.id)) {
                    users.delete(socket.id);
                    io.to(`note:${noteId}`).emit('note:presence', { users: Array.from(users.values()) });
                }
            });
        });
    });
    return io;
}
function getIO() {
    return io;
}
function emitToUser(userId, event, payload) {
    io?.to(`user:${userId}`).emit(event, payload);
}
function emitToNote(noteId, event, payload) {
    io?.to(`note:${noteId}`).emit(event, payload);
}
//# sourceMappingURL=index.js.map