import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Folder } from '../models/Folder';
import { Tag } from '../models/Tag';
import { Note } from '../models/Note';
import { logger } from './logger';

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({ email: 'demo@notesapp.dev' }),
  ]);

  const user = await User.create({
    name: 'Demo User',
    username: 'demouser',
    email: 'demo@notesapp.dev',
    password: 'Password123',
    bio: 'Just exploring this notes app.',
    isEmailVerified: true,
  });

  const workFolder = await Folder.create({ name: 'Work', owner: user._id, icon: 'briefcase', color: '#C9932E' });
  const personalFolder = await Folder.create({ name: 'Personal', owner: user._id, icon: 'heart', color: '#4FD1C5' });

  const [ideaTag, urgentTag] = await Promise.all([
    Tag.create({ name: 'idea', owner: user._id, color: '#C9932E' }),
    Tag.create({ name: 'urgent', owner: user._id, color: '#E5484D' }),
  ]);

  await Note.create([
    {
      owner: user._id,
      title: 'Welcome to your Notes SaaS',
      content: '<p>This is your first note. Try pinning it, tagging it, or moving it to a folder.</p>',
      plainText: 'This is your first note. Try pinning it, tagging it, or moving it to a folder.',
      folder: workFolder._id,
      tags: [ideaTag._id],
      isPinned: true,
    },
    {
      owner: user._id,
      title: 'Grocery list',
      content: '<ul><li>Eggs</li><li>Milk</li><li>Coffee</li></ul>',
      plainText: 'Eggs Milk Coffee',
      folder: personalFolder._id,
      tags: [urgentTag._id],
    },
  ]);

  logger.info('Seed data created', { email: user.email, password: 'Password123' });
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seeding failed', { err });
  process.exit(1);
});
