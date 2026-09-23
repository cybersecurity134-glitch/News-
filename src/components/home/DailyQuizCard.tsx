/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { HelpCircle, Award, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DAILY_QUIZ } from '../../data/mockNews';
import { useQuiz } from '../../context/QuizContext';

interface DailyQuizCardProps {
  onStartQuiz: () => void;
}

export const DailyQuizCard: React.FC<DailyQuizCardProps> = memo(({ onStartQuiz }) => {
  const { state } = useQuiz();

  return (
    <section className="w-full liquid-glass-card p-5 sm:p-6 overflow-hidden relative group">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full rounded-[14px] bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                Daily Cognitive Drill
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{state.streakDays} Day Streak</span>
              </div>
            </div>

            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] leading-tight mb-1">
              {DAILY_QUIZ.title}
            </h3>

            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 max-w-lg">
              {DAILY_QUIZ.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
          {state.isCompleted ? (
            <button
              onClick={onStartQuiz}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[var(--accent-emerald)]/15 border border-[var(--accent-emerald)]/30 text-[var(--accent-emerald)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 tap-target-44 interactive-press"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed ({state.score}/{state.totalQuestions} pts) · Review</span>
            </button>
          ) : (
            <button
              onClick={onStartQuiz}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-indigo)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm tap-target-44 interactive-press transition-all"
            >
              <span>Take Quiz ({DAILY_QUIZ.questions.length} Qs)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

DailyQuizCard.displayName = 'DailyQuizCard';
