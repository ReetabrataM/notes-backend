import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { userRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/apiResponse';

export async function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const user = await userRepository.findById(req.userId!);
    if (!user || user.role !== 'admin') {
      return next(ApiError.forbidden('Admin access required'));
    }
    next();
  } catch (err) {
    next(err);
  }
}
