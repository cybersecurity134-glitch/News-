/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DAILY_QUIZ } from '../data/mockNews';

interface QuizState {
  currentQuizId: string;
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
  userAnswers: Record<string, number>;
  streakDays: number;
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  totalAnsweredQuestions: number;
}

interface QuizContextType {
  state: QuizState;
  submitAnswer: (questionId: string, optionIndex: number) => void;
  finishQuiz: (finalScore: number, total: number) => void;
  resetTodayQuiz: () => void;
  accuracyRate: number;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const QUIZ_STORAGE_KEY = 'aura_quiz_v1';

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            currentQuizId: DAILY_QUIZ.id,
            isCompleted: parsed.isCompleted || false,
            score: parsed.score || 0,
            totalQuestions: DAILY_QUIZ.questions.length,
            userAnswers: parsed.userAnswers || {},
            streakDays: parsed.streakDays || 5,
            totalQuizzesTaken: parsed.totalQuizzesTaken || 8,
            totalCorrectAnswers: parsed.totalCorrectAnswers || 34,
            totalAnsweredQuestions: parsed.totalAnsweredQuestions || 40,
          };
        }
      } catch {
        // fallback
      }
    }
    return {
      currentQuizId: DAILY_QUIZ.id,
      isCompleted: false,
      score: 0,
      totalQuestions: DAILY_QUIZ.questions.length,
      userAnswers: {},
      streakDays: 5,
      totalQuizzesTaken: 8,
      totalCorrectAnswers: 34,
      totalAnsweredQuestions: 40,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const submitAnswer = (questionId: string, optionIndex: number) => {
    setState((prev) => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: optionIndex,
      },
    }));
  };

  const finishQuiz = (finalScore: number, total: number) => {
    setState((prev) => ({
      ...prev,
      isCompleted: true,
      score: finalScore,
      totalQuestions: total,
      streakDays: prev.streakDays + 1,
      totalQuizzesTaken: prev.totalQuizzesTaken + 1,
      totalCorrectAnswers: prev.totalCorrectAnswers + finalScore,
      totalAnsweredQuestions: prev.totalAnsweredQuestions + total,
    }));
  };

  const resetTodayQuiz = () => {
    setState((prev) => ({
      ...prev,
      isCompleted: false,
      score: 0,
      userAnswers: {},
    }));
  };

  const accuracyRate =
    state.totalAnsweredQuestions > 0
      ? Math.round((state.totalCorrectAnswers / state.totalAnsweredQuestions) * 100)
      : 85;

  return (
    <QuizContext.Provider
      value={{
        state,
        submitAnswer,
        finishQuiz,
        resetTodayQuiz,
        accuracyRate,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
