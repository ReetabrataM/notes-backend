import { userRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/apiResponse';

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  themePreference?: 'light' | 'dark' | 'amoled' | 'system';
  notificationSettings?: { email?: boolean; inApp?: boolean; reminders?: boolean };
}

class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.updateById(userId, input as any);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }
}

export const userService = new UserService();
