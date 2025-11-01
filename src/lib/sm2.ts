// SM-2 Spaced Repetition Algorithm
// Based on SuperMemo 2 algorithm used by Anki

import { AnkiCard } from './supabase';

export interface SM2Result {
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date: Date;
  state: 'new' | 'learning' | 'review';
}

/**
 * Calculate next review parameters based on SM-2 algorithm
 * @param card Current card state
 * @param rating User rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @returns Updated card parameters
 */
export function calculateSM2(card: AnkiCard, rating: 1 | 2 | 3 | 4): SM2Result {
  let { ease_factor, interval, repetitions, state } = card;
  const now = new Date();

  // Handle new cards
  if (state === 'new') {
    if (rating === 1) {
      // Again - stay new, review in 1 minute
      return {
        ease_factor,
        interval: 0,
        repetitions: 0,
        due_date: addMinutes(now, 1),
        state: 'learning',
      };
    } else if (rating === 2 || rating === 3) {
      // Hard/Good - move to learning, review in 10 minutes
      return {
        ease_factor,
        interval: 0,
        repetitions: 0,
        due_date: addMinutes(now, 10),
        state: 'learning',
      };
    } else {
      // Easy - skip learning, go straight to review
      return {
        ease_factor: ease_factor + 0.15,
        interval: 4,
        repetitions: 1,
        due_date: addDays(now, 4),
        state: 'review',
      };
    }
  }

  // Handle learning cards
  if (state === 'learning') {
    if (rating === 1) {
      // Again - restart learning
      return {
        ease_factor: Math.max(1.3, ease_factor - 0.2),
        interval: 0,
        repetitions: 0,
        due_date: addMinutes(now, 1),
        state: 'learning',
      };
    } else {
      // Graduate to review
      const newInterval = rating === 2 ? 1 : rating === 3 ? 1 : 4;
      const newEaseFactor = rating === 4 ? ease_factor + 0.15 : ease_factor;

      return {
        ease_factor: newEaseFactor,
        interval: newInterval,
        repetitions: 1,
        due_date: addDays(now, newInterval),
        state: 'review',
      };
    }
  }

  // Handle review cards (SM-2 algorithm)
  if (rating === 1) {
    // Again - reset to learning
    return {
      ease_factor: Math.max(1.3, ease_factor - 0.2),
      interval: 0,
      repetitions: 0,
      due_date: addMinutes(now, 10),
      state: 'learning',
    };
  }

  // Adjust ease factor based on rating
  let newEaseFactor = ease_factor;
  if (rating === 2) {
    newEaseFactor = Math.max(1.3, ease_factor - 0.15);
  } else if (rating === 4) {
    newEaseFactor = ease_factor + 0.15;
  }

  // Calculate new interval
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    if (rating === 2) {
      // Hard - interval * 1.2
      newInterval = Math.round(interval * 1.2);
    } else if (rating === 3) {
      // Good - interval * ease_factor
      newInterval = Math.round(interval * newEaseFactor);
    } else {
      // Easy - interval * ease_factor * 1.3
      newInterval = Math.round(interval * newEaseFactor * 1.3);
    }
  }

  return {
    ease_factor: newEaseFactor,
    interval: newInterval,
    repetitions: repetitions + 1,
    due_date: addDays(now, newInterval),
    state: 'review',
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: AnkiCard): boolean {
  const now = new Date();
  const dueDate = new Date(card.due_date);
  return dueDate <= now;
}

/**
 * Get cards due for review from a list
 */
export function getDueCards(cards: AnkiCard[]): AnkiCard[] {
  return cards.filter(isCardDue);
}

/**
 * Helper function to add minutes to a date
 */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Helper function to add days to a date
 */
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

/**
 * Format interval for display
 */
export function formatInterval(interval: number, state: string): string {
  if (state === 'new') return 'New';
  if (state === 'learning') return 'Learning';

  if (interval < 1) return '<1d';
  if (interval === 1) return '1 day';
  if (interval < 30) return `${interval} days`;
  if (interval < 365) return `${Math.round(interval / 30)} months`;
  return `${(interval / 365).toFixed(1)} years`;
}
