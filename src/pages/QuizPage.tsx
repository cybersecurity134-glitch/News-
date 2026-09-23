/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { DAILY_QUIZ } from '../data/mockNews';
import { useQuiz } from '../context/QuizContext';

export const QuizPage: React.FC = () => {
  const { state, submitAnswer, finishQuiz, resetTodayQuiz, accuracyRate } = useQuiz();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const questions = DAILY_QUIZ.questions;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    submitAnswer(currentQ.id, index);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Calculate total correct
      let correct = 0;
      questions.forEach((q) => {
        const userChoice = state.userAnswers[q.id];
        if (userChoice === q.correctIndex) correct++;
      });
      finishQuiz(correct, questions.length);
    }
  };

  const handleRestart = () => {
    resetTodayQuiz();
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Quiz Header Banner */}
      <div className="liquid-glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
              Exam & Interview Prep
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">·</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{state.streakDays} Day Streak</span>
            </div>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            {DAILY_QUIZ.title}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {DAILY_QUIZ.date} · 5 High-Yield Questions
          </p>
        </div>

        {/* Global Accuracy Metric */}
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-3 shrink-0">
          <div className="text-center">
            <span className="block text-xs text-[var(--text-tertiary)] font-bold">Accuracy</span>
            <span className="text-lg font-black text-[var(--accent-primary)] tabular-nums">
              {accuracyRate}%
            </span>
          </div>
          <div className="h-7 w-px bg-[var(--border-subtle)]" />
          <div className="text-center">
            <span className="block text-xs text-[var(--text-tertiary)] font-bold">Completed</span>
            <span className="text-lg font-black text-[var(--accent-teal)] tabular-nums">
              {state.totalQuizzesTaken}
            </span>
          </div>
        </div>
      </div>

      {/* If Finished / Completed */}
      {state.isCompleted ? (
        <div className="liquid-glass-card p-6 sm:p-8 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-xl">
            <div className="w-full h-full rounded-[22px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Award className="w-10 h-10" />
            </div>
          </div>

          <div>
            <h2 className="font-black text-2xl text-[var(--text-primary)]">
              Quiz Completed!
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              You scored <span className="font-bold text-[var(--accent-primary)]">{state.score}</span> out of{' '}
              <span className="font-bold">{state.totalQuestions}</span> questions.
            </p>
          </div>

          {/* Streak Boost */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-sm mx-auto flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Flame className="w-4 h-4 fill-current text-rose-500" />
            <span>Streak extended to {state.streakDays} days! Come back tomorrow for 5 new questions.</span>
          </div>

          {/* Question Review Cards */}
          <div className="space-y-4 text-left pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-secondary)]">
              Answer Review & Explanations
            </h3>
            {questions.map((q, idx) => {
              const userAns = state.userAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div key={q.id} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[var(--text-primary)]">
                      {idx + 1}. {q.question}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-emerald)] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--accent-coral)] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    <strong className="text-[var(--accent-emerald)]">Correct:</strong> {q.options[q.correctIndex]}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed bg-white/40 dark:bg-white/5 p-2 rounded-xl">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold tap-target-44 interactive-press inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Today's Quiz</span>
          </button>
        </div>
      ) : (
        /* Active Question Card */
        <div className="liquid-glass-card p-5 sm:p-7 space-y-6">
          {/* Question Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-bold mb-2">
              <span>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[var(--accent-primary)] font-extrabold">
                {currentQ.domain}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-teal)] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] leading-snug">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const isCorrect = currentQ.correctIndex === oIdx;

              let optionStyle = 'bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border-white/40 dark:border-white/10 text-[var(--text-primary)]';

              if (showExplanation) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold';
                } else {
                  optionStyle = 'opacity-50 bg-black/5 dark:bg-white/5 border-transparent';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={showExplanation}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all tap-target-44 flex items-center justify-between gap-3 ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-[var(--accent-primary)]/8 dark:bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20 space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Editorial Explanation</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs sm:text-sm font-bold flex items-center gap-2 tap-target-44 interactive-press shadow-sm"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
