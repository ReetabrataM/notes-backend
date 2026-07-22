"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashcardReviewRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const FlashcardReview_1 = require("../models/FlashcardReview");
class FlashcardReviewRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(FlashcardReview_1.FlashcardReview);
    }
    async findSince(owner, since) {
        return this.model.find({ owner, reviewedAt: { $gte: since } }).exec();
    }
    async distinctReviewDays(owner, since) {
        const filter = { owner };
        if (since)
            filter.reviewedAt = { $gte: since };
        const reviews = await this.model.find(filter).select('reviewedAt').lean();
        const days = new Set(reviews.map((r) => r.reviewedAt.toISOString().slice(0, 10)));
        return Array.from(days);
    }
}
exports.flashcardReviewRepository = new FlashcardReviewRepository();
//# sourceMappingURL=FlashcardReviewRepository.js.map