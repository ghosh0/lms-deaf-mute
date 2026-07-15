import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PlayCircle,
  Clock,
  FileText,
  HelpCircle,
  Heart,
  Landmark,
  Orbit,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCourseById, getQuizByCourse } from '@/data/courses';

const iconMap: Record<string, typeof Heart> = {
  heart: Heart,
  landmark: Landmark,
  orbit: Orbit,
};

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courseId ? getCourseById(courseId) : undefined;

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="mt-2 text-muted-foreground">
          The course you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-6">
          <Link to="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const Icon = iconMap[course.icon] ?? BookOpen;
  const quiz = getQuizByCourse(course.id);

  return (
    <div className="animate-fade-in-up">
      <div
        className="relative overflow-hidden border-b border-border"
        style={{ background: course.color }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/courses')}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All courses
          </button>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <Badge className="bg-white/90 text-foreground hover:bg-white">
                {course.category}
              </Badge>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-2 max-w-2xl text-white/90">{course.longDescription}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold tracking-tight">Lessons</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Watch any lesson — no enrollment required.
            </p>
            <div className="mt-5 space-y-3">
              {course.lessons.map((lesson, idx) => (
                <Card
                  key={lesson.id}
                  className="group transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{lesson.title}</h3>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {lesson.duration}
                        </span>
                        {lesson.materials.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {lesson.materials.length} material
                            {lesson.materials.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() =>
                        navigate(`/courses/${course.id}/lessons/${lesson.id}`)
                      }
                    >
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Watch
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold">Course info</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subject</dt>
                    <dd className="font-medium">{course.subject}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Lessons</dt>
                    <dd className="font-medium">{course.lessons.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="font-medium text-primary">Free</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Enrollment</dt>
                    <dd className="font-medium">Not required</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {quiz && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Test your knowledge</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Take a {quiz.questions.length}-question quiz on this course.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => navigate(`/courses/${course.id}/quiz`)}
                  >
                    Start quiz
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">Why this course is free</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mudraa believes learning should be accessible to everyone. No paywalls,
                  no subscriptions — just open education for the community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
