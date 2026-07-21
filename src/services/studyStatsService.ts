import { flashcardReviewRepository } from '../repositories/FlashcardReviewRepository';
import { pomodoroSessionRepository } from '../repositories/PomodoroSessionRepository';
import { flashcardRepository } from '../repositories/FlashcardRepository';
import { examRepository } from '../repositories/ExamRepository';
import { PlannerEvent } from '../models/PlannerEvent';

/**
 * A day "counts" toward the study streak if the user reviewed at least one
 * flashcard, completed a focus session, or finished a planner study event —
 * deliberately not just "opened the app" or "edited any note", so the streak
 * reflects actual studying rather than incidental activity.
 */
async function getActiveDays(owner: string, since?: Date): Promise<Set<string>> {
  const [reviewDays, pomodoroDays, completedStudyEvents] = await Promise.all([
    flashcardReviewRepository.distinctReviewDays(owner, since),
    pomodoroSessionRepository.distinctSessionDays(owner, since),
    PlannerEvent.find({
      owner,
      type: 'study',
      isCompleted: true,
      ...(since ? { updatedAt: { $gte: since } } : {}),
    })
      .select('updatedAt')
      .lean(),
  ]);

  const days = new Set<string>([...reviewDays, ...pomodoroDays]);
  completedStudyEvents.forEach((e: any) => days.add(e.updatedAt.toISOString().slice(0, 10)));
  return days;
}

function computeStreak(activeDays: Set<string>): number {
  let streak = 0;
  const cursor = new Date();

  // If nothing logged yet today, start counting from yesterday instead —
  // otherwise everyone's streak would show as broken first thing each morning.
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

class StudyStatsService {
  async getDashboard(owner: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [allTimeActiveDays, weekReviews, weekPomodoro, upcomingExams] = await Promise.all([
      getActiveDays(owner),
      flashcardReviewRepository.findSince(owner, weekAgo),
      pomodoroSessionRepository.findSince(owner, weekAgo),
      examRepository.findUpcoming(owner, 5),
    ]);

    const streak = computeStreak(allTimeActiveDays);

    const goodOrEasy = weekReviews.filter((r) => r.quality >= 3).length;
    const accuracy = weekReviews.length ? Math.round((goodOrEasy / weekReviews.length) * 100) : null;

    const focusSessions = weekPomodoro.filter((s) => s.type === 'focus');

    const [dueCount, totalCards] = await Promise.all([
      flashcardRepository.countDue(owner),
      flashcardRepository.countTotal(owner),
    ]);

    return {
      streak,
      cardsDue: dueCount,
      totalFlashcards: totalCards,
      weeklyReviews: weekReviews.length,
      weeklyAccuracy: accuracy,
      weeklyFocusSessions: focusSessions.length,
      weeklyFocusMinutes: focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      upcomingExams: upcomingExams.map((e) => ({
        _id: e._id,
        subject: e.subject,
        date: e.date,
        color: e.color,
        daysRemaining: Math.max(0, Math.ceil((e.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        relatedNote: e.relatedNote,
      })),
    };
  }
}

export const studyStatsService = new StudyStatsService();
