'use client';

import { Question } from './QuizSocket';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (questionId: number, optionIndex: number) => void;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
}: QuizQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Question {questionNumber} of {totalQuestions}
        </h3>
        <span className="badge badge-primary">
          {Math.round((questionNumber / totalQuestions) * 100)}%
        </span>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{question.questionText}</h2>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSubmitAnswer(question.id, index)}
                className="btn btn-outline w-full text-left normal-case"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 