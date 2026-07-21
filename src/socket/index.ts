import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface AuthedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;

// noteId -> Map<socketId, { userId, name, color, cursor }>
const presenceByNote = new Map<string, Map<string, { userId: string; name: string; color: string }>>();

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket: AuthedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization || '').replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    logger.debug('Socket connected', { userId: socket.userId, socketId: socket.id });

    // Personal room for direct notifications
    if (socket.userId) socket.join(`user:${socket.userId}`);

    socket.on('note:join', ({ noteId, name, color }) => {
      socket.join(`note:${noteId}`);
      if (!presenceByNote.has(noteId)) presenceByNote.set(noteId, new Map());
      presenceByNote.get(noteId)!.set(socket.id, { userId: socket.userId!, name, color });

      io!.to(`note:${noteId}`).emit('note:presence', {
        users: Array.from(presenceByNote.get(noteId)!.values()),
      });
    });

    socket.on('note:leave', ({ noteId }) => {
      socket.leave(`note:${noteId}`);
      presenceByNote.get(noteId)?.delete(socket.id);
      io!.to(`note:${noteId}`).emit('note:presence', {
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
          io!.to(`note:${noteId}`).emit('note:presence', { users: Array.from(users.values()) });
        }
      });
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToNote(noteId: string, event: string, payload: unknown) {
  io?.to(`note:${noteId}`).emit(event, payload);
}
