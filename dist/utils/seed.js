"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Folder_1 = require("../models/Folder");
const Tag_1 = require("../models/Tag");
const Note_1 = require("../models/Note");
const logger_1 = require("./logger");
async function seed() {
    await (0, db_1.connectDB)();
    await Promise.all([
        User_1.User.deleteMany({ email: 'demo@notesapp.dev' }),
    ]);
    const user = await User_1.User.create({
        name: 'Demo User',
        username: 'demouser',
        email: 'demo@notesapp.dev',
        password: 'Password123',
        bio: 'Just exploring this notes app.',
        isEmailVerified: true,
    });
    const workFolder = await Folder_1.Folder.create({ name: 'Work', owner: user._id, icon: 'briefcase', color: '#C9932E' });
    const personalFolder = await Folder_1.Folder.create({ name: 'Personal', owner: user._id, icon: 'heart', color: '#4FD1C5' });
    const [ideaTag, urgentTag] = await Promise.all([
        Tag_1.Tag.create({ name: 'idea', owner: user._id, color: '#C9932E' }),
        Tag_1.Tag.create({ name: 'urgent', owner: user._id, color: '#E5484D' }),
    ]);
    await Note_1.Note.create([
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
    logger_1.logger.info('Seed data created', { email: user.email, password: 'Password123' });
    await (0, db_1.disconnectDB)();
    process.exit(0);
}
seed().catch((err) => {
    logger_1.logger.error('Seeding failed', { err });
    process.exit(1);
});
//# sourceMappingURL=seed.js.map