import { usersRepository } from './users.repository.js';
import { NotFoundError } from '../shared/errors.js';

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async updateProfile(userId: string, input: { name?: string; avatar_url?: string }) {
    const user = await usersRepository.update(userId, input);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },
};
