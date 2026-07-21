import axios from 'axios';
import { env } from '../config/env';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export type AIAction =
  | 'summarize'
  | 'rewrite'
  | 'improve_grammar'
  | 'generate_title'
  | 'explain'
  | 'translate'
  | 'bullet_points'
  | 'flashcards'
  | 'quiz'
  | 'extract_key_points'
  | 'meeting_summary'
  | 'action_items'
  | 'interview_questions';

const PROMPTS: Record<AIAction, (text: string, opts?: Record<string, string>) => string> = {
  summarize: (text) => `Summarize the following note in 2-4 concise sentences:\n\n${text}`,
  rewrite: (text) => `Rewrite the following note to be clearer and more polished, keeping the same meaning:\n\n${text}`,
  improve_grammar: (text) => `Correct any grammar and spelling mistakes in the following text. Return only the corrected text:\n\n${text}`,
  generate_title: (text) => `Suggest one short, specific title (under 8 words) for this note:\n\n${text}`,
  explain: (text) => `Explain the following text in simple terms:\n\n${text}`,
  translate: (text, opts) => `Translate the following text to ${opts?.targetLanguage || 'Spanish'}:\n\n${text}`,
  bullet_points: (text) => `Convert the following paragraph into a concise bulleted list:\n\n${text}`,
  flashcards: (text) => `Generate 5 question/answer flashcards from the following note. Format as "Q: ... \\nA: ...":\n\n${text}`,
  quiz: (text) => `Generate a 5-question multiple choice quiz (with answers marked) based on this note:\n\n${text}`,
  extract_key_points: (text) => `Extract the key points from this note as a short bulleted list:\n\n${text}`,
  meeting_summary: (text) => `Summarize these meeting notes into: Attendees (if mentioned), Key Discussion Points, Decisions Made:\n\n${text}`,
  action_items: (text) => `Extract a list of clear, actionable to-do items from this text:\n\n${text}`,
  interview_questions: (text) =>
    `Generate 6 realistic interview questions based on this material, each followed by a brief model answer. Format as "Q: ...\\nA: ...":\n\n${text}`,
};

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Pulls Google's actual error text out of an Axios error instead of the useless generic Axios message */
function extractGoogleErrorMessage(error: any): string {
  const googleMessage = error?.response?.data?.error?.message;
  const status = error?.response?.status;
  if (googleMessage) return `Gemini API error (HTTP ${status}): ${googleMessage}`;
  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    return 'Could not reach Gemini API — check your network/internet connection.';
  }
  return error?.message || 'Unknown error calling Gemini API';
}

class AIService {
  private assertConfigured() {
    if (!env.aiConfigured) {
      throw ApiError.badRequest(
        'AI features require a GEMINI_API_KEY in the backend .env file. Get a free key at https://aistudio.google.com/app/apikey, add it, and restart the server.'
      );
    }
  }

  /** Returns null (never throws) if AI isn't configured — embeddings are a background enhancement, not a blocking requirement */
  async embed(text: string): Promise<number[] | null> {
    if (!env.aiConfigured || !text?.trim()) return null;

    try {
      const response = await axios.post(
        `${GEMINI_BASE}/${env.ai.embeddingModel}:embedContent?key=${env.ai.apiKey}`,
        { content: { parts: [{ text: text.slice(0, 8000) }] } },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );
      return response.data?.embedding?.values || null;
    } catch (error: any) {
      // Previously this swallowed every error silently — meaning if the API key was
      // ever invalid, every single note would fail to get an embedding with zero
      // trace in the logs, and semantic search would just quietly always return
      // "no matching notes." Logging this is what actually surfaces that failure mode.
      logger.error('Gemini embedding request failed', { error: extractGoogleErrorMessage(error) });
      return null;
    }
  }

  /**
   * Sends a chat-style message list to Gemini. System messages are concatenated
   * into Gemini's separate `systemInstruction` field (Gemini has no "system" role
   * in `contents`); user/assistant turns map to Gemini's "user"/"model" roles.
   */
  async chatCompletion(messages: ChatMessage[]): Promise<{ content: string }> {
    this.assertConfigured();

    const systemText = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

    try {
      const response = await axios.post(
        `${GEMINI_BASE}/${env.ai.model}:generateContent?key=${env.ai.apiKey}`,
        {
          ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
          contents,
          generationConfig: { temperature: 0.4 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
      );

      const candidate = response.data?.candidates?.[0];

      // Gemini can return 200 OK with no candidate at all if the prompt was blocked
      // by safety filters — that's a distinct, useful case to report rather than
      // silently returning an empty string that then looks like "it responded with nothing."
      if (!candidate) {
        const blockReason = response.data?.promptFeedback?.blockReason;
        throw ApiError.badRequest(
          blockReason
            ? `Gemini declined to respond (reason: ${blockReason}). Try rephrasing your message.`
            : 'Gemini returned an empty response. Try rephrasing your message.'
        );
      }

      const text = candidate.content?.parts?.map((p: any) => p.text).join('') || '';
      return { content: text.trim() };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      const realMessage = extractGoogleErrorMessage(error);
      logger.error('Gemini chat completion failed', {
        message: realMessage,
        status: error?.response?.status,
        googleErrorBody: error?.response?.data,
      });

      // Surface Google's real error text (not a generic "something went wrong") so
      // both server logs and the API response actually explain what happened.
      throw new ApiError(502, realMessage);
    }
  }

  async run(action: AIAction, text: string, opts?: Record<string, string>): Promise<string> {
    this.assertConfigured();
    if (!text?.trim()) throw ApiError.badRequest('There is no note content to process');

    const prompt = PROMPTS[action](text, opts);
    const result = await this.chatCompletion([
      { role: 'system', content: 'You are a precise writing assistant embedded in a notes app.' },
      { role: 'user', content: prompt },
    ]);

    return result.content;
  }

  /**
   * Generates a custom note structure (title + starter HTML with headings,
   * lists, checklists) for a description like "organic chemistry lecture notes".
   * Returns HTML compatible with the note editor's schema — plain <h2>, <p>,
   * <ul>/<li> — nothing exotic the editor can't already render.
   */
  async generateNoteTemplate(description: string): Promise<{ title: string; html: string }> {
    this.assertConfigured();
    if (!description?.trim()) throw ApiError.badRequest('Describe what kind of template you want');

    const systemPrompt = `You are a note-structuring assistant. Given a short description of a note type, produce a starter template as STRICT JSON only — no markdown fences, no commentary — matching exactly:

{"title": string, "html": string}

"html" must use ONLY these tags: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>. Use empty <p></p> tags as placeholders under headings where the user should fill in their own content. Keep it structurally useful but not overly long (roughly 5-8 sections/headings at most).`;

    const response = await this.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Template for: ${description}` },
    ]);

    try {
      const raw = response.content.trim().replace(/^```json\s*|^```\s*|```$/g, '');
      const parsed = JSON.parse(raw);
      return { title: parsed.title || description, html: parsed.html || '' };
    } catch {
      // Fall back to wrapping the raw text as a single section rather than erroring out entirely
      return { title: description, html: `<p>${response.content}</p>` };
    }
  }
}

export const aiService = new AIService();
