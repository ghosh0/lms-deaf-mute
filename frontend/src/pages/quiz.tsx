import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCourseById, getQuizByCourse } from '@/data/courses';
import { cn } from '@/lib/utils';

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courseId ? getCourseById(courseId) : undefined;
  const quiz = courseId ? getQuizByCourse(courseId) : undefined;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    quiz ? Array(quiz.questions.length).fill(null) : []
  );
  const [submitted, setSubmitted] = useState(false);

  if (!course || !quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Quiz not found</h1>
        <Button asChild className="mt-6">
          <Link to="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const total = quiz.questions.length;
  const question = quiz.questions[current];
  const selected = answers[current];

  const score = answers.reduce<number>(
    (acc, ans, i) => (ans === quiz.questions[i].correctIndex ? acc + 1 : acc),
    0
  );

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });
  };

  const handleSubmit = () => {
    if (answers.some((a) => a === null)) return;
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers(Array(total).fill(null));
    setCurrent(0);
    setSubmitted(false);
  };

  const isAnswered = selected !== null;

  return (
    <div className="animate-fade-in-up">
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {course.title}
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {quiz.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} multiple-choice questions
          </p>

          {/* Progress */}
          <div className="mt-5 flex items-center gap-2">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => !submitted && setCurrent(i)}
                disabled={submitted}
                className={cn(
                  'h-2.5 flex-1 rounded-full transition-colors',
                  i === current
                    ? 'bg-primary'
                    : answers[i] !== null
                      ? 'bg-primary/40'
                      : 'bg-border'
                )}
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Question {current + 1} of {total}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {submitted ? (
          /* Results */
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-10 text-center text-primary-foreground">
                <Trophy className="mx-auto h-12 w-12" />
                <h2 className="mt-3 text-3xl font-extrabold">
                  {score} / {total}
                </h2>
                <p className="mt-1 text-primary-foreground/90">
                  {score === total
                    ? 'Perfect score! Excellent work.'
                    : score >= total / 2
                      ? 'Good job! Keep practicing.'
                      : 'Keep learning — you can do this!'}
                </p>
              </div>
              <div className="p-6">
                <h3 className="mb-4 font-bold">Review your answers</h3>
                <div className="space-y-4">
                  {quiz.questions.map((q, i) => {
                    const ans = answers[i];
                    const correct = ans === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-border p-4"
                      >
                        <div className="flex items-start gap-2">
                          {correct ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          ) : (
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{q.question}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Your answer:{' '}
                              <span
                                className={
                                  correct
                                    ? 'font-medium text-primary'
                                    : 'font-medium text-destructive'
                                }
                              >
                                {ans !== null ? q.options[ans] : '—'}
                              </span>
                            </p>
                            {!correct && (
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                Correct answer:{' '}
                                <span className="font-medium text-primary">
                                  {q.options[q.correctIndex]}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleRetry} className="sm:flex-1">
                    <RotateCcw className="mr-2 h-4 w-4" /> Try again
                  </Button>
                  <Button
                    variant="outline"
                    className="sm:flex-1"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Back to course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Question */
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-bold leading-relaxed">
                {question.question}
              </h2>
              <div className="mt-5 space-y-3">
                {question.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/40'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground'
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {current < total - 1 ? (
                  <Button
                    disabled={!isAnswered}
                    onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    disabled={answers.some((a) => a === null)}
                    onClick={handleSubmit}
                  >
                    Submit quiz <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
