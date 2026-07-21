import { BaseRepository } from './BaseRepository';
import { Tag, ITag } from '../models/Tag';

class TagRepository extends BaseRepository<ITag> {
  constructor() {
    super(Tag);
  }

  async findByOwner(owner: string) {
    return this.model.find({ owner }).sort({ name: 1 }).exec();
  }

  async findOrCreateMany(owner: string, names: string[]) {
    const normalized = Array.from(new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean)));
    const tags = await Promise.all(
      normalized.map((name) =>
        this.model.findOneAndUpdate(
          { owner, name },
          { $setOnInsert: { owner, name } },
          { upsert: true, new: true }
        )
      )
    );
    return tags;
  }

  /**
   * Nested tags are a naming convention, not a real parent/child schema —
   * "DBMS" and "DBMS/Indexing" are just two tag documents whose names happen to
   * share a prefix. Selecting the parent "DBMS" in the tree should surface notes
   * tagged with any of its descendants too, which is what this resolves.
   */
  async findIdsByPrefix(owner: string, prefix: string): Promise<string[]> {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = await this.model
      .find({ owner, name: { $regex: `^${escaped}(/|$)`, $options: 'i' } })
      .select('_id')
      .exec();
    return matches.map((t) => t._id.toString());
  }
}

export const tagRepository = new TagRepository();
