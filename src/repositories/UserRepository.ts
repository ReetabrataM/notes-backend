import { BaseRepository } from './BaseRepository';
import { User, IUser } from '../models/User';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string, withPassword = false) {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  }

  async findByUsername(username: string) {
    return this.model.findOne({ username: username.toLowerCase() }).exec();
  }

  async findByEmailOrUsername(identifier: string, withPassword = false) {
    const query = this.model.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    });
    if (withPassword) query.select('+password');
    return query.exec();
  }
}

export const userRepository = new UserRepository();
