'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { QuizSocketProvider, useQuizSocket, Question } from '@/components/quiz/QuizSocket';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';

function QuizContent() {
  const { socket, isConnected, error } = useQuizSocket();
  const { getUser } = useAuthStore();
  const user = getUser();
  console.log(user);

  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStatus, setQuizStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('userJoined', (data) => {
      addToLog(`User ${data.userId} joined the quiz`);
    });

    socket.on('quizStarted', (data) => {
      addToLog('Quiz started');
      setQuestions(data.questions);
      setQuizStatus('active');
    });

    socket.on('answerSubmitted', (data) => {
      addToLog(`Answer submitted - Correct: ${data.isCorrect}`);
    });

    socket.on('quizEnded', (data) => {
      addToLog('Quiz ended');
      if (data.results) {
        addToLog(`Final Score: ${data.results.score}`);
      }
      setQuizStatus('completed');
    });

    return () => {
      socket.off('userJoined');
      socket.off('quizStarted');
      socket.off('answerSubmitted');
      socket.off('quizEnded');
    };
  }, [socket]);

  const addToLog = (message: string) => {
    setEventLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };

  const handleJoinQuiz = (id: number) => {
    if (!socket || !user) return;
    setQuizId(id);
    socket.emit('joinQuiz', { quizId: id, userId: user.id });
    addToLog(`Joining quiz ${id}`);
  };

  const handleSubmitAnswer = (questionId: number, optionIndex: number) => {
    if (!socket || !user || !quizId) return;

    socket.emit('submitAnswer', {
      quizId,
      questionId,
      userId: user.id,
      selectedOptionIndex: optionIndex
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizStatus('completed');
    }
  };

  if (!isConnected || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        {error ? (
          <>
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
            <p className="text-sm text-base-content/70">
              Please make sure you are logged in and the server is running.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="loading loading-spinner loading-lg"></div>
            <p>Connecting to quiz server...</p>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="alert alert-warning">
          <span>Please log in to participate in quizzes.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {quizStatus === 'waiting' && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Available Quizzes</h2>
            <div className="space-y-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quiz ID</span>
                </label>
                <div className="join">
                  <input
                    type="number"
                    className="input input-bordered join-item"
                    placeholder="Enter Quiz ID"
                    onChange={(e) => setQuizId(Number(e.target.value))}
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={() => quizId && handleJoinQuiz(quizId)}
                    disabled={!socket || !isConnected}
                  >
                    Join Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {quizStatus === 'active' && questions.length > 0 && (
        <QuizQuestion
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onSubmitAnswer={handleSubmitAnswer}
        />
      )}

      {quizStatus === 'completed' && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Quiz Completed</h2>
            <p>Please wait for the final results.</p>
          </div>
        </div>
      )}

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Event Log</h2>
          <div className="h-48 overflow-y-auto space-y-1">
            {eventLog.map((log, index) => (
              <div key={index} className="text-sm p-2 bg-base-300 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <QuizSocketProvider>
      <QuizContent />
    </QuizSocketProvider>
  );
} 